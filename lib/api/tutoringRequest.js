import apiClient from './client';

export const tutoringRequestAPI = {
  // Student: Create new request
  create: (data) => apiClient.post('/tutoring-requests', data),

  // Student: Get my requests (with optional status filter)
  getMyRequests: (params = {}) => apiClient.get('/tutoring-requests/my-requests', { params }),

  // Student: Get single request by ID
  getById: (id) => apiClient.get(`/tutoring-requests/${id}`),

  // Admin: Get all requests (used in Plan 03)
  getAll: (params = {}) => apiClient.get('/tutoring-requests', { params }),

  // Admin: Assign instructor (used in Plan 03)
  assignInstructor: (id, instructorId, platformFeePercentage) =>
    apiClient.post(`/tutoring-requests/${id}/assign`, { instructorId, platformFeePercentage }),

  // Admin: Reject request (used in Plan 03)
  reject: (id, reason) => apiClient.post(`/tutoring-requests/${id}/reject`, { reason }),

  // Admin: Update notes (used in Plan 03)
  updateNotes: (id, notes) => apiClient.patch(`/tutoring-requests/${id}/notes`, { notes })
};
