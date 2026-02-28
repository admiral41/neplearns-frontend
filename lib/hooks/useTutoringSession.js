'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tutoringSessionAPI } from '../api/tutoringSession';

// Query key constant for consistency
const QUERY_KEY = 'tutoring-sessions';

// ======================= INSTRUCTOR HOOKS =======================

/**
 * Get instructor's assigned students grouped by subject
 */
export function useMyTutoringStudents(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'my-students', params],
    queryFn: async () => {
      const response = await tutoringSessionAPI.getMyStudents(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get instructor's sessions with optional filters
 */
export function useInstructorSessions(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'instructor', params],
    queryFn: async () => {
      const response = await tutoringSessionAPI.getInstructorSessions(params);
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Create a new tutoring session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => tutoringSessionAPI.createSession(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Session scheduled successfully!');
      // Show warning if overlapping
      if (response.warning) {
        toast.warning(response.warning);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to schedule session.');
    },
  });
}

/**
 * Update a tutoring session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => tutoringSessionAPI.updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Session updated.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update session.');
    },
  });
}

/**
 * Cancel a tutoring session
 */
export function useCancelSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tutoringSessionAPI.cancelSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Session cancelled.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel session.');
    },
  });
}

/**
 * Start a session early (go live)
 */
export function useStartSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tutoringSessionAPI.startSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Session started! Student can now join.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start session.');
    },
  });
}

/**
 * End a live session
 */
export function useEndSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tutoringSessionAPI.endSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Session ended.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to end session.');
    },
  });
}

/**
 * Mark attendance for a session
 */
export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, attendance }) => tutoringSessionAPI.markAttendance(id, attendance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Attendance marked.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark attendance.');
    },
  });
}

// ======================= STUDENT HOOKS =======================

/**
 * Get student's sessions with optional filters
 * Auto-refreshes every 5 minutes to update canJoin status
 */
export function useStudentSessions(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'student', params],
    queryFn: async () => {
      const response = await tutoringSessionAPI.getStudentSessions(params);
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Auto refresh every 5 mins for canJoin updates
  });
}

// ======================= SHARED HOOKS =======================

/**
 * Get a single session by ID
 */
export function useSession(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await tutoringSessionAPI.getSessionById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}
