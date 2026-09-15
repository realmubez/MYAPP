import { isAuthenticatedRequest } from '../../server/auth';

/**
 * GET /api/auth/session
 * Vercel Serverless Function entry point.
 */
export default async function handler(req: any, res: any) {
  if (req.method?.toUpperCase() !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
      message: 'Method not allowed',
    });
  }

  const authenticated = isAuthenticatedRequest(req);
  return res.status(200).json({
    authenticated,
    ok: authenticated,
  });
}
