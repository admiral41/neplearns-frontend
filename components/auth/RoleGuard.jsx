/**
 * Role Guard Component
 * Conditionally renders children based on user roles
 */

'use client';

import { useAuth } from '@/lib/providers/AuthProvider';

/**
 * RoleGuard - Conditionally renders content based on user roles
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if user has role
 * @param {string|string[]} props.allowedRoles - Role(s) required to see content
 * @param {React.ReactNode} [props.fallback] - Content to render if user doesn't have role
 */
export function RoleGuard({ children, allowedRoles, fallback = null }) {
  const { hasRole, isLoading, isAuthenticated } = useAuth();

  // While loading, show fallback
  if (isLoading) {
    return fallback;
  }

  // If not authenticated, show fallback
  if (!isAuthenticated) {
    return fallback;
  }

  // If user doesn't have required role, show fallback
  if (!hasRole(allowedRoles)) {
    return fallback;
  }

  // User has role - render children
  return children;
}

/**
 * AdminOnly - Only renders for ADMIN or SUPERADMIN users
 */
export function AdminOnly({ children, fallback = null }) {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPERADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * LecturerOnly - Only renders for LECTURER users
 */
export function LecturerOnly({ children, fallback = null }) {
  return (
    <RoleGuard allowedRoles={['LECTURER', 'ADMIN', 'SUPERADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * LearnerOnly - Only renders for LEARNER users
 */
export function LearnerOnly({ children, fallback = null }) {
  return (
    <RoleGuard allowedRoles={['LEARNER']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export default RoleGuard;
