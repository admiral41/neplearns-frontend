'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tutoringEnrollmentAPI } from '../api/tutoringEnrollment';

// Query key constant for consistency
const QUERY_KEY = 'tutoring-enrollments';

// ======================= STUDENT HOOKS =======================

export function useMySubscriptions(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'my', params],
    queryFn: () => tutoringEnrollmentAPI.getMySubscriptions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSubscription(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => tutoringEnrollmentAPI.getById(id),
    enabled: !!id,
  });
}

// ======================= ADMIN HOOKS =======================

export function useAllSubscriptions(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'all', params],
    queryFn: () => tutoringEnrollmentAPI.getAll(params),
    staleTime: 1 * 60 * 1000,
  });
}

export function useActivateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tutoringEnrollmentAPI.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Subscription activated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to activate subscription.');
    },
  });
}

export function usePauseSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tutoringEnrollmentAPI.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Subscription paused.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to pause subscription.');
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tutoringEnrollmentAPI.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Subscription cancelled.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel subscription.');
    },
  });
}

export function useExtendSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, days }) => tutoringEnrollmentAPI.extend(id, days),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(data?.msg || 'Subscription extended successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to extend subscription.');
    },
  });
}
