/**
 * Instructor Service
 * Handles instructor-specific operations using existing backend APIs
 */

import apiClient from '../api/client';

class InstructorService {
  /**
   * Get instructor dashboard data
   * Aggregates data from multiple endpoints
   * @returns {Promise<{stats: Object, courses: Array, recentEnrollments: Array, upcomingClasses: Array, pendingAssignments: Array}>}
   */
  async getDashboard() {
    // Fetch multiple data sources in parallel
    const [coursesRes, liveClassesRes] = await Promise.all([
      this.getCourses({ limit: 5 }),
      this.getLiveClasses({ limit: 5, status: 'upcoming' }),
    ]);

    // Build dashboard response from available data
    return {
      stats: {
        totalCourses: coursesRes.data?.length || 0,
        totalStudents: 0, // Will be calculated from courses
        pendingApprovals: coursesRes.data?.filter(c => c.status === 'pending_approval').length || 0,
        upcomingClasses: liveClassesRes.data?.length || 0,
      },
      courses: coursesRes.data || [],
      upcomingClasses: liveClassesRes.data || [],
      recentEnrollments: [],
      pendingAssignments: [],
    };
  }

  /**
   * Get instructor profile
   * @returns {Promise<Object>}
   */
  async getProfile() {
    return await apiClient.get('/auth/profile');
  }

