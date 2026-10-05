import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { SubjectId } from '../../types';

interface SubjectProtectedRouteProps {
  subjectId: SubjectId;
  children?: React.ReactNode;
}

/**
 * SubjectProtectedRoute
 *
 * Enforces assignment security:
 * - Administrators have full preview and learning access to all subjects.
 * - Students/non-admins are strictly restricted to their assigned subjects.
 * - Attempting direct URL access to unassigned subjects redirects to Dashboard.
 */
export function SubjectProtectedRoute({ subjectId, children }: SubjectProtectedRouteProps) {
  const { profile, isAdmin } = useProfile();

  if (isAdmin) {
    return children ? <>{children}</> : <Outlet />;
  }

  const assigned = Array.isArray(profile.assignedSubjects) ? profile.assignedSubjects : [];
  const hasAccess = assigned.includes(subjectId);

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
