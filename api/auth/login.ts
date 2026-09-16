import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const SESSION_COOKIE_NAME = 'my_learning_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export interface AppIdentity {
  appUserId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'student';
}

// In-memory rate limiting map for brute-force protection
const rateLimitMap = new Map<string, { count: number; lockUntil: number; lastAttempt: number }>();

function cleanupStaleRateLimits(): void {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.lockUntil && now - record.lastAttempt > 60 * 60 * 1000) {
      rateLimitMap.delete(ip);
    }
  }
}

function getSigningSecret(): string {
  const password = process.env.MY_LEARNING_PASSWORD || '';
  const explicitSecret = process.env.SESSION_SECRET || '';
  const secretSource = explicitSecret || password;

  if (!secretSource) {
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      return 'mylearning-dev-secret-local-only';
    }
    return 'mylearning-unconfigured-secret-fallback';
  }

  return crypto.createHash('sha256').update(`mylearning-salt:${secretSource}`).digest('hex');
}

function generateSessionToken(): string {
  const exp = Date.now() + SESSION_DURATION_MS;
  const randomHex = crypto.randomBytes(16).toString('hex');
  const payload = `v1.${exp}.${randomHex}`;
  const signature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('hex');

  return `${payload}.${signature}`;
}

function createSessionCookie(isProduction: boolean): string {
  const token = generateSessionToken();
  const secure = isProduction ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}

function verifyPassword(inputPassword: unknown, clientIp: string) {
  const now = Date.now();
  const normalizedIp = clientIp || '127.0.0.1';

  if (typeof inputPassword !== 'string' || !inputPassword.trim()) {
    return {
      success: false,
      status: 400,
      code: 'INVALID_REQUEST',
      error: 'Password is required',
      message: 'Password is required',
    };
  }

  if (rateLimitMap.size > 100) {
    cleanupStaleRateLimits();
  }

  const record = rateLimitMap.get(normalizedIp);
  if (record && now < record.lockUntil) {
    const minutesLeft = Math.max(1, Math.ceil((record.lockUntil - now) / 60000));
    return {
      success: false,
      status: 429,
      code: 'RATE_LIMITED',
      error: `Too many failed attempts. Please try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
      message: `Too many failed attempts. Please try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
    };
  }

  let targetPassword = process.env.MY_LEARNING_PASSWORD;

  if (!targetPassword) {
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      targetPassword = 'mylearning';
    } else {
      console.error('[AUTH CONFIG ERROR] MY_LEARNING_PASSWORD is missing at runtime.');
      return {
        success: false,
        status: 500,
        code: 'AUTH_CONFIG_ERROR',
        error: 'Authentication service unavailable',
        message: 'Authentication service unavailable',
      };
    }
  }

  const inputHash = crypto.createHash('sha256').update(inputPassword).digest();
  const targetHash = crypto.createHash('sha256').update(targetPassword).digest();

  const isMatch =
    inputHash.length === targetHash.length && crypto.timingSafeEqual(inputHash, targetHash);

  if (isMatch) {
    rateLimitMap.delete(normalizedIp);
    return { success: true, status: 200 };
  }

  const currentCount = (record?.count || 0) + 1;
  let lockUntil = 0;
  if (currentCount >= 5) {
    lockUntil = now + 15 * 60 * 1000;
  }

  rateLimitMap.set(normalizedIp, {
    count: currentCount,
    lockUntil,
    lastAttempt: now,
  });

  return {
    success: false,
    status: 401,
    code: 'INVALID_PASSWORD',
    error: 'Incorrect password',
    message: 'Incorrect password',
  };
}

/**
 * Resolves application identity based on login credentials.
 * Defaults to Admin ('mubez') for the primary MY_LEARNING_PASSWORD.
 */
function resolveAppIdentity(username?: string): AppIdentity {
  const normalizedUser = (username || 'mubez').toLowerCase().trim();
  if (normalizedUser === 'mubez' || normalizedUser === 'admin') {
    return {
      appUserId: 'mubez',
      email: 'mubez@mylearning.internal',
      displayName: 'Mubez',
      role: 'admin',
    };
  }
  // Prepared for future Friend 1 and Friend 2 expansion
  return {
    appUserId: normalizedUser,
    email: `${normalizedUser}@mylearning.internal`,
    displayName: normalizedUser.charAt(0).toUpperCase() + normalizedUser.slice(1),
    role: 'student',
  };
}

/**
 * Bridges application identity with Supabase Auth to obtain a real Supabase session.
 * Operates purely on the server using SUPABASE_SERVICE_ROLE_KEY.
 * Never exposes the service-role key or internal passwords to the client.
 */
