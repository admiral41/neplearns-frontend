import apiClient from './client';

export const quizAPI = {
  // ==========================
  // BASIC QUIZ CRUD
  // ==========================

  // Get all quizzes (admin view)
  getAllQuizzes: (params = {}) => 
    apiClient.get('/quizzes', { params }),

  // Create quiz
  createQuiz: (quizData) => 
    apiClient.post('/quizzes', quizData),

  // Get quizzes by course
  getQuizzesByCourse: (courseId, params = {}) => 
    apiClient.get(`/quizzes/course/${courseId}`, { params }),

  // Get quizzes by week
  getQuizzesByWeek: (weekId) => 
    apiClient.get(`/quizzes/week/${weekId}`),

  // Get quizzes by lesson
  getQuizzesByLesson: (lessonId) => 
    apiClient.get(`/quizzes/lesson/${lessonId}`),

  // Get single quiz
  getQuiz: (id, params = {}) => 
    apiClient.get(`/quizzes/${id}`, { params }),

  // Update quiz
  updateQuiz: (id, quizData) => 
    apiClient.put(`/quizzes/${id}`, quizData),

  // Delete quiz
  deleteQuiz: (id) => 
    apiClient.delete(`/quizzes/${id}`),

  // Duplicate quiz
  duplicateQuiz: (id, newTitle) => 
    apiClient.post(`/quizzes/${id}/duplicate`, { newTitle }),

  // Publish/Unpublish quiz
  togglePublish: (id, isPublished) => 
    apiClient.patch(`/quizzes/${id}/publish`, { isPublished }),

  // Get quiz statistics
  getQuizStats: (id) => 
    apiClient.get(`/quizzes/${id}/stats`),

  // Validate quiz
  validateQuiz: (id) => 
    apiClient.get(`/quizzes/${id}/validate`),

  // ==========================
  // QUESTION MANAGEMENT
  // ==========================

  // Add question to quiz
  addQuestion: (quizId, questionData) => 
    apiClient.post(`/quizzes/${quizId}/questions`, questionData),

  // Get quiz questions
  getQuizQuestions: (quizId, params = {}) => 
    apiClient.get(`/quizzes/${quizId}/questions`, { params }),

  // Get single question
  getQuestion: (questionId) => 
    apiClient.get(`/quizzes/questions/${questionId}`),

  // Update question
  updateQuestion: (questionId, questionData) => 
    apiClient.put(`/quizzes/questions/${questionId}`, questionData),

  // Delete question
  deleteQuestion: (questionId) => 
    apiClient.delete(`/quizzes/questions/${questionId}`),

  // Bulk delete questions
  bulkDeleteQuestions: (questionIds) => 
    apiClient.post('/quizzes/questions/bulk-delete', { questionIds }),

  // Reorder questions
  reorderQuestions: (quizId, questionOrder) => 
    apiClient.put(`/quizzes/${quizId}/questions/reorder`, { questionOrder }),

  // Toggle question status
  toggleQuestionStatus: (questionId, isActive) => 
    apiClient.patch(`/quizzes/questions/${questionId}/status`, { isActive }),

  // Import questions
  importQuestions: (quizId, questions) => 
    apiClient.post(`/quizzes/${quizId}/questions/import`, { questions }),

  // Export questions
  exportQuestions: (quizId) => 
    apiClient.get(`/quizzes/${quizId}/questions/export`, { responseType: 'blob' }),

  // ==========================
  // QUIZ ATTEMPTS & RESULTS
  // ==========================

  // Start quiz attempt
  startQuizAttempt: (quizId) => 
    apiClient.post(`/quizzes/${quizId}/attempts/start`),

  // Submit quiz attempt
  submitQuizAttempt: (quizId, attemptId, answers) => 
    apiClient.post(`/quizzes/${quizId}/attempts/${attemptId}/submit`, { answers }),

  // Get all attempts for a quiz
  getQuizAttempts: (quizId, params = {}) => 
    apiClient.get(`/quizzes/${quizId}/attempts`, { params }),

  // Get single attempt
  getAttempt: (attemptId) => 
    apiClient.get(`/quizzes/attempts/${attemptId}`),

  // Get student's attempts
  getStudentAttempts: (quizId) => 
    apiClient.get(`/quizzes/${quizId}/student/attempts`),

  // Delete attempt
  deleteAttempt: (attemptId) => 
    apiClient.delete(`/quizzes/attempts/${attemptId}`),

  // Bulk delete attempts
  bulkDeleteAttempts: (attemptIds) => 
    apiClient.post('/quizzes/attempts/bulk-delete', { attemptIds }),

  // Reset attempt
  resetAttempt: (attemptId) => 
    apiClient.post(`/quizzes/attempts/${attemptId}/reset`),

  // ==========================
  // RESULTS & ANALYTICS
  // ==========================

  // Get quiz results
  getQuizResults: (quizId) => 
    apiClient.get(`/quizzes/${quizId}/results`),

  // Get quiz analytics
  getQuizAnalytics: (quizId, params = {}) => 
    apiClient.get(`/quizzes/${quizId}/analytics`, { params }),

  // Get question analysis
  getQuestionAnalysis: (quizId) => 
    apiClient.get(`/quizzes/${quizId}/question-analysis`),

  // Get time analytics
  getTimeAnalytics: (quizId, params = {}) => 
    apiClient.get(`/quizzes/${quizId}/time-analytics`, { params }),

  // Export attempts as CSV
  exportAttempts: (quizId, format = 'csv') => 
    apiClient.get(`/quizzes/${quizId}/attempts/export`, { params: { format } }),

  // ==========================
  // ESSAY GRADING
  // ==========================

  // Grade essay question
  gradeEssayQuestion: (attemptId, questionId, data) => 
    apiClient.post(`/quizzes/attempts/${attemptId}/grade/${questionId}`, data),

  // Get questions needing grading
  getQuestionsNeedingGrading: (quizId) => 
    apiClient.get(`/quizzes/${quizId}/grading-queue`),

  // ==========================
  // EXPORT/IMPORT
  // ==========================

  // Export quiz (for backup/template)
  exportQuiz: (quizId, params = {}) => 
    apiClient.get(`/quizzes/${quizId}/export`, { params }),

  // ==========================
  // DASHBOARD & SEARCH
  // ==========================

  // Get quizzes for dashboard
  getDashboardQuizzes: (params = {}) => 
    apiClient.get('/quizzes/dashboard/all', { params }),

  // Search quizzes
  searchQuizzes: (params = {}) => 
    apiClient.get('/quizzes/search/all', { params }),
};