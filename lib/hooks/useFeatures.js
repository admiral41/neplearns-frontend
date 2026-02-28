/**
 * Feature Hooks
 * Custom React Query hooks for "Why Choose Us" features
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import featureService from '../services/feature.service';

// ==================== Public ====================

export function usePublicFeatures() {
  return useQuery({
    queryKey: ['features', 'public'],
    queryFn: async () => {
      const response = await featureService.getPublicFeatures();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// ==================== Admin ====================

export function useAdminFeatures(params = {}) {
  return useQuery({
    queryKey: ['admin', 'features', params],
    queryFn: async () => {
      const response = await featureService.getFeatures(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminFeature(featureId) {
  return useQuery({
    queryKey: ['admin', 'features', featureId],
    queryFn: async () => {
      const response = await featureService.getFeature(featureId);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!featureId,
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (featureData) => featureService.createFeature(featureData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
      queryClient.invalidateQueries({ queryKey: ['features', 'public'] });
      toast.success('Feature created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create feature.');
    },
  });
}

export function useUpdateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ featureId, featureData }) =>
      featureService.updateFeature(featureId, featureData),
    onSuccess: (_, { featureId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'features', featureId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
      queryClient.invalidateQueries({ queryKey: ['features', 'public'] });
      toast.success('Feature updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update feature.');
    },
  });
}

export function useToggleFeatureStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (featureId) => featureService.toggleFeatureStatus(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
      queryClient.invalidateQueries({ queryKey: ['features', 'public'] });
      toast.success('Status updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status.');
    },
  });
}

export function useDeleteFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (featureId) => featureService.deleteFeature(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
      queryClient.invalidateQueries({ queryKey: ['features', 'public'] });
      toast.success('Feature deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete feature.');
    },
  });
}

export function useReorderFeatures() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (featureIds) => featureService.reorderFeatures(featureIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
      queryClient.invalidateQueries({ queryKey: ['features', 'public'] });
      toast.success('Features reordered!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reorder features.');
    },
  });
}

export function useUpdateSectionContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content) => featureService.updateSectionContent(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
      queryClient.invalidateQueries({ queryKey: ['features', 'public'] });
      toast.success('Section content updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update section content.');
    },
  });
}
