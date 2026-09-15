import {
  verifyPassword,
  createSessionCookie,
  getClientIp,
  parseRequestBody,
  sendJsonResponse,
} from './_authCore.ts';

/**
 * Vercel Serverless Function: POST /api/auth/login
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
