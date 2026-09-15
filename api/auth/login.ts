import { verifyPassword, createSessionCookie } from '../../server/auth';

/**
 * Universal JSON body parser supporting Express, Node streams, and Edge runtimes.
 */
async function parseJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString('utf-8'));
    } catch {
      return {};
    }
  }
  if (typeof req.json === 'function') {
    try {
      return await req.json();
    } catch {
      return {};
    }
  }
  if (typeof req.on === 'function') {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(
          typeof chunk === 'string'
            ? Buffer.from(chunk)
            : Buffer.isBuffer(chunk)
            ? chunk
            : Buffer.from(chunk)
        );
      }
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Safely extracts client IP without throwing if headers are arrays or objects.
 */
function getClientIp(req: any): string {
  try {
    const forwarded = req?.headers?.['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
      return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0 && typeof forwarded[0] === 'string') {
      return forwarded[0].split(',')[0].trim();
    }
    const realIp = req?.headers?.['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim().length > 0) {
      return realIp.trim();
    }
    return req?.socket?.remoteAddress || '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}

/**
 * POST /api/auth/login
 * Vercel Serverless Function entry point.
 */
export default async function handler(req: any, res: any) {
  try {
    if (req.method?.toUpperCase() !== 'POST') {
      if (typeof res.setHeader === 'function') {
        res.setHeader('Allow', 'POST');
      }
      return res.status(405).json({
        ok: false,
        code: 'METHOD_NOT_ALLOWED',
        error: 'Method not allowed',
        message: 'Method not allowed',
      });
    }

    const body = await parseJsonBody(req);
    const { password } = body || {};

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        ok: false,
        code: 'INVALID_REQUEST',
        error: 'Password is required',
        message: 'Password is required',
      });
    }

    const clientIp = getClientIp(req);

    // Safe sanitized diagnostic log for Vercel logs
    console.log(
      `[AUTH] Attempt received. VERCEL=${Boolean(process.env.VERCEL)}, VERCEL_ENV=${
        process.env.VERCEL_ENV || 'unset'
      }, NODE_ENV=${process.env.NODE_ENV}, MY_LEARNING_PASSWORD configured: ${Boolean(
        process.env.MY_LEARNING_PASSWORD && process.env.MY_LEARNING_PASSWORD.trim().length > 0
      )}`
    );

    const result = verifyPassword(password, clientIp);

    if (!result.success) {
      const errorMsg = result.error || 'Incorrect password';
      return res.status(result.status || 401).json({
        ok: false,
        code: result.code || 'INVALID_PASSWORD',
        error: errorMsg,
        message: errorMsg,
      });
    }

    const isProduction =
      process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
    const cookieHeader = createSessionCookie(isProduction);

    if (typeof res.setHeader === 'function') {
      res.setHeader('Set-Cookie', cookieHeader);
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    const errName = err?.name || 'Error';
    const errMessage = err?.message || 'Internal server error';
    console.error(`[AUTH_INTERNAL_ERROR] ${errName}: ${errMessage}`);

    return res.status(500).json({
      ok: false,
      code: 'AUTH_INTERNAL_ERROR',
      error: 'Authentication service unavailable',
      message: 'Authentication service unavailable',
    });
  }
}
