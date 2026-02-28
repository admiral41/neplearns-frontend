import apiClient from './client';

export const tutoringSessionAPI = {
  // ======================= INSTRUCTOR ENDPOINTS =======================

  // Get instructor's assigned students grouped by subject
  getMyStudents: (params = {}) => {
    return apiClient.get('/tutoring-sessions/my-students', { params });
  },

  // Get instructor's sessions
  getInstructorSessions: (params = {}) => {
    return apiClient.get('/tutoring-sessions/instructor', { params });
  },

  // Create a new session
  createSession: (data) => {
    return apiClient.post('/tutoring-sessions', data);
  },

  // Update a session
  updateSession: (id, data) => {
    return apiClient.patch(`/tutoring-sessions/${id}`, data);
  },

  // Cancel a session
  cancelSession: (id) => {
    return apiClient.delete(`/tutoring-sessions/${id}`);
  },

  // Start session early (go live)
  startSession: (id) => {
    return apiClient.post(`/tutoring-sessions/${id}/start`);
  },

  // End a live session
  endSession: (id) => {
    return apiClient.post(`/tutoring-sessions/${id}/end`);
  },

  // Mark attendance
  markAttendance: (id, attendance) => {
    return apiClient.post(`/tutoring-sessions/${id}/attendance`, { attendance });
  },

  // ======================= STUDENT ENDPOINTS =======================

  // Get student's sessions
  getStudentSessions: (params = {}) => {
    return apiClient.get('/tutoring-sessions/student', { params });
  },

  // ======================= SHARED ENDPOINTS =======================

  // Get session by ID
  getSessionById: (id) => {
    return apiClient.get(`/tutoring-sessions/${id}`);
  },
};
