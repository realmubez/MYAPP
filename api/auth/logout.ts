const SESSION_COOKIE_NAME = 'my_learning_session';

function clearSessionCookie(isProduction: boolean): string {
  const secure = isProduction ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secure}`;
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
 * Vercel Serverless Function: POST /api/auth/logout
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
