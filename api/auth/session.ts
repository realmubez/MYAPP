import {
  parseCookies,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  sendJsonResponse,
} from './_authCore.ts';

/**
 * Vercel Serverless Function: GET /api/auth/session
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
