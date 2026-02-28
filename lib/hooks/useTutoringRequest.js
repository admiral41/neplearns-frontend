'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tutoringRequestAPI } from '../api/tutoringRequest';

// Query key constant for consistency
const QUERY_KEY = 'tutoring-requests';

// ======================= STUDENT HOOKS =======================

export function useMyTutoringRequests(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'my', params],
    queryFn: () => tutoringRequestAPI.getMyRequests(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for status updates)
  });
}

export function useTutoringRequest(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => tutoringRequestAPI.getById(id),
    enabled: !!id,
  });
}

export function useCreateTutoringRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => tutoringRequestAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Tutoring request submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit request.');
    },
  });
}

// ======================= ADMIN HOOKS (for Plan 03) =======================

export function useAllTutoringRequests(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'all', params],
    queryFn: () => tutoringRequestAPI.getAll(params),
    staleTime: 1 * 60 * 1000,
  });
}

export function useAssignInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, instructorId, platformFeePercentage }) =>
      tutoringRequestAPI.assignInstructor(requestId, instructorId, platformFeePercentage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Instructor assigned successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign instructor.');
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }) =>
      tutoringRequestAPI.reject(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Request rejected.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject request.');
    },
  });
}

export function useUpdateAdminNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, notes }) =>
      tutoringRequestAPI.updateNotes(requestId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Notes updated.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update notes.');
    },
  });
}
