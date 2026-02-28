/**
 * Student Hooks
 * Custom React Query hooks for student-related operations
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { studentService } from '../services';

/**
 * Hook to get student dashboard data
 */
export function useDashboard() {
  return useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn: () => studentService.getDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get student profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: async () => {
      const response = await studentService.getProfile();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to update profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData) => studentService.updateProfile(profileData),
    onSuccess: (response) => {
      queryClient.setQueryData(['student', 'profile'], response.data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success(response.msg || 'Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile.');
    },
  });
}

/**
 * Hook to update profile picture
 */
export function useUpdateProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => studentService.updateProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile picture updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile picture.');
    },
  });
}

/**
 * Hook to get student progress
 */
export function useProgress() {
  return useQuery({
    queryKey: ['student', 'progress'],
    queryFn: () => studentService.getProgress(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get study hours
 */
export function useStudyHours(period = 'week') {
  return useQuery({
    queryKey: ['student', 'study-hours', period],
    queryFn: () => studentService.getStudyHours(period),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get student statistics
 */
export function useStudentStats() {
  return useQuery({
    queryKey: ['student', 'stats'],
    queryFn: async () => {
      const response = await studentService.getStats();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get payment history
 */
export function usePaymentHistory(params = {}) {
  return useQuery({
    queryKey: ['student', 'payments', params],
    queryFn: async () => {
      const response = await studentService.getPaymentHistory(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get student settings
 */
export function useSettings() {
  return useQuery({
    queryKey: ['student', 'settings'],
    queryFn: () => studentService.getSettings(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to update settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => studentService.updateSettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(['student', 'settings'], data.settings);
      toast.success('Settings updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update settings.');
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      studentService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password.');
    },
  });
}

/**
 * Hook to get certificates
 */
export function useCertificates() {
  return useQuery({
    queryKey: ['student', 'certificates'],
    queryFn: () => studentService.getCertificates(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to get notifications
 */
export function useNotifications(params = {}) {
  return useQuery({
    queryKey: ['student', 'notifications', params],
    queryFn: () => studentService.getNotifications(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => studentService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] });
    },
  });
}
