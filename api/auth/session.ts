import { isAuthenticatedRequest } from '../../server/auth';

/**
 * GET /api/auth/session
 * Vercel Serverless Function entry point.
 */
export default async function handler(req: any, res: any) {
  try {
    if (req.method?.toUpperCase() !== 'GET') {
      if (typeof res.setHeader === 'function') {
        res.setHeader('Allow', 'GET');
      }
      return res.status(405).json({
        ok: false,
        code: 'METHOD_NOT_ALLOWED',
        error: 'Method not allowed',
        message: 'Method not allowed',
      });
    }

    const authenticated = isAuthenticatedRequest(req);
    return res.status(200).json({
      authenticated,
      ok: authenticated,
    });
  } catch (err: any) {
    const errName = err?.name || 'Error';
    const errMessage = err?.message || 'Internal server error';
    console.error(`[AUTH_SESSION_ERROR] ${errName}: ${errMessage}`);
    return res.status(200).json({
      authenticated: false,
      ok: false,
    });
  }
}
