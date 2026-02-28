/**
 * Admin Service
 * Handles admin-specific operations (users, courses, payments, settings)
 */

import apiClient from '../api/client';

class AdminService {
  // ==================== Dashboard ====================

  /**
   * Get admin dashboard data
   * @returns {Promise<{stats: Object, recentPayments: Array, pendingApprovals: Array, recentActivity: Array}>}
   */
  async getDashboard() {
    return await apiClient.get('/admin/dashboard');
  }

  /**
   * Get platform analytics
   * @param {Object} params - Query params (period, startDate, endDate)
   * @returns {Promise<Object>}
   */
  async getAnalytics(params = {}) {
    return await apiClient.get('/admin/analytics', { params });
  }

  // ==================== Users ====================

  /**
   * Get all users with filters
   * @param {Object} params - Query params (role, status, search, page, limit)
   * @returns {Promise<{users: Array, total: number, page: number}>}
   */
  async getUsers(params = {}) {
    return await apiClient.get('/admin/users', { params });
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getUser(userId) {
    return await apiClient.get(`/admin/users/${userId}`);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<{user: Object, message: string}>}
   */
  async createUser(userData) {
    return await apiClient.post('/admin/users', userData);
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<{user: Object, message: string}>}
   */
  async updateUser(userId, userData) {
    return await apiClient.put(`/admin/users/${userId}`, userData);
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<{message: string}>}
   */
  async deleteUser(userId) {
    return await apiClient.delete(`/admin/users/${userId}`);
  }

  /**
   * Suspend user
   * @param {string} userId - User ID
   * @param {string} reason - Suspension reason
   * @returns {Promise<{user: Object, message: string}>}
   */
  async suspendUser(userId, reason) {
    return await apiClient.post(`/admin/users/${userId}/suspend`, { reason });
  }

  /**
   * Activate user
   * @param {string} userId - User ID
   * @returns {Promise<{user: Object, message: string}>}
   */
  async activateUser(userId) {
    return await apiClient.post(`/admin/users/${userId}/activate`);
  }

  /**
   * Reset user password
   * @param {string} userId - User ID
   * @returns {Promise<{message: string, temporaryPassword: string}>}
   */
  async resetUserPassword(userId) {
    return await apiClient.post(`/admin/users/${userId}/reset-password`);
  }

  /**
   * Resend verification email to user
   * @param {string} userId - User ID
   * @returns {Promise<{message: string}>}
   */
  async resendVerificationEmail(userId) {
    return await apiClient.post(`/admin/users/${userId}/resend-verification`);
  }

  /**
   * Get user activity
   * @param {string} userId - User ID
   * @param {Object} params - Query params
   * @returns {Promise<{activities: Array}>}
   */
  async getUserActivity(userId, params = {}) {
    return await apiClient.get(`/admin/users/${userId}/activity`, { params });
  }

  // ==================== Instructor Applications ====================

  /**
   * Get pending instructor applications
   * @param {Object} params - Query params (status, page, limit)
   * @returns {Promise<Array>}
   */
  async getApplications(params = {}) {
    return await apiClient.get('/verification/lecturers/pending', { params });
  }

  /**
   * Get all lecturers with optional status filter
   * @param {Object} params - Query params (status, page, limit, search)
   * @returns {Promise<Object>}
   */
  async getAllLecturers(params = {}) {
    return await apiClient.get('/verification/lecturers', { params });
  }

  /**
   * Get lecturer/application by ID
   * @param {string} applicationId - Lecturer ID
   * @returns {Promise<Object>}
   */
  async getApplication(applicationId) {
    return await apiClient.get(`/verification/lecturers/${applicationId}`);
  }

  /**
   * Approve instructor application
   * @param {string} applicationId - Lecturer ID
   * @returns {Promise<{user: Object, message: string}>}
   */
  async approveApplication(applicationId) {
    return await apiClient.put(`/verification/lecturers/${applicationId}/process`, { action: 'approve' });
  }

  /**
   * Reject instructor application
   * @param {string} applicationId - Lecturer ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<{message: string}>}
   */
  async rejectApplication(applicationId, reason) {
    return await apiClient.put(`/verification/lecturers/${applicationId}/process`, { action: 'reject', rejectionReason: reason });
  }

  // ==================== Courses ====================

  /**
   * Get all courses with filters
   * @param {Object} params - Query params (status, featured, search, page, limit)
   * @returns {Promise<{courses: Array, total: number}>}
   */
  async getCourses(params = {}) {
    return await apiClient.get('/admin/courses', { params });
  }

  /**
   * Get pending courses for approval
   * @param {Object} params - Query params (page, limit)
   * @returns {Promise<{data: Array, total: number}>}
   */
  async getPendingCourses(params = {}) {
    return await apiClient.get('/course/admin/pending', { params });
  }

  /**
   * Get course by ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>}
   */
  async getCourse(courseId) {
    return await apiClient.get(`/admin/courses/${courseId}`);
  }

  /**
   * Update course
   * @param {string} courseId - Course ID
   * @param {Object} courseData - Course data to update
   * @returns {Promise<{course: Object, message: string}>}
   */
  async updateCourse(courseId, courseData) {
    return await apiClient.put(`/admin/courses/${courseId}`, courseData);
  }

  /**
   * Delete course
   * @param {string} courseId - Course ID
   * @returns {Promise<{message: string}>}
   */
  async deleteCourse(courseId) {
    return await apiClient.delete(`/admin/courses/${courseId}`);
  }

  /**
   * Approve course
   * @param {string} courseId - Course ID
   * @param {boolean} publishDirectly - Whether to publish immediately
   * @returns {Promise<{course: Object, message: string}>}
   */
  async approveCourse(courseId, publishDirectly = true) {
    return await apiClient.put(`/course/admin/${courseId}/process`, {
      action: 'approve',
      publishDirectly
    });
  }

  /**
   * Reject course
   * @param {string} courseId - Course ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<{message: string}>}
   */
  async rejectCourse(courseId, reason) {
    return await apiClient.put(`/course/admin/${courseId}/process`, {
      action: 'reject',
      reason
    });
  }

  /**
   * Feature course
   * @param {string} courseId - Course ID
   * @returns {Promise<{course: Object, message: string}>}
   */
  async featureCourse(courseId) {
    return await apiClient.post(`/admin/courses/${courseId}/feature`);
  }

  /**
   * Unfeature course
   * @param {string} courseId - Course ID
   * @returns {Promise<{course: Object, message: string}>}
   */
  async unfeatureCourse(courseId) {
    return await apiClient.post(`/admin/courses/${courseId}/unfeature`);
  }

  /**
   * Get course students
   * @param {string} courseId - Course ID
   * @param {Object} params - Query params
   * @returns {Promise<{students: Array, total: number}>}
   */
  async getCourseStudents(courseId, params = {}) {
    return await apiClient.get(`/admin/courses/${courseId}/students`, { params });
  }

  /**
   * Get course reviews
   * @param {string} courseId - Course ID
   * @param {Object} params - Query params
   * @returns {Promise<{reviews: Array, total: number}>}
   */
  async getCourseReviews(courseId, params = {}) {
    return await apiClient.get(`/admin/courses/${courseId}/reviews`, { params });
  }

  /**
   * Delete course review
   * @param {string} reviewId - Review ID
   * @returns {Promise<{message: string}>}
   */
  async deleteCourseReview(reviewId) {
    return await apiClient.delete(`/admin/reviews/${reviewId}`);
  }

  // ==================== Enrollments ====================

  /**
   * Get all enrollments
   * @param {Object} params - Query params (search, courseId, status, paymentMethod, startDate, endDate, page, limit)
   * @returns {Promise<{data: Array, pagination: Object, stats: Object}>}
   */
  async getEnrollments(params = {}) {
    return await apiClient.get('/admin/enrollments', { params });
  }

  /**
   * Get enrollment by ID
   * @param {string} enrollmentId - Enrollment ID
   * @returns {Promise<Object>}
   */
  async getEnrollment(enrollmentId) {
    return await apiClient.get(`/admin/enrollments/${enrollmentId}`);
  }

  /**
   * Update enrollment status
   * @param {string} enrollmentId - Enrollment ID
   * @param {Object} data - Update data (status, progress)
   * @returns {Promise<{data: Object, message: string}>}
   */
  async updateEnrollment(enrollmentId, data) {
    return await apiClient.put(`/admin/enrollments/${enrollmentId}`, data);
  }

  /**
   * Get enrollment statistics
   * @param {Object} params - Query params (period)
   * @returns {Promise<Object>}
   */
  async getEnrollmentStats(params = {}) {
    return await apiClient.get('/admin/enrollments/stats', { params });
  }

  /**
   * Get courses for enrollment filter
   * @returns {Promise<{data: Array}>}
   */
  async getCoursesForFilter() {
    return await apiClient.get('/admin/enrollments/courses');
  }

  // ==================== Payments ====================

  /**
   * Get all payments
   * @param {Object} params - Query params (status, method, startDate, endDate, page, limit)
   * @returns {Promise<{payments: Array, total: number, stats: Object}>}
   */
  async getPayments(params = {}) {
    return await apiClient.get('/admin/payments', { params });
  }

  /**
   * Get payment by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>}
   */
  async getPayment(paymentId) {
    return await apiClient.get(`/admin/payments/${paymentId}`);
  }

  /**
   * Get payment statistics
   * @param {Object} params - Query params (period)
   * @returns {Promise<{totalRevenue: number, breakdown: Array, chart: Array}>}
   */
  async getPaymentStats(params = {}) {
    return await apiClient.get('/admin/payments/stats', { params });
  }

  /**
   * Export payments
   * @param {Object} params - Query params
   * @returns {Promise<Blob>}
   */
  async exportPayments(params = {}) {
    return await apiClient.get('/admin/payments/export', {
      params,
      responseType: 'blob',
    });
  }

  // ==================== Refunds ====================

  /**
   * Get refund requests
   * @param {Object} params - Query params (status, page, limit)
   * @returns {Promise<{refunds: Array, total: number}>}
   */
  async getRefundRequests(params = {}) {
    return await apiClient.get('/admin/refunds', { params });
  }

  /**
   * Get refund by ID
   * @param {string} refundId - Refund ID
   * @returns {Promise<Object>}
   */
  async getRefund(refundId) {
    return await apiClient.get(`/admin/refunds/${refundId}`);
  }

  /**
   * Approve refund
   * @param {string} refundId - Refund ID
   * @returns {Promise<{refund: Object, message: string}>}
   */
  async approveRefund(refundId) {
    return await apiClient.post(`/admin/refunds/${refundId}/approve`);
  }

  /**
   * Reject refund
   * @param {string} refundId - Refund ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<{message: string}>}
   */
  async rejectRefund(refundId, reason) {
    return await apiClient.post(`/admin/refunds/${refundId}/reject`, { reason });
  }

  // ==================== Payouts ====================

  /**
   * Get pending payouts
   * @param {Object} params - Query params
   * @returns {Promise<{payouts: Array, total: number}>}
   */
  async getPendingPayouts(params = {}) {
    return await apiClient.get('/admin/payouts/pending', { params });
  }

  /**
   * Get payout history
   * @param {Object} params - Query params (page, limit)
   * @returns {Promise<{payouts: Array, total: number}>}
   */
  async getPayoutHistory(params = {}) {
    return await apiClient.get('/admin/payouts/history', { params });
  }

  /**
   * Process payout
   * @param {string} instructorId - Instructor ID
   * @param {number} amount - Payout amount
   * @returns {Promise<{payout: Object, message: string}>}
   */
  async processPayout(instructorId, amount) {
    return await apiClient.post('/admin/payouts/process', { instructorId, amount });
  }

  /**
   * Get payout settings
   * @returns {Promise<Object>}
   */
  async getPayoutSettings() {
    return await apiClient.get('/admin/payouts/settings');
  }

  /**
   * Update payout settings
   * @param {Object} settings - Payout settings
   * @returns {Promise<{settings: Object, message: string}>}
   */
  async updatePayoutSettings(settings) {
    return await apiClient.put('/admin/payouts/settings', settings);
  }

  // ==================== Announcements ====================

  /**
   * Get announcements
   * @param {Object} params - Query params (target, status, page, limit)
   * @returns {Promise<{announcements: Array, total: number}>}
   */
  async getAnnouncements(params = {}) {
    return await apiClient.get('/admin/announcements', { params });
  }

  /**
   * Get announcement by ID
   * @param {string} announcementId - Announcement ID
   * @returns {Promise<Object>}
   */
  async getAnnouncement(announcementId) {
    return await apiClient.get(`/admin/announcements/${announcementId}`);
  }

  /**
   * Create announcement
   * @param {Object} announcementData - Announcement data (title, message, target, scheduledAt)
   * @returns {Promise<{announcement: Object, message: string}>}
   */
  async createAnnouncement(announcementData) {
    return await apiClient.post('/admin/announcements', announcementData);
  }

  /**
   * Update announcement
   * @param {string} announcementId - Announcement ID
   * @param {Object} announcementData - Announcement data
   * @returns {Promise<{announcement: Object, message: string}>}
   */
  async updateAnnouncement(announcementId, announcementData) {
    return await apiClient.put(`/admin/announcements/${announcementId}`, announcementData);
  }

  /**
   * Delete announcement
   * @param {string} announcementId - Announcement ID
   * @returns {Promise<{message: string}>}
   */
  async deleteAnnouncement(announcementId) {
    return await apiClient.delete(`/admin/announcements/${announcementId}`);
  }

  // ==================== Activity Logs ====================

  /**
   * Get activity logs
   * @param {Object} params - Query params (type, userId, startDate, endDate, page, limit)
   * @returns {Promise<{logs: Array, total: number}>}
   */
  async getActivityLogs(params = {}) {
    return await apiClient.get('/admin/activity-logs', { params });
  }

  /**
   * Export activity logs
   * @param {Object} params - Query params
   * @returns {Promise<Blob>}
   */
  async exportActivityLogs(params = {}) {
    return await apiClient.get('/admin/activity-logs/export', {
      params,
      responseType: 'blob',
    });
  }

  // ==================== Settings ====================

  /**
   * Get platform settings
   * @returns {Promise<Object>}
   */
  async getSettings() {
    return await apiClient.get('/settings');
  }

  /**
   * Update all platform settings
   * @param {Object} settings - Settings to update
   * @returns {Promise<{data: Object, msg: string}>}
   */
  async updateSettings(settings) {
    return await apiClient.put('/settings', settings);
  }

  /**
   * Update general settings
   * @param {Object} settings - General settings (platformName, tagline, description)
   * @returns {Promise<{data: Object, msg: string}>}
   */
  async updateGeneralSettings(settings) {
    return await apiClient.put('/settings/general', settings);
  }

  /**
   * Update contact settings
   * @param {Object} settings - Contact settings (contactEmail, supportEmail, phone, address)
   * @returns {Promise<{data: Object, msg: string}>}
   */
  async updateContactSettings(settings) {
    return await apiClient.put('/settings/contact', settings);
  }

  /**
   * Update social links
   * @param {Object} links - Social links (facebook, instagram, twitter, linkedin, youtube)
   * @returns {Promise<{data: Object, msg: string}>}
   */
  async updateSocialLinks(links) {
    return await apiClient.put('/settings/social', links);
  }

  /**
   * Update feature toggles
   * @param {Object} features - Feature settings
   * @returns {Promise<{data: Object, msg: string}>}
   */
  async updateFeatures(features) {
    return await apiClient.put('/settings/features', features);
  }

  /**
   * Toggle a single feature
   * @param {string} feature - Feature name
   * @returns {Promise<{data: Object, msg: string}>}
   */
  async toggleFeature(feature) {
    return await apiClient.post(`/settings/features/${feature}/toggle`);
  }

  /**
   * Upload platform logo
   * @param {File} file - Logo file (JPG, PNG, WEBP, SVG - max 1MB)
   * @returns {Promise<{data: {logo: string, settings: Object}, msg: string}>}
   */
  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('logo', file);
    return await apiClient.post('/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /**
   * Get email templates
   * @returns {Promise<{templates: Array}>}
   */
  async getEmailTemplates() {
    return await apiClient.get('/admin/settings/email-templates');
  }

  /**
   * Get email template by ID
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>}
   */
  async getEmailTemplate(templateId) {
    return await apiClient.get(`/admin/settings/email-templates/${templateId}`);
  }

  /**
   * Update email template
   * @param {string} templateId - Template ID
   * @param {Object} templateData - Template data (subject, body)
   * @returns {Promise<{template: Object, message: string}>}
   */
  async updateEmailTemplate(templateId, templateData) {
    return await apiClient.put(`/admin/settings/email-templates/${templateId}`, templateData);
  }

  /**
   * Get payment configuration
   * @returns {Promise<Object>}
   */
  async getPaymentConfig() {
    return await apiClient.get('/admin/settings/payment-config');
  }

  /**
   * Update payment configuration
   * @param {Object} config - Payment config
   * @returns {Promise<{config: Object, message: string}>}
   */
  async updatePaymentConfig(config) {
    return await apiClient.put('/admin/settings/payment-config', config);
  }

  // ==================== Admin Profile ====================

  /**
   * Get admin profile
   * @returns {Promise<Object>}
   */
  async getProfile() {
    return await apiClient.get('/admin/profile');
  }

  /**
   * Update admin profile
   * @param {Object} profileData - Profile data
   * @returns {Promise<{user: Object, message: string}>}
   */
  async updateProfile(profileData) {
    return await apiClient.put('/admin/profile', profileData);
  }

  /**
   * Change admin password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<{message: string}>}
   */
  async changePassword(currentPassword, newPassword) {
    return await apiClient.post('/admin/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  // ==================== Tutoring Metrics ====================

  /**
   * Get tutoring metrics for admin dashboard
   * @returns {Promise<{pendingRequests: number, activeSubscriptions: number, todaySessions: number, upcomingSessions: number}>}
   */
  async getTutoringMetrics() {
    return await apiClient.get('/admin/tutoring-metrics');
  }

  /**
   * Get all tutoring sessions (admin)
   * @param {Object} params - Query params (page, limit, search, status, date)
   * @returns {Promise<{sessions: Array, pagination: Object}>}
   */
  async getAllTutoringSessions(params = {}) {
    return await apiClient.get('/admin/tutoring-sessions', { params });
  }

  // ==================== Success Stories ====================

  /**
   * Search users for success story (LEARNER/LECTURER only)
   * @param {string} query - Search query
   * @returns {Promise<Array>}
   */
  async searchUsersForSuccessStory(query) {
    return await apiClient.get('/success-stories/users/search', { params: { q: query } });
  }

  /**
   * Get all success stories
   * @param {Object} params - Query params (status, page, limit)
   * @returns {Promise<{successStories: Array, pagination: Object}>}
   */
  async getSuccessStories(params = {}) {
    return await apiClient.get('/success-stories', { params });
  }

  /**
   * Get success story by ID
   * @param {string} storyId - Success story ID
   * @returns {Promise<Object>}
   */
  async getSuccessStory(storyId) {
    return await apiClient.get(`/success-stories/${storyId}`);
  }

  /**
   * Create success story
   * @param {Object} storyData - Story data (userId, achievement, testimonial, courseName, rating, displayOrder)
   * @returns {Promise<{data: Object, message: string}>}
   */
  async createSuccessStory(storyData) {
    return await apiClient.post('/success-stories', storyData);
  }

  /**
   * Update success story
   * @param {string} storyId - Success story ID
   * @param {Object} storyData - Story data to update
   * @returns {Promise<{data: Object, message: string}>}
   */
  async updateSuccessStory(storyId, storyData) {
    return await apiClient.put(`/success-stories/${storyId}`, storyData);
  }

  /**
   * Toggle success story active status
   * @param {string} storyId - Success story ID
   * @returns {Promise<{data: Object, message: string}>}
   */
  async toggleSuccessStoryStatus(storyId) {
    return await apiClient.patch(`/success-stories/${storyId}/toggle-status`);
  }

  /**
   * Delete success story
   * @param {string} storyId - Success story ID
   * @returns {Promise<{message: string}>}
   */
  async deleteSuccessStory(storyId) {
    return await apiClient.delete(`/success-stories/${storyId}`);
  }
}

// Export singleton instance
export default new AdminService();
