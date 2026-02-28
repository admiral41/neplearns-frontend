import apiClient from './client';

export const tutoringEnrollmentAPI = {
  // Student: Get my subscriptions
  getMySubscriptions: (params = {}) => apiClient.get('/tutoring-enrollments/my-subscriptions', { params }),

  // Student/Admin: Get subscription by ID
  getById: (id) => apiClient.get(`/tutoring-enrollments/${id}`),

  // Admin: Get all subscriptions
  getAll: (params = {}) => apiClient.get('/tutoring-enrollments', { params }),

  // Admin: Activate subscription
  activate: (id) => apiClient.post(`/tutoring-enrollments/${id}/activate`),

  // Admin: Pause subscription
  pause: (id) => apiClient.post(`/tutoring-enrollments/${id}/pause`),

  // Admin: Cancel subscription
  cancel: (id) => apiClient.post(`/tutoring-enrollments/${id}/cancel`),

  // Admin: Extend subscription
  extend: (id, days) => apiClient.post(`/tutoring-enrollments/${id}/extend`, { days }),
};
