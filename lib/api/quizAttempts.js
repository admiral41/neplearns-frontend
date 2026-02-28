// /lib/api/quizAttempts.js - Updated
import apiClient from './client';

export const quizAttemptAPI = {
    // Get quiz attempts
    getQuizAttempts: (quizId, params = {}) => 
        apiClient.get(`/quizzes/${quizId}/attempts`, { params }),
    
    // Get single attempt
    getAttemptById: (attemptId) => 
        apiClient.get(`/quizzes/attempts/${attemptId}`),
    
    // Get student's attempts
    getStudentAttempts: (quizId) => 
        apiClient.get(`/quizzes/${quizId}/student/attempts`),
    
    // Start quiz attempt
    startQuizAttempt: (quizId) => 
        apiClient.post(`/quizzes/${quizId}/attempts/start`),
    
    // Submit quiz attempt
    submitQuizAttempt: (quizId, attemptId, answers) => 
        apiClient.post(`/quizzes/${quizId}/attempts/${attemptId}/submit`, { answers }),
    
    // Delete attempt
    deleteAttempt: (attemptId) => 
        apiClient.delete(`/quizzes/attempts/${attemptId}`),
    
    // Bulk delete attempts
    bulkDeleteAttempts: (attemptIds) => 
        apiClient.post('/quizzes/attempts/bulk-delete', { attemptIds }),
    
    // Reset attempt
    resetAttempt: (attemptId) => 
        apiClient.post(`/quizzes/attempts/${attemptId}/reset`),
    
    // Get quiz results
    getQuizResults: (quizId) => 
        apiClient.get(`/quizzes/${quizId}/results`),
    
    // Get quiz analytics
    getQuizAnalytics: (quizId) => 
        apiClient.get(`/quizzes/${quizId}/analytics`),
    
    // Get question analysis
    getQuestionAnalysis: (quizId) => 
        apiClient.get(`/quizzes/${quizId}/question-analysis`),
    
    // Get time analytics
    getTimeAnalytics: (quizId, period) => 
        apiClient.get(`/quizzes/${quizId}/time-analytics`, { params: { period } }),
    
    // Export attempts
    exportAttempts: (quizId, format = 'csv') => 
        apiClient.get(`/quizzes/${quizId}/attempts/export`, { 
            params: { format },
            responseType: 'blob' 
        }),
    
    // Grade essay question
    gradeEssayQuestion: (attemptId, questionId, score, feedback) => 
        apiClient.post(`/quizzes/attempts/${attemptId}/grade/${questionId}`, { 
            score, 
            feedback 
        }),
};