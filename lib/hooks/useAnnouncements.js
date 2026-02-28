'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import announcementService from '../services/announcement.service';

/**
 * Hook to get announcements for current user
 */
export function useAnnouncements(params = {}) {
  return useQuery({
    queryKey: ['announcements', params],
    queryFn: () => announcementService.getAnnouncements(params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to mark announcement as read
 */
export function useMarkAnnouncementRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementId) => announcementService.markAsRead(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Marked as read');
    },
    onError: () => {
      toast.error('Failed to mark as read');
    },
  });
}
