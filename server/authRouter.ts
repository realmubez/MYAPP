import { Router, Request, Response } from 'express';
import {
  verifyPassword,
  createSessionCookie,
  clearSessionCookie,
  isAuthenticatedRequest,
} from './auth.ts';

export const authRouter = Router();

/**
 * POST /api/auth/login
 * Validates password server-side and issues HttpOnly session cookie.
 */
authRouter.post('/login', (req: Request, res: Response) => {
  const { password } = req.body || {};

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      ok: false,
      code: 'INVALID_REQUEST',
      error: 'Password is required',
      message: 'Password is required',
    });
  }

  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const result = verifyPassword(password, clientIp);

  if (!result.success) {
    const errorMsg = result.error || 'Incorrect password';
    return res.status(result.status || 401).json({
      ok: false,
      code: result.code || 'INVALID_PASSWORD',
      error: errorMsg,
      message: errorMsg,
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieHeader = createSessionCookie(isProduction);

  res.setHeader('Set-Cookie', cookieHeader);
  return res.status(200).json({ ok: true });
});

/**
 * GET /api/auth/check and GET /api/auth/session
 * Verifies if the request currently holds a valid session.
 */
const handleSessionCheck = (req: Request, res: Response) => {
  const authenticated = isAuthenticatedRequest(req);
  return res.status(200).json({ authenticated, ok: authenticated });
};

authRouter.get('/check', handleSessionCheck);
authRouter.get('/session', handleSessionCheck);

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieHeader = clearSessionCookie(isProduction);

  res.setHeader('Set-Cookie', cookieHeader);
  return res.status(200).json({ ok: true });
});