  /**
   * Update instructor profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<{user: Object, message: string}>}
   */
  async updateProfile(profileData) {
    return await apiClient.put('/auth/profile', profileData);
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

  // ==================== Courses ====================

  /**
   * Get instructor's courses
   * @param {Object} params - Query params (status, page, limit)
   * @returns {Promise<{data: Array, total: number}>}
   */
  async getCourses(params = {}) {
    const { status, ...otherParams } = params;
    // Map status to type parameter
    let type = 'teaching';
    if (status === 'pending_approval' || status === 'pending') {
      type = 'pending';
    } else if (status === 'created') {
      type = 'created';
    }

    return await apiClient.get('/course/my-courses/all', {
      params: { type, ...otherParams }
    });
  }

  /**
   * Get a single course by slug
   * @param {string} slugOrId - Course slug or ID
   * @returns {Promise<Object>}
   */
  async getCourse(slugOrId) {
    return await apiClient.get(`/course/${slugOrId}`);
  }

  /**
   * Create a new course (pending approval)
   * @param {Object} courseData - Course data
   * @returns {Promise<{course: Object, message: string}>}
   */
  async createCourse(courseData) {
    // Handle FormData for file uploads
    if (courseData instanceof FormData) {
      return await apiClient.post('/course/create', courseData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return await apiClient.post('/course/create', courseData);
  }

  /**
   * Update a course
   * @param {string} slugOrId - Course slug or ID
   * @param {Object} courseData - Course data to update
   * @returns {Promise<{course: Object, message: string}>}
   */
  async updateCourse(slugOrId, courseData) {
    // Handle FormData for file uploads
    if (courseData instanceof FormData) {
      return await apiClient.put(`/course/${slugOrId}`, courseData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return await apiClient.put(`/course/${slugOrId}`, courseData);
  }

  /**
   * Delete a course
   * @param {string} slugOrId - Course slug or ID
   * @returns {Promise<{message: string}>}
   */
  async deleteCourse(slugOrId) {
    return await apiClient.delete(`/course/${slugOrId}`);
  }

  /**
   * Submit course for approval (after editing)
   * Note: Backend automatically sets status to pending_approval on update
   * @param {string} slugOrId - Course slug or ID
   * @returns {Promise<{course: Object, message: string}>}
   */
  async submitForApproval(slugOrId) {
    return await apiClient.put(`/course/${slugOrId}`, {
      submitForApproval: true
    });
  }

  /**
   * Upload course thumbnail
   * @param {string} slugOrId - Course slug or ID
   * @param {File} file - Image file
   * @returns {Promise<{thumbnail_url: string, message: string}>}
   */
  async uploadCourseThumbnail(slugOrId, file) {
    const formData = new FormData();
    formData.append('image', file);

    return await apiClient.put(`/course/${slugOrId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // ==================== Course Weeks ====================

  /**
   * Get weeks for a course
   * @param {string} courseId - Course ID
   * @returns {Promise<{data: Array}>}
   */
  async getCourseWeeks(courseId) {
    return await apiClient.get(`/weeks/course/${courseId}`);
  }

  /**
   * Create a week
   * @param {Object} weekData - Week data (must include courseId)
   * @returns {Promise<{data: Object, message: string}>}
   */
  async createWeek(weekData) {
    return await apiClient.post('/weeks', weekData);
  }

  /**
   * Get a single week
   * @param {string} weekId - Week ID
   * @returns {Promise<Object>}
   */
  async getWeek(weekId) {
    return await apiClient.get(`/weeks/${weekId}`);
  }

  /**
   * Update a week
   * @param {string} weekId - Week ID
   * @param {Object} weekData - Week data
   * @returns {Promise<{data: Object, message: string}>}
   */
  async updateWeek(weekId, weekData) {
    return await apiClient.put(`/weeks/${weekId}`, weekData);
  }

  /**
   * Delete a week
   * @param {string} weekId - Week ID
   * @returns {Promise<{message: string}>}
   */
  async deleteWeek(weekId) {
    return await apiClient.delete(`/weeks/${weekId}`);
  }

  /**
   * Reorder a week
   * @param {string} weekId - Week ID
   * @param {number} newOrder - New order position
   * @returns {Promise<{message: string}>}
   */
  async reorderWeek(weekId, newOrder) {
    return await apiClient.put(`/weeks/${weekId}/reorder`, { order: newOrder });
  }

  /**
   * Toggle week status (active/inactive)
   * @param {string} weekId - Week ID
   * @returns {Promise<{data: Object, message: string}>}
   */
  async toggleWeekStatus(weekId) {
    return await apiClient.put(`/weeks/${weekId}/status`);
  }

  // ==================== Lessons ====================

  /**
   * Get lessons for a week
   * @param {string} weekId - Week ID
   * @returns {Promise<{data: Array}>}
   */
  async getWeekLessons(weekId) {
    return await apiClient.get(`/lessons/week/${weekId}`);
  }

  /**
   * Create a lesson
   * @param {Object} lessonData - Lesson data (must include weekId)
   * @returns {Promise<{data: Object, message: string}>}
   */
  async createLesson(lessonData) {
    return await apiClient.post('/lessons', lessonData);
  }

  /**
   * Get a single lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>}
   */
  async getLesson(lessonId) {
    return await apiClient.get(`/lessons/${lessonId}`);
  }

  /**
   * Update a lesson
   * @param {string} lessonId - Lesson ID
   * @param {Object} lessonData - Lesson data
   * @returns {Promise<{data: Object, message: string}>}
   */
  async updateLesson(lessonId, lessonData) {
    return await apiClient.put(`/lessons/${lessonId}`, lessonData);
  }

  /**
   * Delete a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<{message: string}>}
   */
  async deleteLesson(lessonId) {
    return await apiClient.delete(`/lessons/${lessonId}`);
  }

  /**
   * Reorder a lesson
   * @param {string} lessonId - Lesson ID
   * @param {number} newOrder - New order position
   * @returns {Promise<{message: string}>}
   */
  async reorderLesson(lessonId, newOrder) {
    return await apiClient.put(`/lessons/${lessonId}/reorder`, { order: newOrder });
  }

  /**
   * Toggle lesson status
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<{data: Object, message: string}>}
   */
  async toggleLessonStatus(lessonId) {
    return await apiClient.put(`/lessons/${lessonId}/status`);
  }

  /**
   * Upload lesson video
   * @param {string} lessonId - Lesson ID
   * @param {File} file - Video file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<{video_url: string, message: string}>}
   */
  async uploadLessonVideo(lessonId, file, onProgress) {
    const formData = new FormData();
    formData.append('video', file);

    return await apiClient.post('/content/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(percentCompleted);
      },
    });
  }

  // ==================== Assignments ====================

  /**
   * Get assignments for a course
   * @param {string} courseId - Course ID
   * @returns {Promise<{data: Array}>}
   */
  async getCourseAssignments(courseId) {
    return await apiClient.get(`/assignments/course/${courseId}`);
  }

  /**
   * Get assignments for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<{data: Array}>}
   */
  async getLessonAssignments(lessonId) {
    return await apiClient.get(`/assignments/lesson/${lessonId}`);
  }

  /**
   * Create an assignment
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise<{data: Object, message: string}>}
   */
  async createAssignment(assignmentData) {
    return await apiClient.post('/assignments', assignmentData);
  }

  /**
   * Get assignment details
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Object>}
   */
  async getAssignment(assignmentId) {
    return await apiClient.get(`/assignments/${assignmentId}`);
  }

  /**
   * Update an assignment
   * @param {string} assignmentId - Assignment ID
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise<{data: Object, message: string}>}
   */
  async updateAssignment(assignmentId, assignmentData) {
    return await apiClient.put(`/assignments/${assignmentId}`, assignmentData);
  }

  /**
   * Delete an assignment
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<{message: string}>}
   */
  async deleteAssignment(assignmentId) {
    return await apiClient.delete(`/assignments/${assignmentId}`);
  }

  /**
   * Toggle assignment status
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<{data: Object, message: string}>}
   */
  async toggleAssignmentStatus(assignmentId) {
    return await apiClient.patch(`/assignments/${assignmentId}/toggle-status`);
  }

  /**
   * Get assignment submissions
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<{data: Array}>}
   */
  async getAssignmentSubmissions(assignmentId) {
    return await apiClient.get(`/assignments/${assignmentId}/submissions`);
  }

  /**
   * Grade a submission
   * @param {string} submissionId - Submission ID
   * @param {Object} gradeData - Grade data (grade, feedback)
   * @returns {Promise<{data: Object, message: string}>}
   */
  async gradeSubmission(submissionId, gradeData) {
    return await apiClient.post(`/assignments/submissions/${submissionId}/grade`, gradeData);
  }

  /**
   * Get pending submissions for instructor (for grading)
   * @param {Object} params - Query params (limit)
   * @returns {Promise<{data: Array, totalPending: number}>}
   */
  async getPendingSubmissions(params = {}) {
    return await apiClient.get('/assignments/instructor/pending-submissions', { params });
  }

  /**
   * Get all submissions for instructor's courses
   * @param {Object} params - Query params (limit, status)
   * @returns {Promise<{data: Array, total: number}>}
   */
  async getAllSubmissions(params = {}) {
    return await apiClient.get('/assignments/instructor/all-submissions', { params });
  }

  /**
   * Get recent enrollments for instructor's courses
   * @param {Object} params - Query params (limit)
   * @returns {Promise<{data: Array}>}
   */
  async getRecentEnrollments(params = {}) {
    return await apiClient.get('/course/instructor/recent-enrollments', { params });
  }

  /**
   * Get all students enrolled in instructor's courses
   * @param {Object} params - Query params (page, limit, search, courseId, status)
   * @returns {Promise<{data: Array, pagination: Object, stats: Object, courses: Array}>}
   */
  async getStudents(params = {}) {
    return await apiClient.get('/course/instructor/students', { params });
  }

  // ==================== Quizzes ====================

  /**
   * Get quizzes for a course
   * @param {string} courseId - Course ID
   * @returns {Promise<{data: Array}>}
   */
  async getCourseQuizzes(courseId) {
    return await apiClient.get(`/quizzes/course/${courseId}`);
  }

  /**
   * Get quizzes for a week
   * @param {string} weekId - Week ID
   * @returns {Promise<{data: Array}>}
   */
  async getWeekQuizzes(weekId) {
    return await apiClient.get(`/quizzes/week/${weekId}`);
  }

  /**
   * Get quizzes for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<{data: Array}>}
   */
  async getLessonQuizzes(lessonId) {
    return await apiClient.get(`/quizzes/lesson/${lessonId}`);
  }

  /**
   * Create a quiz
   * @param {Object} quizData - Quiz data
   * @returns {Promise<{data: Object, message: string}>}
   */
  async createQuiz(quizData) {
    return await apiClient.post('/quizzes', quizData);
  }

  /**
   * Get quiz details
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object>}
   */
  async getQuiz(quizId) {
    return await apiClient.get(`/quizzes/${quizId}`);
  }

  /**
   * Update a quiz
   * @param {string} quizId - Quiz ID
   * @param {Object} quizData - Quiz data
   * @returns {Promise<{data: Object, message: string}>}
   */
  async updateQuiz(quizId, quizData) {
    return await apiClient.put(`/quizzes/${quizId}`, quizData);
  }

  /**
   * Delete a quiz
   * @param {string} quizId - Quiz ID
   * @returns {Promise<{message: string}>}
   */
  async deleteQuiz(quizId) {
    return await apiClient.delete(`/quizzes/${quizId}`);
  }

  /**
   * Toggle quiz publish status
   * @param {string} quizId - Quiz ID
   * @returns {Promise<{data: Object, message: string}>}
   */
  async toggleQuizPublish(quizId) {
    return await apiClient.patch(`/quizzes/${quizId}/publish`);
  }

  /**
   * Get quiz statistics
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object>}
   */
  async getQuizStats(quizId) {
    return await apiClient.get(`/quizzes/${quizId}/stats`);
  }

  /**
   * Duplicate a quiz
   * @param {string} quizId - Quiz ID
   * @returns {Promise<{data: Object, message: string}>}
   */
  async duplicateQuiz(quizId) {
    return await apiClient.post(`/quizzes/${quizId}/duplicate`);
  }

  // ==================== Quiz Questions ====================

  /**
   * Get questions for a quiz
   * @param {string} quizId - Quiz ID
   * @returns {Promise<{data: Array}>}
   */
  async getQuizQuestions(quizId) {
    return await apiClient.get(`/quizzes/${quizId}/questions`);
  }

  /**
   * Add question to quiz
   * @param {string} quizId - Quiz ID
   * @param {Object} questionData - Question data
   * @returns {Promise<{data: Object, message: string}>}
   */
  async addQuestion(quizId, questionData) {
    return await apiClient.post(`/quizzes/${quizId}/questions`, questionData);
  }

  /**
   * Update a question
   * @param {string} questionId - Question ID
   * @param {Object} questionData - Question data
   * @returns {Promise<{data: Object, message: string}>}
   */
  async updateQuestion(questionId, questionData) {
    return await apiClient.put(`/quizzes/questions/${questionId}`, questionData);
  }

  /**
   * Delete a question
   * @param {string} questionId - Question ID
   * @returns {Promise<{message: string}>}
   */
  async deleteQuestion(questionId) {
    return await apiClient.delete(`/quizzes/questions/${questionId}`);
  }

  /**
   * Reorder questions
   * @param {string} quizId - Quiz ID
   * @param {Array} questionOrder - Array of question IDs in new order
   * @returns {Promise<{message: string}>}
   */
  async reorderQuestions(quizId, questionOrder) {
    return await apiClient.put(`/quizzes/${quizId}/questions/reorder`, { questionOrder });
  }

  // ==================== Quiz Attempts ====================

  /**
   * Get quiz attempts
   * @param {string} quizId - Quiz ID
   * @returns {Promise<{data: Array}>}
   */
  async getQuizAttempts(quizId) {
    return await apiClient.get(`/quizzes/${quizId}/attempts`);
  }

  /**
   * Get quiz analytics
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object>}
   */
  async getQuizAnalytics(quizId) {
    return await apiClient.get(`/quizzes/${quizId}/analytics`);
  }

  /**
   * Reset a quiz attempt
   * @param {string} attemptId - Attempt ID
   * @returns {Promise<{message: string}>}
   */
  async resetQuizAttempt(attemptId) {
    return await apiClient.post(`/quizzes/attempts/${attemptId}/reset`);
  }

  /**
   * Grade an essay question
   * @param {string} attemptId - Attempt ID
   * @param {string} questionId - Question ID
   * @param {Object} gradeData - Grade data
   * @returns {Promise<{data: Object, message: string}>}
   */
  async gradeEssayQuestion(attemptId, questionId, gradeData) {
    return await apiClient.post(`/quizzes/attempts/${attemptId}/grade/${questionId}`, gradeData);
  }

  // ==================== Live Classes ====================

  /**
   * Get instructor's live classes
   * @param {Object} params - Query params (status, page, limit)
   * @returns {Promise<{data: Array, total: number}>}
   */
  async getLiveClasses(params = {}) {
    return await apiClient.get('/live-classes', { params });
  }

  /**
   * Get live classes for a specific course
   * @param {string} courseId - Course ID
   * @returns {Promise<{data: Array}>}
   */
  async getCourseLiveClasses(courseId) {
    return await apiClient.get(`/live-classes/course/${courseId}`);
  }

  /**
   * Get upcoming live classes
   * @returns {Promise<{data: Array}>}
   */
  async getUpcomingLiveClasses() {
    return await apiClient.get('/live-classes/upcoming');
  }

  /**
   * Get live class details
   * @param {string} classId - Live class ID
   * @returns {Promise<Object>}
   */
  async getLiveClass(classId) {
    return await apiClient.get(`/live-classes/${classId}`);
  }

  /**
   * Create a live class
   * @param {Object} classData - Live class data
   * @returns {Promise<{data: Object, message: string}>}
   */
  async createLiveClass(classData) {
    return await apiClient.post('/live-classes', classData);
  }

  /**
   * Update a live class
   * @param {string} classId - Live class ID
   * @param {Object} classData - Live class data
   * @returns {Promise<{data: Object, message: string}>}
   */
  async updateLiveClass(classId, classData) {
    return await apiClient.put(`/live-classes/${classId}`, classData);
  }

  /**
   * Delete a live class
   * @param {string} classId - Live class ID
   * @returns {Promise<{message: string}>}
   */
  async deleteLiveClass(classId) {
    return await apiClient.delete(`/live-classes/${classId}`);
  }

  /**
   * Start a live class
   * @param {string} classId - Live class ID
   * @returns {Promise<{meetingUrl: string, message: string}>}
   */
  async startLiveClass(classId) {
    return await apiClient.post(`/live-classes/${classId}/start`);
  }

  /**
   * End a live class
   * @param {string} classId - Live class ID
   * @returns {Promise<{message: string}>}
   */
  async endLiveClass(classId) {
    return await apiClient.post(`/live-classes/${classId}/end`);
  }

  /**
   * Reschedule a live class
   * @param {string} classId - Live class ID
   * @param {Object} scheduleData - New schedule data
   * @returns {Promise<{data: Object, message: string}>}
   */
  async rescheduleLiveClass(classId, scheduleData) {
    return await apiClient.put(`/live-classes/${classId}/reschedule`, scheduleData);
  }

  /**
   * Cancel a live class
   * @param {string} classId - Live class ID
   * @returns {Promise<{message: string}>}
   */
  async cancelLiveClass(classId) {
    return await apiClient.delete(`/live-classes/${classId}/cancel`);
  }

  /**
   * Send reminder for a live class
   * @param {string} classId - Live class ID
   * @returns {Promise<{message: string}>}
   */
  async sendLiveClassReminder(classId) {
    return await apiClient.post(`/live-classes/${classId}/send-reminder`);
  }

  /**
   * Get live class stats
   * @returns {Promise<Object>}
   */
  async getLiveClassStats() {
    return await apiClient.get('/live-classes/stats');
  }

  /**
   * Get attendance report for a live class
   * @param {string} classId - Live class ID
   * @returns {Promise<{data: Array}>}
   */
  async getLiveClassAttendance(classId) {
    return await apiClient.get(`/live-classes/${classId}/attendance-report`);
  }

  // ==================== Categories (Read-Only) ====================

  /**
   * Get all active categories
   * @returns {Promise<{data: Array}>}
   */
  async getCategories() {
    return await apiClient.get('/categories/active');
  }

  /**
   * Search categories
   * @param {string} query - Search query
   * @returns {Promise<{data: Array}>}
   */
  async searchCategories(query) {
    return await apiClient.get('/categories/search', { params: { q: query } });
  }

  // ==================== Content Upload ====================

  /**
   * Upload an image
   * @param {File} file - Image file
   * @returns {Promise<{url: string}>}
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return await apiClient.post('/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Upload a video
   * @param {File} file - Video file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<{url: string}>}
   */
  async uploadVideo(file, onProgress) {
    const formData = new FormData();
    formData.append('video', file);

    return await apiClient.post('/content/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(percentCompleted);
      },
    });
  }

  /**
   * Upload a file (PDF, document, etc.)
   * @param {File} file - File to upload
   * @returns {Promise<{url: string}>}
   */
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    return await apiClient.post('/content/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // ==================== Settings & Password ====================

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<{message: string}>}
   */
  async changePassword(currentPassword, newPassword) {
    return await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Upload instructor documents (CV, certificates, government ID)
   * @param {FormData} formData - FormData containing files and governmentIdType
   * @returns {Promise<{cv: string, certificates: Array, governmentIdType: string, governmentId: string}>}
   */
  async uploadDocuments(formData) {
    return await apiClient.post('/auth/lecturer/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get lecturer application data (includes documents)
   * @returns {Promise<Object>}
   */
  async getLecturerApplication() {
    return await apiClient.get('/auth/lecturer/application');
  }

  // ==================== Announcements ====================

  /**
   * Get announcements
   * @param {Object} params - Query params
   * @returns {Promise<{data: Array}>}
   */
  async getAnnouncements(params = {}) {
    return await apiClient.get('/announcements', { params });
  }

  // ==================== Analytics ====================

  async getAnalytics(params = {}) {
    return await apiClient.get('/course/instructor/analytics', { params });
  }

  // ==================== Instructor Tools ====================

  async getTools() {
    return await apiClient.get('/instructor-tools');
  }

  async createTool(toolData) {
    return await apiClient.post('/instructor-tools', toolData);
  }

  async updateTool(toolId, toolData) {
    return await apiClient.put(`/instructor-tools/${toolId}`, toolData);
  }

  async deleteTool(toolId) {
    return await apiClient.delete(`/instructor-tools/${toolId}`);
  }
}

// Export singleton instance
export default new InstructorService();
