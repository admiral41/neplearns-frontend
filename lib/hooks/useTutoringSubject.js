'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tutoringSubjectAPI } from '../api/tutoringSubject';

// Query key constant for consistency
const QUERY_KEY = 'tutoring-subjects';

export function useTutoringSubjects(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => tutoringSubjectAPI.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useActiveTutoringSubjects() {
  return useQuery({
    queryKey: [QUERY_KEY, 'active'],
    queryFn: () => tutoringSubjectAPI.getActive(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTutoringSubject(slug) {
  return useQuery({
    queryKey: [QUERY_KEY, slug],
    queryFn: () => tutoringSubjectAPI.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateTutoringSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => tutoringSubjectAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Subject created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create subject.');
    },
  });
}

export function useUpdateTutoringSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }) => tutoringSubjectAPI.update(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Subject updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update subject.');
    },
  });
}

export function useDeleteTutoringSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug) => tutoringSubjectAPI.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Subject deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete subject.');
    },
  });
}
