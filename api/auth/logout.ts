import {
  clearSessionCookie,
  sendJsonResponse,
} from './_authCore.ts';

/**
 * Vercel Serverless Function: POST /api/auth/logout
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

    const isProduction =
      process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
    const cookieHeader = clearSessionCookie(isProduction);

    return sendJsonResponse(
      res,
      200,
      { ok: true },
      { 'Set-Cookie': cookieHeader }
    );
  } catch (err) {
    console.error('[AUTH_LOGOUT_RUNTIME_ERROR]', {
      name: err instanceof Error ? err.name : 'UnknownError',
      message: err instanceof Error ? err.message : String(err),
    });

    return sendJsonResponse(res, 200, { ok: true });
  }
}
