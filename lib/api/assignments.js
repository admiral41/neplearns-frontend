import apiClient, { createMultipartConfig } from "./client";

export const assignmentAPI = {
  createAssignment: (data) => {
    return apiClient.post("/assignments/", data);
  },

  updateAssignment: (id, data) => {
    return apiClient.put(`/assignments/${id}`, data);
  },

  deleteAssignment: (id) => {
    return apiClient.delete(`/assignments/${id}`);
  },

  getAssignment: (id) => {
    return apiClient.get(`/assignments/${id}`);
  },

  toggleAssignmentStatus: (id, isActive) => {
    return apiClient.patch(`/assignments/${id}/toggle-status`, { isActive });
  },

  // Get assignments by filters
  getAssignmentsByLesson: (lessonId) => {
    return apiClient.get(`/assignments/lesson/${lessonId}`);
  },

  getAssignmentsByCourse: (courseId, params = {}) => {
    return apiClient.get(`/assignments/course/${courseId}`, { params });
  },

  // Submissions
  submitAssignment: (assignmentId, data) => {
    return apiClient.post(`/assignments/${assignmentId}/submit`, data);
  },

  getAssignmentSubmissions: (assignmentId, params = {}) => {
    return apiClient.get(`/assignments/${assignmentId}/submissions`, {
      params,
    });
  },

  gradeSubmission: (submissionId, data) => {
    return apiClient.post(
      `/assignments/submissions/${submissionId}/grade`,
      data,
    );
  },

  getSubmission: (submissionId) => {
    return apiClient.get(`/assignments/submissions/${submissionId}`);
  },

  // User assignments (for student dashboard)
  getMyAssignments: (params = {}) => {
    return apiClient.get("/assignments/user/assignments/me", { params });
  },

  // User submissions
  getMySubmissions: (params = {}) => {
    return apiClient.get("/assignments/user/submissions/me", { params });
  },

  getUserSubmissions: (userId, params = {}) => {
    return apiClient.get(`/assignments/user/${userId}/submissions`, { params });
  },

  updateSubmission: (submissionId, data) => {
    return apiClient.put(`/assignments/submissions/${submissionId}`, data);
  },

  // Instructor/Admin pending submissions
  getPendingSubmissions: (params = {}) => {
    return apiClient.get("/assignments/instructor/pending-submissions", { params });
  },

  // Instructor/Admin all submissions
  getAllSubmissions: (params = {}) => {
    return apiClient.get("/assignments/instructor/all-submissions", { params });
  },
};
