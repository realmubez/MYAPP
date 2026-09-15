import crypto from 'node:crypto';

const SESSION_COOKIE_NAME = 'my_learning_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

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

    const isProduction =
      process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
    const cookieHeader = createSessionCookie(isProduction);

    return sendJsonResponse(
      res,
      200,
      { ok: true },
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
