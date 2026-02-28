/**
 * Assignment Service
 * Handles assignment retrieval, submission, and grading
 */

import apiClient from '../api/client';

class AssignmentService {
  /**
   * Get all assignments for student
   * @param {Object} params - Query params (status: 'pending'|'submitted'|'graded', course_id)
   * @returns {Promise<{assignments: Array, total: number}>}
   */
  async getAssignments(params = {}) {
    return await apiClient.get('/assignments', { params });
  }

  /**
   * Get assignment by ID
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Object>}
   */
  async getAssignmentById(assignmentId) {
    return await apiClient.get(`/assignments/${assignmentId}`);
  }

  /**
   * Submit assignment
   * @param {string} assignmentId - Assignment ID
   * @param {FormData} submissionData - Assignment files and answers
   * @returns {Promise<{submission: Object, message: string}>}
   */
  async submitAssignment(assignmentId, submissionData) {
    return await apiClient.post(`/assignments/${assignmentId}/submit`, submissionData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get assignment submission
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Object>}
   */
  async getSubmission(assignmentId) {
    return await apiClient.get(`/assignments/${assignmentId}/submission`);
  }

  /**
   * Update assignment submission (before deadline)
   * @param {string} assignmentId - Assignment ID
   * @param {FormData} submissionData - Updated submission data
   * @returns {Promise<{submission: Object, message: string}>}
   */
  async updateSubmission(assignmentId, submissionData) {
    return await apiClient.put(`/assignments/${assignmentId}/submission`, submissionData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Download assignment file
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Blob>}
   */
  async downloadAssignmentFile(assignmentId) {
    return await apiClient.get(`/assignments/${assignmentId}/download`, {
      responseType: 'blob',
    });
  }

  /**
   * Download submission file
   * @param {string} submissionId - Submission ID
   * @returns {Promise<Blob>}
   */
  async downloadSubmissionFile(submissionId) {
    return await apiClient.get(`/assignments/submissions/${submissionId}/download`, {
      responseType: 'blob',
    });
  }

  /**
   * Get assignment statistics
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<{totalSubmissions: number, averageScore: number, highestScore: number}>}
   */
  async getAssignmentStats(assignmentId) {
    return await apiClient.get(`/assignments/${assignmentId}/stats`);
  }

  /**
   * Get upcoming assignments
   * @param {number} limit - Number of assignments to fetch
   * @returns {Promise<Array>}
   */
  async getUpcomingAssignments(limit = 5) {
    return await apiClient.get('/assignments/upcoming', { params: { limit } });
  }

  /**
   * Get overdue assignments
   * @returns {Promise<Array>}
   */
  async getOverdueAssignments() {
    return await apiClient.get('/assignments/overdue');
  }
}

// Export singleton instance
export default new AssignmentService();