async function getSupabaseAuthSession(identity: AppIdentity) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || serviceRoleKey;

  if (!supabaseUrl || !serviceRoleKey || !supabaseUrl.startsWith('http')) {
    // Supabase not configured in environment yet; return null session for graceful offline/local-first mode
    return null;
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Generate a deterministic internal password derived from the server-only service role secret
    const deterministicUserPassword = crypto
      .createHmac('sha256', serviceRoleKey)
      .update(`mylearning-supabase-internal-user-auth:${identity.appUserId}`)
      .digest('hex');

    // 1. Try to find or create the user in Supabase Auth
    let targetUid: string | null = null;
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: identity.email,
      password: deterministicUserPassword,
      email_confirm: true,
      user_metadata: {
        display_name: identity.displayName,
        role: identity.role,
        is_admin: identity.role === 'admin',
      },
    });

    if (createData?.user) {
      targetUid = createData.user.id;
    } else if (createError) {
      // User might already exist in auth.users
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
      const existingUser = (listData?.users as any[])?.find((u: any) => u.email === identity.email);
      if (existingUser) {
        targetUid = existingUser.id;
        // Update user metadata and ensure password is synced
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: deterministicUserPassword,
          email_confirm: true,
          user_metadata: {
            display_name: identity.displayName,
            role: identity.role,
            is_admin: identity.role === 'admin',
          },
        });
      }
    }

    // 2. Sign in to obtain a genuine Supabase Auth JWT and refresh token
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
      email: identity.email,
      password: deterministicUserPassword,
    });

    if (signInData?.session) {
      return {
        session: {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
          expires_at: signInData.session.expires_at,
          expires_in: signInData.session.expires_in,
          token_type: signInData.session.token_type,
          user: {
            id: signInData.session.user.id,
            email: signInData.session.user.email,
          },
        },
        supabaseUserId: signInData.session.user.id,
      };
    }

    if (signInError) {
      console.warn('[SUPABASE_SIGNIN_WARN] Unable to sign in bridged user:', signInError.message);
    }
  } catch (err) {
    console.warn('[SUPABASE_AUTH_BRIDGE_ERROR]', err instanceof Error ? err.message : String(err));
  }

  return null;
}

function getClientIp(req: any): string {
  try {
    const forwarded = req?.headers?.['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0 && typeof forwarded[0] === 'string') {
      return forwarded[0].split(',')[0].trim();
    }
    const realIp = req?.headers?.['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim()) {
      return realIp.trim();
    }
    return req?.socket?.remoteAddress || '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}

async function parseRequestBody(req: any): Promise<any> {
  if (req?.body !== undefined && req?.body !== null) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
  }

  if (typeof req?.on === 'function') {
    return new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk: any) => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({});
        }
      });
      req.on('error', () => resolve({}));
    });
  }

  return {};
}

function sendJsonResponse(res: any, status: number, data: any, headers?: Record<string, string>): void {
  if (res.headersSent) return;

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      if (typeof res.setHeader === 'function') {
        res.setHeader(key, value);
      }
    }
  }

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(status).json(data);
    return;
  }

  if (typeof res.writeHead === 'function' && typeof res.end === 'function') {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }
}

/**
 * Vercel Serverless Function: POST /api/auth/login
 * Completely self-contained with NO local relative imports.
 */
export default async function handler(req: any, res: any) {
  try {
    const method = req.method?.toUpperCase();
    if (method !== 'POST') {
      return sendJsonResponse(
        res,
        405,
        { ok: false, code: 'METHOD_NOT_ALLOWED', error: 'Method not allowed' },
        { Allow: 'POST' }
      );
    }

    const body = await parseRequestBody(req);
    const password = body?.password;
    const username = body?.username;
    const clientIp = getClientIp(req);

    const verification = verifyPassword(password, clientIp);

    if (!verification.success) {
      return sendJsonResponse(res, verification.status, {
        ok: false,
        code: verification.code,
        error: verification.error,
        message: verification.message,
      });
    }

    const identity = resolveAppIdentity(username);
    const authBridgeResult = await getSupabaseAuthSession(identity);

    const isProduction =
      process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
    const cookieHeader = createSessionCookie(isProduction);

    return sendJsonResponse(
      res,
      200,
      {
        ok: true,
        session: authBridgeResult?.session || null,
        user: {
          id: authBridgeResult?.supabaseUserId || identity.appUserId,
          role: identity.role,
          displayName: identity.displayName,
          email: identity.email,
        },
      },
      { 'Set-Cookie': cookieHeader }
    );
  } catch (err) {
    console.error('[AUTH_LOGIN_RUNTIME_ERROR]', {
      name: err instanceof Error ? err.name : 'UnknownError',
      message: err instanceof Error ? err.message : String(err),
    });

    return sendJsonResponse(res, 500, {
      ok: false,
      code: 'AUTH_INTERNAL_ERROR',
      error: 'Authentication service unavailable',
    });
  }
}
