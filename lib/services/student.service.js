/**
 * Student Service
 * Handles student-specific operations (dashboard, profile, progress, settings)
 */

import apiClient from '../api/client';

class StudentService {
  /**
   * Get student dashboard data
   * @returns {Promise<{stats: Object, enrolledCourses: Array, upcomingClasses: Array, recentActivity: Array, announcements: Array}>}
   */
  async getDashboard() {
    return await apiClient.get('/student/dashboard');
  }

  /**
   * Get student profile
   * @returns {Promise<Object>}
   */
  async getProfile() {
    return await apiClient.get('/student/profile');
  }

  /**
   * Update student profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<{user: Object, message: string}>}
   */
  async updateProfile(profileData) {
    return await apiClient.put('/student/profile', profileData);
  }

  /**
   * Update profile picture
   * @param {File} file - Image file
   * @returns {Promise<{profile_picture_url: string, message: string}>}
   */
  async updateProfilePicture(file) {
    const formData = new FormData();
    formData.append('profile_picture', file);

    return await apiClient.post('/auth/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get student progress/achievements
   * @returns {Promise<{totalStudyHours: number, completedCourses: number, certificates: Array, achievements: Array}>}
   */
  async getProgress() {
    return await apiClient.get('/student/progress');
  }

  /**
   * Get study hours breakdown
   * @param {string} period - 'week'|'month'|'year'
   * @returns {Promise<{labels: Array, data: Array, total: number}>}
   */
  async getStudyHours(period = 'week') {
    return await apiClient.get('/student/study-hours', { params: { period } });
  }

  /**
   * Get recent activity
   * @param {number} limit - Number of activities to fetch
   * @returns {Promise<Array>}
   */
  async getRecentActivity(limit = 10) {
    return await apiClient.get('/student/activity', { params: { limit } });
  }

  /**
   * Get payment history
   * @param {Object} params - Pagination params
   * @returns {Promise<{payments: Array, total: number}>}
   */
  async getPaymentHistory(params = {}) {
    return await apiClient.get('/student/payments', { params });
  }

  /**
   * Get student settings
   * @returns {Promise<Object>}
   */
  async getSettings() {
    return await apiClient.get('/student/settings');
  }

  /**
   * Update student settings
   * @param {Object} settings - Settings to update
   * @returns {Promise<{settings: Object, message: string}>}
   */
  async updateSettings(settings) {
    return await apiClient.put('/student/settings', settings);
  }

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<{message: string}>}
   */
  async changePassword(currentPassword, newPassword) {
    return await apiClient.post('/student/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  /**
   * Get certificates
   * @returns {Promise<Array>}
   */
  async getCertificates() {
    return await apiClient.get('/student/certificates');
  }

  /**
   * Download certificate
   * @param {string} certificateId - Certificate ID
   * @returns {Promise<Blob>}
   */
  async downloadCertificate(certificateId) {
    return await apiClient.get(`/student/certificates/${certificateId}/download`, {
      responseType: 'blob',
    });
  }

  /**
   * Get notifications
   * @param {Object} params - Query params (read, page, limit)
   * @returns {Promise<{notifications: Array, unreadCount: number, total: number}>}
   */
  async getNotifications(params = {}) {
    return await apiClient.get('/student/notifications', { params });
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<{message: string}>}
   */
  async markNotificationRead(notificationId) {
    return await apiClient.put(`/student/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<{message: string}>}
   */
  async markAllNotificationsRead() {
    return await apiClient.put('/student/notifications/read-all');
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<{message: string}>}
   */
  async deleteNotification(notificationId) {
    return await apiClient.delete(`/student/notifications/${notificationId}`);
  }

  /**
   * Get student statistics
   * @returns {Promise<{totalCourses: number, completedCourses: number, inProgressCourses: number, totalStudyHours: number}>}
   */
  async getStats() {
    return await apiClient.get('/student/stats');
  }

  /**
   * Update parent/guardian information
   * @param {Object} parentData - Parent information
   * @returns {Promise<{message: string}>}
   */
  async updateParentInfo(parentData) {
    return await apiClient.put('/student/parent-info', parentData);
  }

  /**
   * Update academic information
   * @param {Object} academicData - Academic information
   * @returns {Promise<{message: string}>}
   */
  async updateAcademicInfo(academicData) {
    return await apiClient.put('/student/academic-info', academicData);
  }
}

// Export singleton instance
export default new StudentService();
