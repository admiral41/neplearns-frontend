import apiClient, { createMultipartConfig } from "./client";

export const assessmentAPI = {
  createAssessment: (data) => {
    return apiClient.post("/assessments/", data);
  },

  updateAssessment: (id, data) => {
    return apiClient.put(`/assessments/${id}`, data);
  },

  deleteAssessment: (id) => {
    return apiClient.delete(`/assessments/${id}`);
  },

  getAssessment: (id) => {
    return apiClient.get(`/assessments/${id}`);
  },

  toggleAssessmentStatus: (id, isActive) => {
    return apiClient.patch(`/assessments/${id}/toggle-status`, { isActive });
  },

  // Get assessments by filters
  getAssessmentsByLesson: (lessonId) => {
    return apiClient.get(`/assessments/lesson/${lessonId}`);
  },

  getAssessmentsByCourse: (courseId, params = {}) => {
    return apiClient.get(`/assessments/course/${courseId}`, { params });
  },

  // Submissions
  submitAssessment: (assessmentId, data) => {
    return apiClient.post(`/assessments/${assessmentId}/submit`, data);
  },

  getAssessmentSubmissions: (assessmentId, params = {}) => {
    return apiClient.get(`/assessments/${assessmentId}/submissions`, {
      params,
    });
  },

  gradeSubmission: (submissionId, data) => {
    return apiClient.post(
      `/assessments/submissions/${submissionId}/grade`,
      data,
    );
  },

  getSubmission: (submissionId) => {
    return apiClient.get(`/assessments/submissions/${submissionId}`);
  },

  // User assessments (for student dashboard)
  getMyAssessments: (params = {}) => {
    return apiClient.get("/assessments/user/assessments/me", { params });
  },

  // User submissions
  getMySubmissions: (params = {}) => {
    return apiClient.get("/assessments/user/submissions/me", { params });
  },

  getUserSubmissions: (userId, params = {}) => {
    return apiClient.get(`/assessments/user/${userId}/submissions`, { params });
  },

  updateSubmission: (submissionId, data) => {
    return apiClient.put(`/assessments/submissions/${submissionId}`, data);
  },
};
