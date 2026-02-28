import apiClient from './client';

export const livestreamAPI = {
  // Get all livestreams (with optional filters)
  getAllLivestreams: (params = {}) => {
    return apiClient.get('/livestreams', { params });
  },

  // Get livestream by slug
  getLivestreamBySlug: (slug) => {
    return apiClient.get(`/livestreams/${slug}`);
  },

  // Create livestream
  createLivestream: (data) => {
    return apiClient.post('/livestreams', data);
  },

  // Update livestream
  updateLivestream: (slug, data) => {
    return apiClient.put(`/livestreams/${slug}`, data);
  },

  // Delete/Cancel livestream
  deleteLivestream: (slug) => {
    return apiClient.delete(`/livestreams/${slug}`);
  },

  // Join livestream
  joinLivestream: (slug) => {
    return apiClient.post(`/livestreams/${slug}/join`);
  },

  // Start livestream
  startLivestream: (slug) => {
    return apiClient.post(`/livestreams/${slug}/start`);
  },

  // End livestream
  endLivestream: (slug) => {
    return apiClient.post(`/livestreams/${slug}/end`);
  },

  // Leave livestream
  leaveLivestream: (slug) => {
    return apiClient.post(`/livestreams/${slug}/leave`);
  },

  // Get livestream stats
  getLivestreamStats: (courseId) => {
    return apiClient.get('/livestreams/stats', { params: { course: courseId } });
  },

  // Send reminder
  sendReminder: (slug) => {
    return apiClient.post(`/livestreams/${slug}/reminder`);
  },

  // Get livestreams by course
  getLivestreamsByCourse: (courseId, params = {}) => {
    return apiClient.get('/livestreams', { params: { course: courseId, ...params } });
  }
};