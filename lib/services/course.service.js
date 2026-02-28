/**
 * Course Service
 * Handles all course-related API operations
 */

import apiClient from '../api/client';

class CourseService {
  /**
   * Get all courses with optional filters
   * @param {Object} params - Query parameters (category, level, search, page, limit)
   * @returns {Promise<{courses: Array, total: number, page: number, totalPages: number}>}
   */
  async getCourses(params = {}) {
    return await apiClient.get('/course', { params });
  }

  /**
   * Get featured courses for homepage
   * @param {number} limit - Number of courses to fetch
   * @returns {Promise<Array>}
   */
  async getFeaturedCourses(limit = 6) {
    return await apiClient.get('/courses/featured', { params: { limit } });
  }

  /**
   * Get course by ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>}
   */
  async getCourseById(courseId) {
    return await apiClient.get(`/courses/${courseId}`);
  }

  /**
   * Get course curriculum/lessons
   * @param {string} courseId - Course ID
   * @returns {Promise<Array>}
   */
  async getCourseCurriculum(courseId) {
    return await apiClient.get(`/courses/${courseId}/curriculum`);
  }

  /**
   * Get lesson details
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>}
   */
  async getLessonById(lessonId) {
    return await apiClient.get(`/lessons/${lessonId}`);
  }

  /**
   * Enroll in a course
   * @param {string} courseId - Course ID
   * @param {Object} enrollmentData - Payment/enrollment details
   * @returns {Promise<{enrollment: Object, message: string}>}
   */
  async enrollInCourse(courseId, enrollmentData = {}) {
    return await apiClient.post(`/courses/${courseId}/enroll`, enrollmentData);
  }

  /**
   * Get student's enrolled courses
   * @param {Object} params - Query parameters (status: 'active'|'completed')
   * @returns {Promise<Array>}
   */
  async getEnrolledCourses(params = {}) {
    return await apiClient.get('/student/courses', { params });
  }

  /**
   * Get course progress for student
   * @param {string} courseId - Course ID
   * @returns {Promise<{progress: number, completedLessons: Array, totalLessons: number}>}
   */
  async getCourseProgress(courseId) {
    return await apiClient.get(`/student/courses/${courseId}/progress`);
  }

  /**
   * Mark lesson as completed
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<{message: string, progress: Object}>}
   */
  async markLessonCompleted(lessonId) {
    return await apiClient.post(`/lessons/${lessonId}/complete`);
  }

  /**
   * Get quiz by ID
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object>}
   */
  async getQuiz(quizId) {
    return await apiClient.get(`/quizzes/${quizId}`);
  }

  /**
   * Submit quiz answers
   * @param {string} quizId - Quiz ID
   * @param {Array} answers - Array of {question_id, answer}
   * @returns {Promise<{score: number, total: number, passed: boolean, results: Array}>}
   */
  async submitQuiz(quizId, answers) {
    return await apiClient.post(`/quizzes/${quizId}/submit`, { answers });
  }

  /**
   * Get course reviews
   * @param {string} courseId - Course ID
   * @param {Object} params - Pagination params
   * @returns {Promise<{reviews: Array, rating: number, total: number}>}
   */
  async getCourseReviews(courseId, params = {}) {
    return await apiClient.get(`/courses/${courseId}/reviews`, { params });
  }

  /**
   * Add course review
   * @param {string} courseId - Course ID
   * @param {number} rating - Rating (1-5)
   * @param {string} comment - Review comment
   * @returns {Promise<{review: Object, message: string}>}
   */
  async addCourseReview(courseId, rating, comment) {
    return await apiClient.post(`/courses/${courseId}/reviews`, { rating, comment });
  }

  /**
   * Get course categories
   * @returns {Promise<Array>}
   */
  async getCategories() {
    return await apiClient.get('/courses/categories');
  }

  /**
   * Search courses
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<{courses: Array, total: number}>}
   */
  async searchCourses(query, filters = {}) {
    return await apiClient.get('/courses/search', {
      params: { q: query, ...filters },
    });
  }

  /**
   * Get course instructor details
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>}
   */
  async getCourseInstructor(courseId) {
    return await apiClient.get(`/courses/${courseId}/instructor`);
  }

  /**
   * Download course material
   * @param {string} materialId - Material ID
   * @returns {Promise<Blob>}
   */
  async downloadCourseMaterial(materialId) {
    return await apiClient.get(`/materials/${materialId}/download`, {
      responseType: 'blob',
    });
  }
}

// Export singleton instance
export default new CourseService();
