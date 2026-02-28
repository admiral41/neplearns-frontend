/**
 * Live Class Hooks
 * Custom React Query hooks for live class operations
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { liveClassService } from '../services';

/**
 * Hook to get upcoming live classes
 */
export function useUpcomingLiveClasses(params = {}) {
  return useQuery({
    queryKey: ['live-classes', 'upcoming', params],
    queryFn: () => liveClassService.getUpcomingClasses(params),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Hook to get live class by ID
 */
export function useLiveClass(classId) {
  return useQuery({
    queryKey: ['live-classes', classId],
    queryFn: () => liveClassService.getLiveClassById(classId),
    enabled: !!classId,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Hook to join live class
 */
export function useJoinLiveClass() {
  return useMutation({
    mutationFn: (classId) => liveClassService.joinLiveClass(classId),
    onSuccess: (data) => {
      // Open meeting in new window/tab
      if (data.join_url) {
        window.open(data.join_url, '_blank');
        toast.success('Joining live class...');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to join live class.');
    },
  });
}

/**
 * Hook to get recorded classes
 */
export function useRecordedClasses(params = {}) {
  return useQuery({
    queryKey: ['live-classes', 'recordings', params],
    queryFn: () => liveClassService.getRecordedClasses(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get class schedule
 */
export function useClassSchedule(month) {
  return useQuery({
    queryKey: ['live-classes', 'schedule', month],
    queryFn: () => liveClassService.getClassSchedule(month),
    enabled: !!month,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to mark attendance
 */
export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId) => liveClassService.markAttendance(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-classes'] });
      toast.success('Attendance marked!');
    },
  });
}
