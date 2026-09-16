import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { isAdminRequest, getAuthenticatedUser } from './auth.ts';

export const adminRouter = Router();

function getSupabaseAdmin() {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/["']/g, '').trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/["']/g, '').trim();

  if (!supabaseUrl || !serviceRoleKey || !supabaseUrl.startsWith('http')) {
    return null;
  }

  const normalizedOrigin = new URL(supabaseUrl).origin;
  return createClient(normalizedOrigin, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Middleware to enforce Admin role
adminRouter.use((req: Request, res: Response, next) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({
      ok: false,
      code: 'FORBIDDEN',
      error: 'Access denied. Administrator privileges are required.',
      message: 'Access denied. Administrator privileges are required.',
    });
  }
  next();
});

/**
 * GET /api/admin/overview
 * System-wide statistics for the Admin Center
 */
adminRouter.get('/overview', async (_req: Request, res: Response) => {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return res.status(503).json({ ok: false, error: 'Database service unavailable' });
  }

  try {
    const [profilesRes, lessonsRes, activityRes] = await Promise.all([
      admin.from('profiles').select('*'),
      admin.from('lesson_progress').select('completed,best_accuracy,best_wpm'),
      admin.from('daily_activity').select('study_seconds,lessons_completed,typing_seconds,review_seconds'),
    ]);

    const profiles = profilesRes.data || [];
    const lessons = lessonsRes.data || [];
    const activities = activityRes.data || [];

    const totalUsers = profiles.length;
    const studentCount = profiles.filter((p) => p.role === 'student').length;
    const activeStudents = profiles.filter((p) => p.role === 'student' && p.account_status !== 'disabled').length;
    const completedLessons = lessons.filter((l) => l.completed).length;

    const totalStudySeconds = activities.reduce((sum, a) => sum + (Number(a.study_seconds) || 0), 0);
    const totalTypingSeconds = activities.reduce((sum, a) => sum + (Number(a.typing_seconds) || 0), 0);

    return res.status(200).json({
      ok: true,
      stats: {
        totalUsers,
        studentCount,
        activeStudents,
        completedLessons,
        totalStudySeconds,
        totalTypingSeconds,
        dbStatus: 'healthy',
      },
    });
  } catch (err) {
    console.error('[ADMIN_OVERVIEW_ERROR]', err);
    return res.status(500).json({ ok: false, error: 'Failed to fetch overview metrics' });
  }
});

/**
 * GET /api/admin/users
 * Returns list of all profiles with their assigned subjects and high-level progress
 */
adminRouter.get('/users', async (_req: Request, res: Response) => {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return res.status(503).json({ ok: false, error: 'Database service unavailable' });
  }

  try {
    const { data: profiles, error: pErr } = await admin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (pErr) throw pErr;

    const { data: subjects } = await admin.from('profile_subjects').select('*');
    const { data: lessons } = await admin.from('lesson_progress').select('profile_id,completed,subject_id');
    const { data: activities } = await admin.from('daily_activity').select('profile_id,study_seconds,activity_date');

    const subjectsMap = new Map<string, string[]>();
    (subjects || []).forEach((s) => {
      const list = subjectsMap.get(s.profile_id) || [];
      list.push(s.subject_id);
      subjectsMap.set(s.profile_id, list);
    });

    const userStats = (profiles || []).map((p) => {
      const userLessons = (lessons || []).filter((l) => l.profile_id === p.id);
      const userActs = (activities || []).filter((a) => a.profile_id === p.id);
      const totalSeconds = userActs.reduce((acc, a) => acc + (Number(a.study_seconds) || 0), 0);

      return {
        id: p.id,
        displayName: p.display_name,
        role: p.role,
        accountStatus: p.account_status || 'active',
        createdAt: p.created_at,
        lastActiveAt: p.last_active_at,
        assignedSubjects: subjectsMap.get(p.id) || ['swedish', 'english', 'python', 'typing'],
        stats: {
          completedLessons: userLessons.filter((l) => l.completed).length,
          totalStudyMinutes: Math.round(totalSeconds / 60),
          activeDaysCount: new Set(userActs.map((a) => a.activity_date)).size,
        },
      };
    });

    return res.status(200).json({ ok: true, users: userStats });
  } catch (err) {
    console.error('[ADMIN_USERS_LIST_ERROR]', err);
    return res.status(500).json({ ok: false, error: 'Failed to list users' });
  }
});

/**
 * POST /api/admin/users
 * Creates a new Student user securely
 */
