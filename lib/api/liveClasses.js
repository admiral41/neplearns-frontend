import apiClient from './client';

export const liveClassAPI = {
  // ======================= CREATE LIVE CLASS =======================
  createLiveClass: (data) => {
    return apiClient.post('/live-classes', data);
  },

  // ======================= GET ALL LIVE CLASSES =======================
  getAllLiveClasses: (params = {}) => {
    return apiClient.get('/live-classes', { params });
  },

  // ======================= GET LIVE CLASS BY ID =======================
  getLiveClassById: (liveClassId) => {
    return apiClient.get(`/live-classes/${liveClassId}`);
  },

  // ======================= GET LIVE CLASSES BY COURSE =======================
  getLiveClassesByCourse: (courseId, filters = {}) => {
    return apiClient.get(`/live-classes/course/${courseId}`, { params: filters });
  },
  getZoomMeetingDetails: (liveClassId) => {
  return apiClient.get(`/live-classes/${liveClassId}/zoom-details`);
},

  // ======================= GET UPCOMING LIVE CLASSES =======================
  getUpcomingLiveClasses: (params = {}) => {
    return apiClient.get('/live-classes/upcoming', { params });
  },

  // ======================= UPDATE LIVE CLASS =======================
  updateLiveClass: (liveClassId, data) => {
    return apiClient.put(`/live-classes/${liveClassId}`, data);
  },

  // ======================= DELETE LIVE CLASS =======================
  deleteLiveClass: (liveClassId) => {
    return apiClient.delete(`/live-classes/${liveClassId}`);
  },

  // ======================= START LIVE CLASS =======================
  startLiveClass: (liveClassId) => {
    return apiClient.post(`/live-classes/${liveClassId}/start`);
  },

  // ======================= END LIVE CLASS =======================
  endLiveClass: (liveClassId, data = {}) => {
    return apiClient.post(`/live-classes/${liveClassId}/end`, data);
  },

  // ======================= GET JOIN INFO =======================
  getJoinInfo: (liveClassId) => {
    return apiClient.get(`/live-classes/${liveClassId}/join`);
  },

  // ======================= MARK ATTENDANCE =======================
  markAttendance: (liveClassId) => {
    return apiClient.post(`/live-classes/${liveClassId}/attendance`);
  },

  // ======================= GET RECORDING INFO =======================
  getRecordingInfo: (liveClassId) => {
    return apiClient.get(`/live-classes/${liveClassId}/recording`);
  },

  // ======================= GET ATTENDANCE REPORT =======================
  getAttendanceReport: (liveClassId) => {
    return apiClient.get(`/live-classes/${liveClassId}/attendance-report`);
  },

  // ======================= CANCEL LIVE CLASS =======================
  cancelLiveClass: (liveClassId) => {
    return apiClient.delete(`/live-classes/${liveClassId}/cancel`);
  },

  // ======================= RESCHEDULE LIVE CLASS =======================
  rescheduleLiveClass: (liveClassId, newDateTime) => {
    return apiClient.put(`/live-classes/${liveClassId}/reschedule`, {
      scheduledDateTime: newDateTime
    });
  },

  // ======================= GET LIVE CLASS STATS =======================
  getLiveClassStats: (courseId = null) => {
    const params = courseId ? { course: courseId } : {};
    return apiClient.get('/live-classes/stats', { params });
  },

  // ======================= SEND LIVE CLASS REMINDER =======================
  sendReminder: (liveClassId) => {
    return apiClient.post(`/live-classes/${liveClassId}/send-reminder`);
  }
};