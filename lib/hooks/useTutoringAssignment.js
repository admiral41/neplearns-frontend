'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tutoringAssignmentAPI } from '../api/tutoringAssignment';

const QUERY_KEY = 'tutoring-assignments';

// ======================= INSTRUCTOR HOOKS =======================

/**
 * Get instructor's assignments with optional filters
 */
export function useInstructorAssignments(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'instructor', params],
    queryFn: async () => {
      const response = await tutoringAssignmentAPI.getInstructorAssignments(params);
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Create a new assignment
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => tutoringAssignmentAPI.createAssignment(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Assignment created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create assignment.');
    },
  });
}

/**
 * Update an assignment
 */
export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => tutoringAssignmentAPI.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Assignment updated.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update assignment.');
    },
  });
}

/**
 * Delete an assignment
 */
export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tutoringAssignmentAPI.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Assignment deleted.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete assignment.');
    },
  });
}

/**
 * Give feedback on a submitted assignment
 */
export function useGiveFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }) => tutoringAssignmentAPI.giveFeedback(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Feedback submitted.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit feedback.');
    },
  });
}

/**
 * Request changes on a submitted assignment
 */
export function useRequestChanges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }) => tutoringAssignmentAPI.requestChanges(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Revision requested.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to request changes.');
    },
  });
}

// ======================= STUDENT HOOKS =======================

/**
 * Get student's assignments with optional filters
 */
export function useStudentAssignments(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'student', params],
    queryFn: async () => {
      const response = await tutoringAssignmentAPI.getStudentAssignments(params);
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Submit work for an assignment
 */
export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => tutoringAssignmentAPI.submitAssignment(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Assignment submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit assignment.');
    },
  });
}

// ======================= SHARED HOOKS =======================

/**
 * Get a single assignment by ID
 */
export function useAssignment(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await tutoringAssignmentAPI.getAssignmentById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}
