import apiClient from './client';

export const weekAPI = {
  // Get all weeks for a course
  getWeeksByCourse: (courseId) => {
    return apiClient.get(`/weeks/course/${courseId}`);
  },

  // Get week by ID
  getWeekById: (weekId) => {
    return apiClient.get(`/weeks/${weekId}`);
  },

  // Create week
  createWeek: (data) => {
    return apiClient.post('/weeks/', data);
  },

  // Update week
  updateWeek: (weekId, data) => {
    return apiClient.put(`/weeks/${weekId}`, data);
  },

  // Delete week
  deleteWeek: (weekId) => {
    return apiClient.delete(`/weeks/${weekId}`);
  },

  // Reorder weeks
  reorderWeeks: (courseId, weeksOrder) => {
    return apiClient.put(`/weeks/course/${courseId}/reorder`, { weeksOrder });
  }
};