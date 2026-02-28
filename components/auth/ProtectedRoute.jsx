/**
 * Protected Route Component
 * Wraps pages that require authentication and/or specific roles
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute - Guards routes based on authentication and roles
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string|string[]} [props.allowedRoles] - Role(s) allowed to access this route
 * @param {string} [props.redirectTo] - Where to redirect if not authenticated (default: /login)
 * @param {string} [props.unauthorizedRedirect] - Where to redirect if no role access (default: /unauthorized)
 */
export function ProtectedRoute({
  children,
  allowedRoles = null,
  redirectTo = '/login',
  unauthorizedRedirect = '/unauthorized',
}) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
        return;
      }

      // Authenticated but doesn't have required role - redirect to unauthorized
      if (allowedRoles && !hasRole(allowedRoles)) {
        router.push(unauthorizedRedirect);
        return;
      }
    }
  }, [isLoading, isAuthenticated, allowedRoles, hasRole, router, pathname, redirectTo, unauthorizedRedirect]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or doesn't have role - don't render children
  if (!isAuthenticated || (allowedRoles && !hasRole(allowedRoles))) {
    return null;
  }

  // Authenticated and has role - render children
  return children;
}

export default ProtectedRoute;
