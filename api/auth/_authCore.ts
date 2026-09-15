import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'my_learning_session';
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

interface RateLimitRecord {
  count: number;
  lockUntil: number;
  lastAttempt: number;
}

// In-memory rate limiting map. In serverless, each instance gets its own memory.
const rateLimitMap = new Map<string, RateLimitRecord>();

function cleanupStaleRateLimits(): void {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.lockUntil && now - record.lastAttempt > 60 * 60 * 1000) {
      rateLimitMap.delete(ip);
    }
  }
}

/**
 * Derives a secure HMAC signing secret at runtime from MY_LEARNING_PASSWORD or SESSION_SECRET.
 * Never throws at module load.
 */
export function getSigningSecret(): string {
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

/**
 * Generates a signed, stateless session token with expiration.
 * Format: v1.<expTimestamp>.<randomHex>.<hmacSignature>
 */
export function generateSessionToken(): string {
  const exp = Date.now() + SESSION_DURATION_MS;
  const randomHex = crypto.randomBytes(16).toString('hex');
  const payload = `v1.${exp}.${randomHex}`;
  const signature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('hex');

  return `${payload}.${signature}`;
}

/**
 * Verifies the integrity and freshness of a session token.
 */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 4) return false;

  const [version, expStr, randomHex, signature] = parts;
  if (version !== 'v1') return false;

  const exp = parseInt(expStr, 10);
  if (isNaN(exp) || exp < Date.now()) {
    return false;
  }

  const payload = `v1.${expStr}.${randomHex}`;
  const expectedSignature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (sigBuffer.length !== expectedBuffer.length || sigBuffer.length === 0) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

export interface VerifyPasswordResult {
  success: boolean;
  status: number;
  code?: 'INVALID_REQUEST' | 'AUTH_CONFIG_ERROR' | 'INVALID_PASSWORD' | 'RATE_LIMITED' | 'AUTH_INTERNAL_ERROR';
  error?: string;
  message?: string;
}

/**
 * Verifies submitted password against MY_LEARNING_PASSWORD with brute-force rate-limiting.
 */
export function verifyPassword(
  inputPassword: string | unknown,
  clientIp: string
): VerifyPasswordResult {
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

  // Pre-hash both strings to guarantee identical 32-byte length for timingSafeEqual
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

export function createSessionCookie(isProduction: boolean): string {
  const token = generateSessionToken();
  const secure = isProduction ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}

export function clearSessionCookie(isProduction: boolean): string {
  const secure = isProduction ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secure}`;
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return cookies;

  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx < 0) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    if (key) {
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        cookies[key] = val;
      }
    }
  }

  return cookies;
}

export function isAuthenticatedRequest(req: any): boolean {
  try {
    const cookieHeader = req?.headers?.cookie || req?.headers?.get?.('cookie');
    const cookies = parseCookies(cookieHeader);
    const sessionToken = cookies[SESSION_COOKIE_NAME];
    return verifySessionToken(sessionToken);
  } catch {
    return false;
  }
}

export function getClientIp(req: any): string {
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

export async function parseRequestBody(req: any): Promise<any> {
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

/**
 * Safe helper to send JSON response on any Node/Vercel response object.
 */
export function sendJsonResponse(res: any, status: number, data: any, headers?: Record<string, string>): void {
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
