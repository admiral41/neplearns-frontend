/**
 * Inquiry Service
 * Handles contact form submissions and inquiries
 */

import apiClient from '../api/client';

class InquiryService {
  /**
   * Submit inquiry/contact form
   * @param {Object} inquiryData - {name, email, phone, level, message}
   * @returns {Promise<Object>}
   */
  async submitInquiry(inquiryData) {
    return await apiClient.post('/enquiry', inquiryData);
  }

  /**
   * Get student's inquiry history
   * @param {Object} params - Pagination params
   * @returns {Promise<{inquiries: Array, total: number}>}
   */
  async getMyInquiries(params = {}) {
    return await apiClient.get('/inquiries/my-inquiries', { params });
  }

  /**
   * Get inquiry by ID
   * @param {string} inquiryId - Inquiry ID
   * @returns {Promise<Object>}
   */
  async getInquiryById(inquiryId) {
    return await apiClient.get(`/inquiries/${inquiryId}`);
  }

  /**
   * Request callback
   * @param {Object} data - {name, phone, preferred_time}
   * @returns {Promise<{message: string}>}
   */
  async requestCallback(data) {
    return await apiClient.post('/inquiries/callback', data);
  }

  /**
   * Subscribe to newsletter
   * @param {string} email - Email address
   * @returns {Promise<{message: string}>}
   */
  async subscribeNewsletter(email) {
    return await apiClient.post('/newsletter/subscribe', { email });
  }

  /**
   * Unsubscribe from newsletter
   * @param {string} email - Email address
   * @returns {Promise<{message: string}>}
   */
  async unsubscribeNewsletter(email) {
    return await apiClient.post('/newsletter/unsubscribe', { email });
  }

  /**
   * Submit feedback
   * @param {Object} feedbackData - {type, rating, message}
   * @returns {Promise<{message: string}>}
   */
  async submitFeedback(feedbackData) {
    return await apiClient.post('/feedback', feedbackData);
  }

  /**
   * Report a problem
   * @param {Object} reportData - {type, description, screenshot}
   * @returns {Promise<{message: string, ticket_id: string}>}
   */
  async reportProblem(reportData) {
    const formData = new FormData();
    Object.keys(reportData).forEach((key) => {
      formData.append(key, reportData[key]);
    });

    return await apiClient.post('/support/report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

// Export singleton instance
export default new InquiryService();
