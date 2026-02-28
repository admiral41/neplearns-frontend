/**
 * Live Class Service
 * Handles live class scheduling, joining, and recordings
 */

import apiClient from '../api/client';

class LiveClassService {
  /**
   * Get all upcoming live classes for student
   * @param {Object} params - Query params (date, course_id)
   * @returns {Promise<Array>}
   */
  async getUpcomingClasses(params = {}) {
    return await apiClient.get('/live-classes/upcoming', { params });
  }

  /**
   * Get live class by ID
   * @param {string} classId - Live class ID
   * @returns {Promise<Object>}
   */
  async getLiveClassById(classId) {
    return await apiClient.get(`/live-classes/${classId}`);
  }

  /**
   * Join live class
   * @param {string} classId - Live class ID
   * @returns {Promise<{join_url: string, meeting_id: string, password: string}>}
   */
  async joinLiveClass(classId) {
    return await apiClient.post(`/live-classes/${classId}/join`);
  }

  /**
   * Get live class recordings
   * @param {string} classId - Live class ID
   * @returns {Promise<Array>}
   */
  async getClassRecordings(classId) {
    return await apiClient.get(`/live-classes/${classId}/recordings`);
  }

  /**
   * Get all recorded classes for student
   * @param {Object} params - Pagination and filter params
   * @returns {Promise<{recordings: Array, total: number}>}
   */
  async getRecordedClasses(params = {}) {
    return await apiClient.get('/live-classes/recordings', { params });
  }

  /**
   * Get class attendance status
   * @param {string} classId - Live class ID
   * @returns {Promise<{attended: boolean, duration: number}>}
   */
  async getAttendanceStatus(classId) {
    return await apiClient.get(`/live-classes/${classId}/attendance`);
  }

  /**
   * Mark attendance for live class
   * @param {string} classId - Live class ID
   * @returns {Promise<{message: string}>}
   */
  async markAttendance(classId) {
    return await apiClient.post(`/live-classes/${classId}/attendance`);
  }

  /**
   * Get student's live class schedule (calendar view)
   * @param {string} month - Month in YYYY-MM format
   * @returns {Promise<Array>}
   */
  async getClassSchedule(month) {
    return await apiClient.get('/live-classes/schedule', { params: { month } });
  }

  /**
   * Get live class chat messages
   * @param {string} classId - Live class ID
   * @returns {Promise<Array>}
   */
  async getClassChat(classId) {
    return await apiClient.get(`/live-classes/${classId}/chat`);
  }

  /**
   * Send chat message in live class
   * @param {string} classId - Live class ID
   * @param {string} message - Chat message
   * @returns {Promise<{message: Object}>}
   */
  async sendChatMessage(classId, message) {
    return await apiClient.post(`/live-classes/${classId}/chat`, { message });
  }
}

// Export singleton instance
export default new LiveClassService();
