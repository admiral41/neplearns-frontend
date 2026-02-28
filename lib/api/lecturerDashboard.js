import apiClient, { createMultipartConfig } from './client';

export const lecturerDashboardAPI = {
  // Dashboard Overview
  getDashboardOverview: () => {
    return apiClient.get('/lecturer-dashboard/overview');
  },

  // Get lecturer's courses with stats
  getLecturerCourses: (params = {}) => {
    return apiClient.get('/lecturer-dashboard/courses', { params });
  },

  // Get course students
  getCourseStudents: (slug, params = {}) => {
    return apiClient.get(`/lecturer-dashboard/courses/${slug}/students`, { params });
  },

  // Get student progress details
  getStudentProgress: (slug, studentId) => {
    return apiClient.get(`/lecturer-dashboard/courses/${slug}/students/${studentId}/progress`);
  },

  // Get course analytics
  getCourseAnalytics: (slug, params = {}) => {
    return apiClient.get(`/lecturer-dashboard/courses/${slug}/analytics`, { params });
  },

  // Get course assessments
  getCourseAssessments: (slug, params = {}) => {
    return apiClient.get(`/lecturer-dashboard/courses/${slug}/assessments`, { params });
  },

  // Get assessment submissions
  getAssessmentSubmissions: (assessmentId, params = {}) => {
    return apiClient.get(`/lecturer-dashboard/assessments/${assessmentId}/submissions`, { params });
  },

  // Grade submission
  gradeSubmission: (submissionId, data) => {
    return apiClient.put(`/lecturer-dashboard/submissions/${submissionId}/grade`, data);
  },

  // Get lecturer earnings
  getLecturerEarnings: (params = {}) => {
    return apiClient.get('/lecturer-dashboard/earnings', { params });
  },

  // Send message to student
  sendMessageToStudent: (studentId, data) => {
    return apiClient.post(`/lecturer-dashboard/students/${studentId}/message`, data);
  },

  // Export student data
  exportStudentData: (slug, params = {}) => {
    return apiClient.get(`/lecturer-dashboard/courses/${slug}/export`, {
      params,
      responseType: 'blob'
    });
  }
};