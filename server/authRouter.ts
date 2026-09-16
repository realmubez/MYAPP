import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  verifyPassword,
  createSessionCookie,
  clearSessionCookie,
  isAuthenticatedRequest,
  getAuthenticatedUser,
  SessionUser,
  DEFAULT_ADMIN_USER,
} from './auth.ts';

export const authRouter = Router();

function getSupabaseClients() {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/["']/g, '').trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/["']/g, '').trim();
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || serviceRoleKey).replace(/["']/g, '').trim();

  if (!supabaseUrl || !serviceRoleKey || !supabaseUrl.startsWith('http')) {
    return null;
  }

  const normalizedOrigin = new URL(supabaseUrl).origin;

  const adminClient = createClient(normalizedOrigin, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authClient = createClient(normalizedOrigin, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return { adminClient, authClient, supabaseUrl: normalizedOrigin };
}

/**
 * POST /api/auth/login
 * Multi-user login: supports Admin (Mubez) & Students with individual Supabase accounts and disabled check.
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  const { password, username } = req.body || {};

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      ok: false,
      code: 'INVALID_REQUEST',
      error: 'Password is required',
      message: 'Password is required',
    });
  }

  const rawUsername = typeof username === 'string' ? username.trim() : '';
  const normalizedUser = (rawUsername || 'mubez').toLowerCase();
  const isAdminLogin = normalizedUser === 'mubez' || normalizedUser === 'admin';

  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const clients = getSupabaseClients();

  // Case 1: Mubez (Admin) primary password authentication
  if (isAdminLogin) {
    const verification = verifyPassword(password, clientIp);
    if (!verification.success) {
      const errorMsg = verification.error || 'Incorrect password';
      return res.status(verification.status || 401).json({
        ok: false,
        code: verification.code || 'INVALID_PASSWORD',
        error: errorMsg,
        message: errorMsg,
      });
    }

    let supabaseSession: any = null;
    let adminUid = DEFAULT_ADMIN_USER.id;
    let assignedSubjects: string[] = ['swedish', 'english', 'python', 'typing'];

    if (clients) {
      try {
        const deterministicUserPassword = crypto
          .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY || 'mylearning')
          .update(`mylearning-supabase-internal-user-auth:mubez`)
          .digest('hex');

        // Ensure user exists
        const { data: listData } = await clients.adminClient.auth.admin.listUsers({ perPage: 100 });
        const existingUser = (listData?.users as any[])?.find((u: any) => u.email === 'mubez@mylearning.internal');
        
        if (existingUser) {
          adminUid = existingUser.id;
          await clients.adminClient.auth.admin.updateUserById(existingUser.id, {
            password: deterministicUserPassword,
            email_confirm: true,
            user_metadata: {
              display_name: 'Mubez',
              role: 'admin',
              is_admin: true,
            },
          });
        }

        const { data: signInData } = await clients.authClient.auth.signInWithPassword({
          email: 'mubez@mylearning.internal',
          password: deterministicUserPassword,
        });

        if (signInData?.session) {
          supabaseSession = {
            access_token: signInData.session.access_token,
            refresh_token: signInData.session.refresh_token,
            expires_at: signInData.session.expires_at,
            expires_in: signInData.session.expires_in,
            token_type: signInData.session.token_type,
            user: {
              id: signInData.session.user.id,
              email: signInData.session.user.email,
            },
          };
          adminUid = signInData.session.user.id;
        }

        // Fetch subjects
        const { data: subData } = await clients.adminClient
          .from('profile_subjects')
          .select('subject_id')
          .eq('profile_id', adminUid);
        if (subData && subData.length > 0) {
          assignedSubjects = subData.map((s) => s.subject_id);
        }
      } catch (err) {
        console.warn('[ADMIN_AUTH_BRIDGE_WARN]', err instanceof Error ? err.message : String(err));
      }
    }

    const sessionUser: SessionUser = {
      id: adminUid,
      displayName: 'Mubez',
      role: 'admin',
      accountStatus: 'active',
      email: 'mubez@mylearning.internal',
      username: 'mubez',
    };

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieHeader = createSessionCookie(isProduction, sessionUser);
    res.setHeader('Set-Cookie', cookieHeader);

    return res.status(200).json({
      ok: true,
      session: supabaseSession,
      user: {
        id: sessionUser.id,
        role: sessionUser.role,
        displayName: sessionUser.displayName,
        email: sessionUser.email,
        accountStatus: sessionUser.accountStatus,
        assignedSubjects,
      },
    });
  }

  // Case 2: Student Login
  if (!clients) {
    return res.status(503).json({
      ok: false,
      code: 'AUTH_SERVICE_UNAVAILABLE',
      error: 'Authentication database is currently unavailable.',
      message: 'Authentication database is currently unavailable.',
    });
  }

  const targetEmail = normalizedUser.includes('@')
    ? normalizedUser
    : `${normalizedUser}@mylearning.internal`;

  try {
    // 1. Sign in against Supabase Auth
    const { data: signInData, error: signInError } = await clients.authClient.auth.signInWithPassword({
      email: targetEmail,
      password: password,
    });

    if (signInError || !signInData?.user) {
      return res.status(401).json({
        ok: false,
        code: 'INVALID_CREDENTIALS',
        error: 'Incorrect username or password.',
        message: 'Incorrect username or password.',
      });
    }

    const studentUid = signInData.user.id;

    // 2. Fetch profile and verify status
    const { data: profileRow, error: profileErr } = await clients.adminClient
      .from('profiles')
      .select('*')
      .eq('id', studentUid)
      .single();

    if (profileErr || !profileRow) {
      return res.status(404).json({
        ok: false,
        code: 'PROFILE_NOT_FOUND',
        error: 'User profile not found.',
        message: 'User profile not found.',
      });
    }

    // 3. Enforce account status check
    if (profileRow.account_status === 'disabled') {
      return res.status(403).json({
        ok: false,
        code: 'ACCOUNT_DISABLED',
        error: 'This account has been disabled. Please contact your administrator.',
        message: 'This account has been disabled. Please contact your administrator.',
      });
    }

    // 4. Fetch assigned subjects
    const { data: subData } = await clients.adminClient
      .from('profile_subjects')
      .select('subject_id')
      .eq('profile_id', studentUid);

    const assignedSubjects = subData && subData.length > 0
      ? subData.map((s) => s.subject_id)
      : ['swedish', 'english'];

    const sessionUser: SessionUser = {
      id: profileRow.id,
      displayName: profileRow.display_name,
      role: profileRow.role === 'admin' ? 'admin' : 'student',
      accountStatus: profileRow.account_status,
      email: targetEmail,
      username: normalizedUser,
    };

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieHeader = createSessionCookie(isProduction, sessionUser);
    res.setHeader('Set-Cookie', cookieHeader);

    return res.status(200).json({
      ok: true,
      session: {
        access_token: signInData.session?.access_token,
        refresh_token: signInData.session?.refresh_token,
        expires_at: signInData.session?.expires_at,
        expires_in: signInData.session?.expires_in,
        token_type: signInData.session?.token_type,
        user: {
          id: signInData.user.id,
          email: signInData.user.email,
        },
      },
      user: {
        id: sessionUser.id,
        role: sessionUser.role,
        displayName: sessionUser.displayName,
        email: sessionUser.email,
        accountStatus: sessionUser.accountStatus,
        assignedSubjects,
      },
    });
  } catch (err) {
    console.error('[STUDENT_LOGIN_ERROR]', err);
    return res.status(500).json({
      ok: false,
      code: 'AUTH_INTERNAL_ERROR',
      error: 'An unexpected authentication error occurred.',
      message: 'An unexpected authentication error occurred.',
    });
  }
});

/**
 * GET /api/auth/check and GET /api/auth/session
 * Verifies if the request currently holds a valid session and returns authenticated user info.
 */
const handleSessionCheck = (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const authenticated = user !== null && user.accountStatus !== 'disabled';

  return res.status(200).json({
    authenticated,
    ok: authenticated,
    user: authenticated ? user : null,
  });
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


