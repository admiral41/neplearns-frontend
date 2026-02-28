/**
 * Success Stories Hooks
 * Custom React Query hooks for public success stories
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import successStoryService from '../services/successStory.service';

/**
 * Hook to fetch active success stories for homepage
 */
export function useSuccessStories() {
  return useQuery({
    queryKey: ['success-stories', 'public'],
    queryFn: () => successStoryService.getActiveSuccessStories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
