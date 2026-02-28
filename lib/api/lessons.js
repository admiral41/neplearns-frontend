import apiClient from './client';

export const lessonAPI = {
  // Get all lessons for a course (bulk endpoint)
  getLessonsByCourse: async (courseId) => {
    return apiClient.get(`/lessons/course/${courseId}`);
  },

  // Get lessons by week
  getLessonsByWeek: async (weekId) => {
    return apiClient.get(`/lessons/week/${weekId}`);
  },

  // Alias for getLessonsByWeek (for consistency)
  getWeekLessons: async (weekId) => {
    return apiClient.get(`/lessons/week/${weekId}`);
  },

  // Create lesson
  createLesson: async (lessonData) => {
    return apiClient.post('/lessons', lessonData);
  },

  // Update lesson
  updateLesson: async (lessonId, lessonData) => {
    return apiClient.put(`/lessons/${lessonId}`, lessonData);
  },

  // Delete lesson
  deleteLesson: async (lessonId) => {
    return apiClient.delete(`/lessons/${lessonId}`);
  },

  // Reorder lesson
  reorderLesson: async (lessonId, direction) => {
    return apiClient.put(`/lessons/${lessonId}/reorder`, { direction });
  },

  // Toggle lesson status
  toggleLessonStatus: async (lessonId, isActive) => {
    return apiClient.put(`/lessons/${lessonId}/status`, { isActive });
  },

  // Get lesson by ID
  getLessonById: async (lessonId) => {
    return apiClient.get(`/lessons/${lessonId}`);
  },

  // Get lesson by slug (if needed)
  getLessonBySlug: async (slug) => {
    return apiClient.get(`/lessons/slug/${slug}`);
  },
};