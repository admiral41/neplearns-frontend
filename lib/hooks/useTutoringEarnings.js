'use client';

import { useQuery } from '@tanstack/react-query';
import { tutoringEarningsAPI } from '../api/tutoringEarningsAPI';

// Query key constants
const QUERY_KEY = 'tutoring-earnings';

/**
 * Hook to get earnings summary (current month + total)
 */
export function useEarningsSummary() {
  return useQuery({
    queryKey: [QUERY_KEY, 'summary'],
    queryFn: async () => {
      const response = await tutoringEarningsAPI.getSummary();
      return response?.data || { currentMonth: 0, total: 0, lastUpdated: null };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get earnings breakdown by student
 */
export function useEarningsByStudent() {
  return useQuery({
    queryKey: [QUERY_KEY, 'by-student'],
    queryFn: async () => {
      const response = await tutoringEarningsAPI.getByStudent();
      return response?.data?.earnings || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get monthly earnings breakdown
 * @param {number} year - Year to get earnings for (defaults to current year)
 */
export function useMonthlyEarnings(year) {
  return useQuery({
    queryKey: [QUERY_KEY, 'monthly', year],
    queryFn: async () => {
      const response = await tutoringEarningsAPI.getMonthly(year);
      return {
        earnings: response?.data?.earnings || [],
        year: response?.data?.year || year || new Date().getFullYear(),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
