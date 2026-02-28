'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { recurringScheduleAPI } from '../api/recurringScheduleAPI';

// Query key constant for consistency
const QUERY_KEY = 'recurring-schedules';

// ======================= INSTRUCTOR HOOKS =======================

/**
 * Get instructor's recurring schedules
 * @param {boolean} includeInactive - Include paused/deleted schedules
 */
export function useInstructorSchedules(includeInactive = false) {
  return useQuery({
    queryKey: [QUERY_KEY, 'instructor', includeInactive],
    queryFn: async () => {
      const response = await recurringScheduleAPI.getMySchedules(includeInactive);
      return response.data?.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get schedules for a specific student
 * @param {string} studentId - Student ID
 */
export function useSchedulesByStudent(studentId) {
  return useQuery({
    queryKey: [QUERY_KEY, 'student', studentId],
    queryFn: async () => {
      const response = await recurringScheduleAPI.getSchedulesByStudent(studentId);
      return response.data?.data || [];
    },
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Create a new recurring schedule
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => recurringScheduleAPI.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      // Also invalidate tutoring-sessions as new sessions are created
      queryClient.invalidateQueries({ queryKey: ['tutoring-sessions'] });
      const sessionsCreated = response.data?.sessionsCreated || 0;
      toast.success(`Recurring schedule created! ${sessionsCreated} sessions generated.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create recurring schedule.');
    },
  });
}

/**
 * Update a recurring schedule
 */
export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => recurringScheduleAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Schedule updated.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update schedule.');
    },
  });
}

/**
 * Delete a recurring schedule
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => recurringScheduleAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Schedule deleted.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete schedule.');
    },
  });
}

// ======================= STUDENT HOOKS =======================

/**
 * Get student's own recurring schedule(s)
 */
export function useStudentSchedule() {
  return useQuery({
    queryKey: [QUERY_KEY, 'my-schedule'],
    queryFn: async () => {
      const response = await recurringScheduleAPI.getMySchedule();
      return response.data?.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}
