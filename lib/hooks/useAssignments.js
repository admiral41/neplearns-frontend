/**
 * Assignment Hooks
 * Custom React Query hooks for assignment operations
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assignmentService } from '../services';

/**
 * Hook to get all assignments
 */
export function useAssignments(params = {}) {
  return useQuery({
    queryKey: ['assignments', params],
    queryFn: () => assignmentService.getAssignments(params),
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Hook to get assignment by ID
 */
export function useAssignment(assignmentId) {
  return useQuery({
    queryKey: ['assignments', assignmentId],
    queryFn: () => assignmentService.getAssignmentById(assignmentId),
    enabled: !!assignmentId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get upcoming assignments
 */
export function useUpcomingAssignments(limit = 5) {
  return useQuery({
    queryKey: ['assignments', 'upcoming', limit],
    queryFn: () => assignmentService.getUpcomingAssignments(limit),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to submit assignment
 */
export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, submissionData }) =>
      assignmentService.submitAssignment(assignmentId, submissionData),
    onSuccess: (data, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignments', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] });
      toast.success('Assignment submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit assignment.');
    },
  });
}

/**
 * Hook to update assignment submission
 */
export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, submissionData }) =>
      assignmentService.updateSubmission(assignmentId, submissionData),
    onSuccess: (data, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['assignments', assignmentId] });
      toast.success('Submission updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update submission.');
    },
  });
}
