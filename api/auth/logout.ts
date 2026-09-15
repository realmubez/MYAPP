import { clearSessionCookie } from '../../server/auth';

/**
 * POST /api/auth/logout
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

    const isProduction =
      process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
    const cookieHeader = clearSessionCookie(isProduction);

    if (typeof res.setHeader === 'function') {
      res.setHeader('Set-Cookie', cookieHeader);
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    const errName = err?.name || 'Error';
    const errMessage = err?.message || 'Internal server error';
    console.error(`[AUTH_LOGOUT_ERROR] ${errName}: ${errMessage}`);
    return res.status(200).json({ ok: true });
  }
}
