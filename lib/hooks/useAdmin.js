/**
 * Admin Hooks
 * Custom React Query hooks for admin operations
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import adminService from '../services/admin.service';

// ==================== Dashboard ====================

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboard(),
    staleTime: 2 * 60 * 1000,
  });
}

// ==================== Tutoring Metrics ====================

export function useTutoringMetrics() {
  return useQuery({
    queryKey: ['admin', 'tutoring-metrics'],
    queryFn: async () => {
      const response = await adminService.getTutoringMetrics();
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useAdminTutoringSessions(params = {}) {
  return useQuery({
    queryKey: ['admin', 'tutoring-sessions', params],
    queryFn: async () => {
      const response = await adminService.getAllTutoringSessions(params);
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useAdminAnalytics(params = {}) {
  return useQuery({
    queryKey: ['admin', 'analytics', params],
    queryFn: () => adminService.getAnalytics(params),
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== Users ====================

export function useUsers(params = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.getUsers(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUser(userId) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => adminService.getUser(userId),
    staleTime: 2 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData) => adminService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user.');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, userData }) => adminService.updateUser(userId, userData),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user.');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('User deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete user.');
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }) => adminService.suspendUser(userId, reason),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User suspended successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to suspend user.');
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => adminService.activateUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User activated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to activate user.');
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (userId) => adminService.resetUserPassword(userId),
    onSuccess: async (response) => {
      const tempPassword = response.data?.tempPassword;
      const emailSent = response.data?.emailSent;

      if (emailSent) {
        toast.success(response.msg || 'Password reset successfully! Email sent to user.');
      } else {
        // Email failed - copy password to clipboard and notify admin
        try {
          await navigator.clipboard.writeText(tempPassword);
          toast.warning(
            'Password reset! Email delivery failed. Temporary password copied to clipboard.',
            { duration: 8000 }
          );
        } catch {
          // Clipboard failed, show password in console as last resort
          console.log('Temporary password:', tempPassword);
          toast.warning(
            'Password reset! Email failed. Check browser console for temporary password.',
            { duration: 8000 }
          );
        }
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password.');
    },
  });
}

export function useResendVerificationEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => adminService.resendVerificationEmail(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      toast.success('Verification email sent successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send verification email.');
    },
  });
}

// ==================== Instructor Applications ====================

export function useApplications(params = {}) {
  return useQuery({
    queryKey: ['admin', 'applications', params],
    queryFn: () => adminService.getApplications(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useApplication(applicationId) {
  return useQuery({
    queryKey: ['admin', 'applications', applicationId],
    queryFn: () => adminService.getApplication(applicationId),
    staleTime: 2 * 60 * 1000,
    enabled: !!applicationId,
  });
}

export function useApproveApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId) => adminService.approveApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Application approved! Instructor account created.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve application.');
    },
  });
}

export function useRejectApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, reason }) => adminService.rejectApplication(applicationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      toast.success('Application rejected.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject application.');
    },
  });
}

// ==================== Courses ====================

export function useAdminCourses(params = {}) {
  return useQuery({
    queryKey: ['admin', 'courses', params],
    queryFn: () => adminService.getCourses(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePendingCourses(params = {}) {
  return useQuery({
    queryKey: ['admin', 'courses', 'pending', params],
    queryFn: async () => {
      const response = await adminService.getPendingCourses(params);
      // Return in format expected by PendingCourses component
      return {
        courses: response.data || [],
        total: response.pagination?.total || response.data?.length || 0,
      };
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function useAdminCourse(courseId) {
  return useQuery({
    queryKey: ['admin', 'courses', courseId],
    queryFn: () => adminService.getCourse(courseId),
    staleTime: 2 * 60 * 1000,
    enabled: !!courseId,
  });
}

export function useAdminUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, courseData }) => adminService.updateCourse(courseId, courseData),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Course updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update course.');
    },
  });
}

export function useAdminDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => adminService.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Course deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete course.');
    },
  });
}

export function useApproveCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => adminService.approveCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Course approved and published!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve course.');
    },
  });
}

export function useRejectCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, reason }) => adminService.rejectCourse(courseId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Course rejected.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject course.');
    },
  });
}

export function useFeatureCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => adminService.featureCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Course featured!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to feature course.');
    },
  });
}

export function useUnfeatureCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => adminService.unfeatureCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Course unfeatured.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to unfeature course.');
    },
  });
}

// ==================== Payments ====================

export function usePayments(params = {}) {
  return useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: () => adminService.getPayments(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePaymentStats(params = {}) {
  return useQuery({
    queryKey: ['admin', 'payments', 'stats', params],
    queryFn: () => adminService.getPaymentStats(params),
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== Refunds ====================

export function useRefundRequests(params = {}) {
  return useQuery({
    queryKey: ['admin', 'refunds', params],
    queryFn: () => adminService.getRefundRequests(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useApproveRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (refundId) => adminService.approveRefund(refundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      toast.success('Refund approved!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve refund.');
    },
  });
}

export function useRejectRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ refundId, reason }) => adminService.rejectRefund(refundId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] });
      toast.success('Refund rejected.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject refund.');
    },
  });
}

// ==================== Payouts ====================

export function usePendingPayouts(params = {}) {
  return useQuery({
    queryKey: ['admin', 'payouts', 'pending', params],
    queryFn: () => adminService.getPendingPayouts(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePayoutHistory(params = {}) {
  return useQuery({
    queryKey: ['admin', 'payouts', 'history', params],
    queryFn: () => adminService.getPayoutHistory(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProcessPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ instructorId, amount }) => adminService.processPayout(instructorId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
      toast.success('Payout processed successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process payout.');
    },
  });
}

// ==================== Announcements ====================

export function useAdminAnnouncements(params = {}) {
  return useQuery({
    queryKey: ['admin', 'announcements', params],
    queryFn: () => adminService.getAnnouncements(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateAdminAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementData) => adminService.createAnnouncement(announcementData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      toast.success('Announcement created!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create announcement.');
    },
  });
}

export function useUpdateAdminAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ announcementId, announcementData }) =>
      adminService.updateAnnouncement(announcementId, announcementData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      toast.success('Announcement updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update announcement.');
    },
  });
}

export function useDeleteAdminAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementId) => adminService.deleteAnnouncement(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      toast.success('Announcement deleted!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete announcement.');
    },
  });
}

// ==================== Activity Logs ====================

export function useActivityLogs(params = {}) {
  return useQuery({
    queryKey: ['admin', 'activity-logs', params],
    queryFn: () => adminService.getActivityLogs(params),
    staleTime: 1 * 60 * 1000,
  });
}

// ==================== Settings ====================

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const response = await adminService.getSettings();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings) => adminService.updateSettings(settings),
    onSuccess: (response) => {
      queryClient.setQueryData(['admin', 'settings'], response.data);
      toast.success(response.msg || 'Settings updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update settings.');
    },
  });
}

export function useUpdateGeneralSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings) => adminService.updateGeneralSettings(settings),
    onSuccess: (response) => {
      queryClient.setQueryData(['admin', 'settings'], response.data);
      toast.success(response.msg || 'General settings updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update general settings.');
    },
  });
}

export function useUpdateContactSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings) => adminService.updateContactSettings(settings),
    onSuccess: (response) => {
      queryClient.setQueryData(['admin', 'settings'], response.data);
      toast.success(response.msg || 'Contact settings updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update contact settings.');
    },
  });
}

export function useUpdateSocialLinks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (links) => adminService.updateSocialLinks(links),
    onSuccess: (response) => {
      queryClient.setQueryData(['admin', 'settings'], response.data);
      toast.success(response.msg || 'Social links updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update social links.');
    },
  });
}

export function useToggleFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feature) => adminService.toggleFeature(feature),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success(response.msg || 'Setting updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update setting.');
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => adminService.uploadLogo(file),
    onSuccess: (response) => {
      // response.data contains { logo, settings } - update cache with settings
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success(response.msg || 'Logo uploaded successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload logo.');
    },
  });
}

export function useEmailTemplates() {
  return useQuery({
    queryKey: ['admin', 'email-templates'],
    queryFn: () => adminService.getEmailTemplates(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, templateData }) =>
      adminService.updateEmailTemplate(templateId, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'email-templates'] });
      toast.success('Email template updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update email template.');
    },
  });
}

export function usePaymentConfig() {
  return useQuery({
    queryKey: ['admin', 'payment-config'],
    queryFn: () => adminService.getPaymentConfig(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdatePaymentConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config) => adminService.updatePaymentConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-config'] });
      toast.success('Payment configuration updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update payment configuration.');
    },
  });
}

// ==================== Profile ====================

export function useAdminProfile() {
  return useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: () => adminService.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileData) => adminService.updateProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile.');
    },
  });
}

export function useAdminChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      adminService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password.');
    },
  });
}

// ==================== Success Stories ====================

export function useSearchUsersForSuccessStory(query) {
  return useQuery({
    queryKey: ['admin', 'users', 'search', query],
    queryFn: () => adminService.searchUsersForSuccessStory(query),
    enabled: query?.length >= 2,
    staleTime: 30 * 1000,
  });
}

export function useAdminSuccessStories(params = {}) {
  return useQuery({
    queryKey: ['admin', 'success-stories', params],
    queryFn: () => adminService.getSuccessStories(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminSuccessStory(storyId) {
  return useQuery({
    queryKey: ['admin', 'success-stories', storyId],
    queryFn: () => adminService.getSuccessStory(storyId),
    staleTime: 2 * 60 * 1000,
    enabled: !!storyId,
  });
}

export function useCreateSuccessStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyData) => adminService.createSuccessStory(storyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'success-stories'] });
      queryClient.invalidateQueries({ queryKey: ['success-stories', 'public'] });
      toast.success('Success story created!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create success story.');
    },
  });
}

export function useUpdateSuccessStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storyId, storyData }) =>
      adminService.updateSuccessStory(storyId, storyData),
    onSuccess: (_, { storyId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'success-stories', storyId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'success-stories'] });
      queryClient.invalidateQueries({ queryKey: ['success-stories', 'public'] });
      toast.success('Success story updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update success story.');
    },
  });
}

export function useToggleSuccessStoryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyId) => adminService.toggleSuccessStoryStatus(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'success-stories'] });
      queryClient.invalidateQueries({ queryKey: ['success-stories', 'public'] });
      toast.success('Status updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status.');
    },
  });
}

export function useDeleteSuccessStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyId) => adminService.deleteSuccessStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'success-stories'] });
      queryClient.invalidateQueries({ queryKey: ['success-stories', 'public'] });
      toast.success('Success story deleted!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete success story.');
    },
  });
}
