import apiClient from './client';

export const tutoringSubjectAPI = {
  // Get all tutoring subjects (admin)
  getAll: (params = {}) => {
    return apiClient.get('/tutoring-subjects', { params });
  },

  // Get active tutoring subjects (for dropdowns/public)
  getActive: () => {
    return apiClient.get('/tutoring-subjects/active');
  },

  // Get tutoring subject by slug
  getBySlug: (slug) => {
    return apiClient.get(`/tutoring-subjects/${slug}`);
  },

  // Create tutoring subject (admin only)
  create: (data) => {
    return apiClient.post('/tutoring-subjects/create', data);
  },

  // Update tutoring subject (admin only)
  update: (slug, data) => {
    return apiClient.put(`/tutoring-subjects/${slug}`, data);
  },

  // Delete tutoring subject (admin only)
  delete: (slug) => {
    return apiClient.delete(`/tutoring-subjects/${slug}`);
  }
};
