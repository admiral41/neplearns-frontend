/**
 * Feature Service
 * Handles "Why Choose Us" features management
 */

import apiClient from '../api/client';

class FeatureService {
  // ==================== Public ====================

  /**
   * Get active features for landing page
   * @returns {Promise<{section: Object, features: Array}>}
   */
  async getPublicFeatures() {
    return await apiClient.get('/features/public');
  }

  // ==================== Admin ====================

  /**
   * Get all features
   * @param {Object} params - Query params (status)
   * @returns {Promise<{section: Object, features: Array}>}
   */
  async getFeatures(params = {}) {
    return await apiClient.get('/features', { params });
  }

  /**
   * Get feature by ID
   * @param {string} featureId - Feature ID
   * @returns {Promise<Object>}
   */
  async getFeature(featureId) {
    return await apiClient.get(`/features/${featureId}`);
  }

  /**
   * Create a new feature
   * @param {Object} featureData - Feature data (icon, title, description, displayOrder)
   * @returns {Promise<{data: Object, msg: string}>}
   */
  async createFeature(featureData) {
    return await apiClient.post('/features', featureData);
  }

  /**
   * Update feature
   * @param {string} featureId - Feature ID
   * @param {Object} featureData - Feature data to update
   * @returns {Promise<{data: Object, msg: string}>}
   */
  async updateFeature(featureId, featureData) {
    return await apiClient.put(`/features/${featureId}`, featureData);
  }

  /**
   * Toggle feature active status
   * @param {string} featureId - Feature ID
   * @returns {Promise<{data: Object, msg: string}>}
   */
  async toggleFeatureStatus(featureId) {
    return await apiClient.patch(`/features/${featureId}/toggle-status`);
  }

  /**
   * Delete feature
   * @param {string} featureId - Feature ID
   * @returns {Promise<{msg: string}>}
   */
  async deleteFeature(featureId) {
    return await apiClient.delete(`/features/${featureId}`);
  }

  /**
   * Reorder features
   * @param {string[]} featureIds - Array of feature IDs in new order
   * @returns {Promise<{msg: string}>}
   */
  async reorderFeatures(featureIds) {
    return await apiClient.post('/features/reorder', { featureIds });
  }

  /**
   * Update section content (title and subtitle)
   * @param {Object} content - Section content (title, subtitle)
   * @returns {Promise<{data: Object, msg: string}>}
   */
  async updateSectionContent(content) {
    return await apiClient.put('/features/section-content', content);
  }
}

export default new FeatureService();
