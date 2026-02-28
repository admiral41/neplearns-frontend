'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tutoringPaymentAPI } from '../api/tutoringPayment';

// Query key constants for consistency
const QUERY_KEY = 'tutoring-payments';
const ENROLLMENT_KEY = 'tutoring-enrollments';

// ======================= STUDENT HOOKS =======================

export function useSubmitPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => tutoringPaymentAPI.submitPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ENROLLMENT_KEY] });
      toast.success('Payment submitted! Awaiting verification.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit payment.');
    },
  });
}

export function usePaymentHistory(enrollmentId) {
  return useQuery({
    queryKey: [QUERY_KEY, 'enrollment', enrollmentId],
    queryFn: async () => {
      const response = await tutoringPaymentAPI.getPaymentHistory(enrollmentId);
      return response?.data?.payments || [];
    },
    enabled: !!enrollmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePayment(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await tutoringPaymentAPI.getPaymentById(id);
      return response?.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// ======================= ADMIN HOOKS =======================

export function usePendingPayments(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'pending', params],
    queryFn: async () => {
      const response = await tutoringPaymentAPI.getPendingPayments(params);
      return response?.data?.payments || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => tutoringPaymentAPI.verifyPayment(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ENROLLMENT_KEY] });
      toast.success(`Payment ${variables.action === 'approve' ? 'approved' : 'rejected'} successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to verify payment.');
    },
  });
}
