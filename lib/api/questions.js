import apiClient from './client';

export const questionAPI = {
    // Get questions by quiz ID
    getQuestionsByQuiz: (quizId, params = {}) => 
        apiClient.get(`/quizzes/${quizId}/questions`, { params }),
    
    // Get single question
    getQuestion: (questionId) => 
        apiClient.get(`/quizzes/questions/${questionId}`),
    
    // Create question
    createQuestion: (questionData) => 
        apiClient.post(`/quizzes/${questionData.quiz}/questions`, questionData),
    
    // Update question
    updateQuestion: (questionId, questionData) => 
        apiClient.put(`/quizzes/questions/${questionId}`, questionData),
    
    // Delete question
    deleteQuestion: (questionId) => 
        apiClient.delete(`/quizzes/questions/${questionId}`),
    
    // Bulk delete questions
    bulkDeleteQuestions: (questionIds) => 
        apiClient.post('/quizzes/questions/bulk-delete', { questionIds }),
    
    // Toggle question status
    toggleQuestionStatus: (questionId, isActive) => 
        apiClient.patch(`/quizzes/questions/${questionId}/status`, { isActive }),
    
    // Reorder questions
    reorderQuestions: (quizId, questionOrder) => 
        apiClient.put(`/quizzes/${quizId}/questions/reorder`, { questionOrder }),
    
    // Import questions
    importQuestions: (quizId, questions) => 
        apiClient.post(`/quizzes/${quizId}/questions/import`, { questions }),
    
    // Export questions
    exportQuestions: (quizId) => 
        apiClient.get(`/quizzes/${quizId}/questions/export`, { responseType: 'blob' }),
};