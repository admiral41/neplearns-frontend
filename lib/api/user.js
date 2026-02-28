import apiClient from './client';

export const userAPI = {
  // Get users with optional filters (admin only)
  getAll: (params = {}) => {
    return apiClient.get('/admin/users', { params });
  },

  // Get users by role - convenience method
  getByRole: (role, params = {}) => {
    return apiClient.get('/admin/users', {
      params: { role, ...params }
    });
  },

  // Get instructors (lecturers) - approved and active
  getInstructors: (params = {}) => {
    return apiClient.get('/admin/users', {
      params: { role: 'instructor', status: 'active', ...params }
    });
  },

  // Get user by ID
  getById: (id) => {
    return apiClient.get(`/admin/users/${id}`);
  }
};
