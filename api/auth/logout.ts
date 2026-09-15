import { clearSessionCookie } from '../../server/auth';

/**
 * POST /api/auth/logout
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

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieHeader = clearSessionCookie(isProduction);
  res.setHeader('Set-Cookie', cookieHeader);
  return res.status(200).json({ ok: true });
}
