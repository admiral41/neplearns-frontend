/**
 * Authentication Hooks
 * Custom React Query hooks for authentication operations
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import authService from '../services/auth.service';

/**
 * Get redirect path based on user roles and lecturer status
 * @param {string[]} roles - Array of user roles
 * @param {string} [lecturerStatus] - Lecturer application status ('pending', 'approved', 'rejected')
 * @returns {string} Dashboard path
 */
export function getDashboardPath(roles, lecturerStatus = null) {
  if (!roles || !Array.isArray(roles)) {
    return '/student-dashboard';
  }

  if (roles.includes('SUPERADMIN') || roles.includes('ADMIN')) {
    return '/admin-dashboard';
  }

  if (roles.includes('LECTURER')) {
    // Check lecturer approval status
    if (lecturerStatus === 'approved') {
      return '/instructor-dashboard';
    } else if (lecturerStatus === 'rejected') {
      return '/instructor-dashboard/rejected';
    } else {
      // pending or unknown status
      return '/instructor-dashboard/pending';
    }
  }

  return '/student-dashboard';
}

/**
 * Validate if a redirect URL matches the user's primary role dashboard
 * This prevents users from being redirected to dashboards they don't belong to
 * @param {string} redirectUrl - The URL to redirect to
 * @param {string[]} roles - Array of user roles
 * @returns {boolean} Whether the redirect URL matches user's role
 */
export function isValidRedirectForRole(redirectUrl, roles) {
  if (!redirectUrl || !roles || !Array.isArray(roles)) {
    return false;
  }

  const isAdmin = roles.includes('SUPERADMIN') || roles.includes('ADMIN');
  const isLecturer = roles.includes('LECTURER');
  const isLearner = roles.includes('LEARNER');

  // Admin routes - only for admins
  if (redirectUrl.startsWith('/admin-dashboard') || redirectUrl.startsWith('/admin')) {
    return isAdmin;
  }

  // Instructor routes - only for lecturers (not admins logging in)
  if (redirectUrl.startsWith('/instructor-dashboard') || redirectUrl.startsWith('/instructor')) {
    return isLecturer && !isAdmin; // Admins should go to admin dashboard
  }

  // Student routes - only for learners (not admins or lecturers logging in)
  if (redirectUrl.startsWith('/student-dashboard') || redirectUrl.startsWith('/student')) {
    return isLearner && !isAdmin && !isLecturer; // Others should go to their own dashboard
  }

  // For other routes (public pages, courses, etc.), allow the redirect
  return true;
}

/**
 * Hook to get current user profile
 */
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => authService.getProfile(),
    enabled: authService.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => data?.data,
  });
}

/**
 * Hook for login mutation
 * Note: This hook does NOT auto-redirect. The caller should handle redirect
 * after updating AuthProvider state.
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, rememberMe }) => authService.login(email, password, rememberMe),
    onSuccess: (data) => {
      // Update user cache
      queryClient.setQueryData(['user'], data.data);
      toast.success('Login successful!');
      // Redirect is handled by the caller after updating AuthProvider state
    },
    // Note: Error handling (toast) is done by the caller for more specific messages
  });
}

/**
 * Hook for learner (student) registration mutation
 */
export function useRegisterLearner() {
  const router = useRouter();

  return useMutation({
    mutationFn: (learnerData) => authService.registerLearner(learnerData),
    onSuccess: () => {
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/login');
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed. Please try again.');
    },
  });
}

/**
 * Hook for lecturer (instructor) registration mutation
 */
export function useRegisterLecturer() {
  const router = useRouter();

  return useMutation({
    mutationFn: (lecturerData) => authService.registerLecturer(lecturerData),
    onSuccess: () => {
      toast.success(
        'Application submitted successfully! Please check your email to verify your account. Your application will be reviewed by our admin team.'
      );
      router.push('/login');
    },
    onError: (error) => {
      toast.error(error.message || 'Application submission failed. Please try again.');
    },
  });
}

/**
 * Hook for email verification
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: ({ id, code }) => authService.verifyEmail(id, code),
    onSuccess: () => {
      toast.success('Email verified successfully! You can now login.');
    },
    onError: (error) => {
      toast.error(error.message || 'Email verification failed.');
    },
  });
}

/**
 * Hook for logout mutation
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
  });
}

/**
 * Hook for forgot password mutation
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success('If an account exists with this email, you will receive a password reset link.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process request. Please try again.');
    },
  });
}

/**
 * Hook for password reset mutation
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, newPassword }) => authService.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success('Password reset successful! Please login with your new password.');
      router.push('/login');
    },
    onError: (error) => {
      toast.error(error.message || 'Password reset failed. Please try again.');
    },
  });
}

/**
 * Hook for change password mutation (authenticated user)
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword, confirmPassword }) =>
      authService.changePassword(currentPassword, newPassword, confirmPassword),
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password. Please try again.');
    },
  });
}

/**
 * Hook for force change password mutation (after admin reset)
 */
export function useForceChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ newPassword, confirmPassword }) =>
      authService.forceChangePassword(newPassword, confirmPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Password changed successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password. Please try again.');
    },
  });
}

/**
 * Hook to check if user has specific roles
 * @param {string|string[]} requiredRoles - Role(s) to check
 */
export function useHasRole(requiredRoles) {
  const { data: user, isLoading } = useUser();

  if (isLoading || !user) {
    return { hasRole: false, isLoading };
  }

  const roles = user.roles || [];
  const required = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  // SUPERADMIN has access to everything
  if (roles.includes('SUPERADMIN')) {
    return { hasRole: true, isLoading: false };
  }

  const hasRole = required.some((role) => roles.includes(role));
  return { hasRole, isLoading: false };
}

/**
 * Hook to get lecturer application data (for rejected users to reapply)
 * @param {Object} options
 * @param {boolean} options.enabled - Whether the query should run (default: check if authenticated)
 */
export function useLecturerApplication({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['lecturerApplication'],
    queryFn: () => authService.getLecturerApplication(),
    enabled: enabled && authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data?.data,
  });
}

/**
 * Hook for lecturer reapplication mutation (for rejected applicants)
 */
export function useReapplyLecturer() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationData) => authService.reapplyLecturer(applicationData),
    onSuccess: (data) => {
      // Invalidate user and lecturer application queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerApplication'] });

      // Update user data in localStorage with new status
      const currentUser = authService.getUser();
      if (currentUser) {
        currentUser.lecturerStatus = 'pending';
        authService.setAuthData(
          authService.getAccessToken(),
          authService.getRefreshToken(),
          currentUser
        );
      }

      toast.success(
        'Application resubmitted successfully! Your application is now pending review.'
      );
      router.push('/instructor-dashboard/pending');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resubmit application. Please try again.');
    },
  });
}
