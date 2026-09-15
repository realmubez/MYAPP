import crypto from 'node:crypto';

const SESSION_COOKIE_NAME = 'my_learning_session';

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

function verifySessionToken(token: string | undefined): boolean {
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

function parseCookies(cookieHeader?: string): Record<string, string> {
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
 * Vercel Serverless Function: GET /api/auth/session
 * Completely self-contained with NO local relative imports.
 */
export default async function handler(req: any, res: any) {
  try {
    const method = req.method?.toUpperCase();
    if (method !== 'GET') {
      return sendJsonResponse(
        res,
        405,
        { ok: false, code: 'METHOD_NOT_ALLOWED', error: 'Method not allowed' },
        { Allow: 'GET' }
      );
    }

    const cookieHeader = req?.headers?.cookie || req?.headers?.get?.('cookie');
    const cookies = parseCookies(cookieHeader);
    const sessionToken = cookies[SESSION_COOKIE_NAME];
    const isAuthenticated = verifySessionToken(sessionToken);

    return sendJsonResponse(res, 200, {
      authenticated: isAuthenticated,
      ok: isAuthenticated,
    });
  } catch (err) {
    console.error('[AUTH_SESSION_RUNTIME_ERROR]', {
      name: err instanceof Error ? err.name : 'UnknownError',
      message: err instanceof Error ? err.message : String(err),
    });

    return sendJsonResponse(res, 200, {
      authenticated: false,
      ok: false,
    });
  }
}
