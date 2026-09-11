import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'my_learning_session';

// 30 days in milliseconds
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60;

// Rate limiting in-memory storage: IP -> { count, lockUntil, lastAttempt }
interface RateLimitRecord {
  count: number;
  lockUntil: number;
  lastAttempt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.lockUntil && now - record.lastAttempt > 60 * 60 * 1000) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

/**
 * Gets the server-side signing secret derived from the configured password or environment.
 */
function getSigningSecret(): string {
  const password = process.env.MY_LEARNING_PASSWORD || '';
  if (!password) {
    // Development fallback if not set yet, logs warning
    if (process.env.NODE_ENV !== 'production') {
      return 'mylearning-default-dev-secret-change-in-production-env';
    }
    return 'mylearning-unconfigured-secret';
  }
  // Derive a strong HMAC key using SHA-256
  return crypto.createHash('sha256').update(`mylearning-salt:${password}`).digest('hex');
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
    // Expired session
    return false;
  }

  const payload = `v1.${expStr}.${randomHex}`;
  const expectedSignature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

/**
 * Verifies the submitted password against MY_LEARNING_PASSWORD with brute-force rate-limiting.
 */
export function verifyPassword(
  inputPassword: string,
  clientIp: string
): { success: boolean; error?: string; status?: number } {
  const now = Date.now();
  const normalizedIp = clientIp || '127.0.0.1';

  // Check rate limit
  const record = rateLimitMap.get(normalizedIp);
  if (record && now < record.lockUntil) {
    const minutesLeft = Math.ceil((record.lockUntil - now) / 60000);
    return {
      success: false,
      status: 429,
      error: `Too many failed attempts. Please try again in ${minutesLeft} minute${
        minutesLeft === 1 ? '' : 's'
      }.`,
    };
  }

  let targetPassword = process.env.MY_LEARNING_PASSWORD;

  if (!targetPassword) {
    if (process.env.NODE_ENV !== 'production') {
      targetPassword = 'mylearning';
      console.warn(
        '[AUTH NOTICE] MY_LEARNING_PASSWORD is not set in environment variables. Using development password "mylearning". Please define MY_LEARNING_PASSWORD in your .env file or Vercel settings.'
      );
    } else {
      return {
        success: false,
        status: 500,
        error: 'Server authentication is not configured. Please set MY_LEARNING_PASSWORD in environment variables.',
      };
    }
  }

  // Constant-time comparison to prevent timing attacks
  const inputHash = crypto.createHash('sha256').update(inputPassword || '').digest();
  const targetHash = crypto.createHash('sha256').update(targetPassword).digest();

  const isMatch = crypto.timingSafeEqual(inputHash, targetHash);

  if (isMatch) {
    // Reset failed attempts on success
    rateLimitMap.delete(normalizedIp);
    return { success: true };
  }

  // Handle failed attempt
  const currentCount = (record?.count || 0) + 1;
  let lockUntil = 0;

  // If 5 failed attempts reached, lock out for 15 minutes
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
    error: 'Incorrect password',
  };
}

/**
 * Creates the Set-Cookie header string for an authenticated session.
 */
export function createSessionCookie(isProduction: boolean): string {
  const token = generateSessionToken();
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
  const secure = isProduction ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

/**
 * Creates the Set-Cookie header string to clear/invalidate the session.
 */
export function clearSessionCookie(isProduction: boolean): string {
  const secure = isProduction ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secure}`;
}

/**
 * Parses cookies from cookie header string.
 */
export function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx < 0) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    if (key) {
      cookies[key] = decodeURIComponent(val);
    }
  }

  return cookies;
}

/**
 * Checks whether an incoming HTTP request has a valid session cookie.
 */
export function isAuthenticatedRequest(req: any): boolean {
  const cookieHeader = req?.headers?.cookie || req?.headers?.get?.('cookie');
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies[SESSION_COOKIE_NAME];
  return verifySessionToken(sessionToken);
}
