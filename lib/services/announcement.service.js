
/**
 * Announcement Service
 * Handles announcements for users (students/instructors)
 */

import apiClient from '../api/client';

class AnnouncementService {
  /**
   * Get announcements for current user (filtered by role)
   * @param {Object} params - Query params (page, limit)
   * @returns {Promise<{announcements: Array, unreadCount: number, pagination: Object}>}
   */
  async getAnnouncements(params = {}) {
    return await apiClient.get('/announcements', { params });
  }

  /**
   * Mark announcement as read
   * @param {string} announcementId - Announcement ID
   * @returns {Promise<{message: string}>}
   */
  async markAsRead(announcementId) {
    return await apiClient.patch(`/announcements/${announcementId}/read`);
  }
}

// Export singleton instance
export default new AnnouncementService();