adminRouter.post('/users', async (req: Request, res: Response) => {
  const { username, displayName, password, assignedSubjects } = req.body || {};

  if (!username || typeof username !== 'string' || !displayName || typeof displayName !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({
      ok: false,
      error: 'Username, Display Name, and Password are required.',
    });
  }

  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
  if (cleanUsername.length < 2) {
    return res.status(400).json({
      ok: false,
      error: 'Username must be at least 2 alphanumeric characters.',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      ok: false,
      error: 'Password must be at least 6 characters long.',
    });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return res.status(503).json({ ok: false, error: 'Database service unavailable' });
  }

  const email = `${cleanUsername}@mylearning.internal`;

  try {
    // 1. Create auth user in Supabase
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName.trim(),
        role: 'student',
        is_admin: false,
      },
    });

    if (authErr) {
      return res.status(400).json({
        ok: false,
        error: authErr.message || 'Failed to create authentication user. Username may already exist.',
      });
    }

    const userId = authData.user.id;

    // 2. Insert profile record
    const { error: profileErr } = await admin.from('profiles').upsert({
      id: userId,
      display_name: displayName.trim(),
      role: 'student',
      account_status: 'active',
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (profileErr) {
      console.warn('[ADMIN_PROFILE_UPSERT_WARN]', profileErr);
    }

    // 3. Assign subjects
    const subjectsToAssign: string[] = Array.isArray(assignedSubjects) && assignedSubjects.length > 0
      ? assignedSubjects
      : ['swedish', 'english'];

    const subjectRows = subjectsToAssign.map((s) => ({
      profile_id: userId,
      subject_id: s,
      created_at: new Date().toISOString(),
    }));

    await admin.from('profile_subjects').upsert(subjectRows, { onConflict: 'profile_id,subject_id' });

    // 4. Default user settings
    await admin.from('user_settings').upsert({
      profile_id: userId,
      sound_enabled: true,
      typing_sound_volume: 0.4,
      caret_style: 'line',
      font_size: 'large',
      tts_voice: 'default',
      tts_rate: 1.0,
      swedish_translation_lang: 'so',
      english_translation_lang: 'so',
      python_support_lang: 'en',
    }, { onConflict: 'profile_id' });

    return res.status(201).json({
      ok: true,
      user: {
        id: userId,
        username: cleanUsername,
        displayName: displayName.trim(),
        role: 'student',
        accountStatus: 'active',
        assignedSubjects: subjectsToAssign,
      },
    });
  } catch (err: any) {
    console.error('[ADMIN_CREATE_USER_ERROR]', err);
    return res.status(500).json({ ok: false, error: err?.message || 'Failed to create student user' });
  }
});

/**
 * PATCH /api/admin/users/:userId/status
 * Toggle student active or disabled status
 */
adminRouter.patch('/users/:userId/status', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status } = req.body || {};

  if (!status || (status !== 'active' && status !== 'disabled')) {
    return res.status(400).json({ ok: false, error: 'Status must be "active" or "disabled"' });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return res.status(503).json({ ok: false, error: 'Database service unavailable' });

  try {
    const { error } = await admin
      .from('profiles')
      .update({ account_status: status })
      .eq('id', userId);

    if (error) throw error;

    return res.status(200).json({ ok: true, userId, status });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to update account status' });
  }
});

/**
 * PATCH /api/admin/users/:userId/subjects
 * Updates subject assignments without deleting user learning history
 */
adminRouter.patch('/users/:userId/subjects', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { subjects } = req.body || {};

  if (!Array.isArray(subjects)) {
    return res.status(400).json({ ok: false, error: 'Subjects must be an array of subject IDs' });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return res.status(503).json({ ok: false, error: 'Database service unavailable' });

  try {
    // Delete existing assignments for this user
    await admin.from('profile_subjects').delete().eq('profile_id', userId);

    // Re-insert selected subjects
    if (subjects.length > 0) {
      const rows = subjects.map((s) => ({
        profile_id: userId,
        subject_id: s,
        created_at: new Date().toISOString(),
      }));
      const { error } = await admin.from('profile_subjects').insert(rows);
      if (error) throw error;
    }

    return res.status(200).json({ ok: true, userId, subjects });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to update assigned subjects' });
  }
});

/**
 * POST /api/admin/users/:userId/reset-password
 * Admin resets student password
 */
adminRouter.post('/users/:userId/reset-password', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { newPassword } = req.body || {};

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters long' });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return res.status(503).json({ ok: false, error: 'Database service unavailable' });

  try {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) throw error;

    return res.status(200).json({ ok: true, message: 'Password reset successfully' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to reset password' });
  }
});

/**
 * GET /api/admin/users/:userId
 * Retrieves detailed student learning dossier (lessons, mistakes, daily activity, typing)
 */
adminRouter.get('/users/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const admin = getSupabaseAdmin();
  if (!admin) return res.status(503).json({ ok: false, error: 'Database service unavailable' });

  try {
    const [profileRes, subjectsRes, lessonsRes, mistakesRes, activityRes, typingRes] = await Promise.all([
      admin.from('profiles').select('*').eq('id', userId).single(),
      admin.from('profile_subjects').select('subject_id').eq('profile_id', userId),
      admin.from('lesson_progress').select('*').eq('profile_id', userId),
      admin.from('mistakes').select('*').eq('profile_id', userId),
      admin.from('daily_activity').select('*').eq('profile_id', userId).order('activity_date', { ascending: false }),
      admin.from('typing_stats').select('*').eq('profile_id', userId),
    ]);

    if (!profileRes.data) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    return res.status(200).json({
      ok: true,
      user: {
        ...profileRes.data,
        assignedSubjects: (subjectsRes.data || []).map((s) => s.subject_id),
        lessons: lessonsRes.data || [],
        mistakes: mistakesRes.data || [],
        activity: activityRes.data || [],
        typingStats: typingRes.data || [],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to fetch user dossier' });
  }
});
