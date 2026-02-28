import apiClient, { createMultipartConfig } from './client';

export const tutoringAssignmentAPI = {
  // ======================= INSTRUCTOR ENDPOINTS =======================

  // Create a new assignment (with optional file attachments)
  createAssignment: (formData) => {
    return apiClient.post('/tutoring-assignments', formData, createMultipartConfig());
  },

  // Get instructor's assignments
  getInstructorAssignments: (params = {}) => {
    return apiClient.get('/tutoring-assignments/instructor', { params });
  },

  // Update an assignment
  updateAssignment: (id, data) => {
    return apiClient.patch(`/tutoring-assignments/${id}`, data);
  },

  // Delete an assignment
  deleteAssignment: (id) => {
    return apiClient.delete(`/tutoring-assignments/${id}`);
  },

  // Give feedback on a submission
  giveFeedback: (id, data) => {
    return apiClient.post(`/tutoring-assignments/${id}/feedback`, data);
  },

  // Request changes on a submission
  requestChanges: (id, data) => {
    return apiClient.post(`/tutoring-assignments/${id}/request-changes`, data);
  },

  // ======================= STUDENT ENDPOINTS =======================

  // Get student's assignments
  getStudentAssignments: (params = {}) => {
    return apiClient.get('/tutoring-assignments/student', { params });
  },

  // Submit work for an assignment (with optional file attachments)
  submitAssignment: (id, formData) => {
    return apiClient.post(`/tutoring-assignments/${id}/submit`, formData, createMultipartConfig());
  },

  // ======================= SHARED ENDPOINTS =======================

  // Get assignment by ID
  getAssignmentById: (id) => {
    return apiClient.get(`/tutoring-assignments/${id}`);
  },
};
