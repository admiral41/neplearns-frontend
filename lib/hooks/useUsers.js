'use client';

import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../api/user';

// Query key constant for consistency
const QUERY_KEY = 'users';

export function useUsers(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => userAPI.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUsersByRole(role, params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'role', role, params],
    queryFn: () => userAPI.getByRole(role, params),
    enabled: !!role,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInstructors(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'instructors', params],
    queryFn: () => userAPI.getInstructors(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => userAPI.getById(id),
    enabled: !!id,
  });
}
