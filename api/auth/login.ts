import { verifyPassword, createSessionCookie } from '../../server/auth';

/**
 * POST /api/auth/login
 * Vercel Serverless Function entry point.
 */
export default async function handler(req: any, res: any) {
  if (req.method?.toUpperCase() !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
      message: 'Method not allowed',
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // keep
    }
  }

  const { password } = body || {};
  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      ok: false,
      error: 'Password is required',
      message: 'Password is required',
    });
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
