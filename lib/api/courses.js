import apiClient, { createMultipartConfig } from './client';

export const courseAPI = {
  // Get all courses (with optional filters)
  getAllCourses: (params = {}) => {
    return apiClient.get('/course', { params });
  },

  // Get pending course requests (admin only)
  getPendingCourses: (params = {}) => {
    return apiClient.get('/course/admin/pending', { params });
  },

  // Get course by slug
  getCourseBySlug: (slug) => {
    return apiClient.get(`/course/${slug}`);
  },

  // Create course (admin - auto approved)
  createCourse: (formData) => {
    return apiClient.post('/course/admin/create', formData, createMultipartConfig());
  },

  // Create course as lecturer (pending approval)
  createCourseAsLecturer: (formData) => {
    return apiClient.post('/course/create', formData, createMultipartConfig());
  },

  // Update course
  updateCourse: (slug, formData) => {
    return apiClient.put(`/course/${slug}`, formData, createMultipartConfig());
  },

  // Delete/Archive course
  deleteCourse: (slug) => {
    return apiClient.delete(`/course/${slug}`);
  },

  // Process course request (approve/reject)
  processCourseRequest: (id, data) => {
    return apiClient.put(`/course/admin/${id}/process`, data);
  },

  // Toggle publish status
  togglePublish: (slug, publish) => {
    return apiClient.put(`/course/admin/${slug}/publish`, { publish });
  },

  // Assign lecturers to course
  assignLecturers: (slug, lecturerIds) => {
    return apiClient.put(`/course/admin/${slug}/assign-lecturers`, { lecturers: lecturerIds });
  },

  // Remove lecturer from course
  removeLecturer: (slug, lecturerId) => {
    return apiClient.delete(`/course/admin/${slug}/lecturers/${lecturerId}`);
  },

  // Get my courses (enrolled, teaching, created, pending)
  getMyCourses: (type = 'enrolled') => {
    return apiClient.get('/course/my-courses/all', { params: { type } });
  },

  // Enroll in course
  enrollInCourse: (slug) => {
    return apiClient.post(`/course/${slug}/enroll`);
  },

  // Search courses
  searchCourses: (query, params = {}) => {
    return apiClient.get('/course/search', { params: { q: query, ...params } });
  },

  // Get course rating stats
  getCourseRating: (slug) => {
    return apiClient.get(`/course/${slug}/rating`);
  },

  // Rate a course (one-time only)
  rateCourse: (slug, rating) => {
    return apiClient.post(`/course/${slug}/rating`, { rating });
  }
};