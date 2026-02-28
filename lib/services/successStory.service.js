/**
 * Success Story Service
 * Handles public success story fetching for homepage
 */

import apiClient from "../api/client";

class SuccessStoryService {
  /**
   * Get active success stories for homepage
   * @returns {Promise<Array>}
   */
  async getActiveSuccessStories() {
    return await apiClient.get("/success-stories/public");
  }ç
}

// Export singleton instance
export default new SuccessStoryService();
