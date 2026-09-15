import {
  verifyPassword,
  createSessionCookie,
  clearSessionCookie,
  isAuthenticatedRequest,
} from '../server/auth';

/**
 * Vercel Serverless Function entry point dedicated for /api/auth
 */
export default async function handler(req: any, res: any) {
  const url = req.url || '';
  const method = req.method?.toUpperCase();

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // keep
    }
  }

  // POST /api/auth/login or action=login
  if ((url.includes('/login') || body?.action === 'login') && method === 'POST') {
    const { password } = body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ ok: false, error: 'Password is required', message: 'Password is required' });
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    const result = verifyPassword(password, clientIp);
    if (!result.success) {
      const errorMsg = result.error || 'Incorrect password';
      return res.status(result.status || 401).json({
        ok: false,
        error: errorMsg,
        message: errorMsg,
      });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieHeader = createSessionCookie(isProduction);
    res.setHeader('Set-Cookie', cookieHeader);
    return res.status(200).json({ ok: true });
  }

  // GET /api/auth/check
  if (url.includes('/check') || method === 'GET') {
    const authenticated = isAuthenticatedRequest(req);
    return res.status(200).json({ authenticated });
  }

  // POST /api/auth/logout
  if (url.includes('/logout') && method === 'POST') {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieHeader = clearSessionCookie(isProduction);
    res.setHeader('Set-Cookie', cookieHeader);
    return res.status(200).json({ ok: true });
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}
