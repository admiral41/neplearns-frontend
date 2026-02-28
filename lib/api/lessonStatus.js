import apiClient from './client';

export const lessonStatusAPI = {
  // Get status for a specific lesson
  getLessonStatus: (lessonId) => 
    apiClient.get(`/lesson-status/${lessonId}`),
  
  // Mark lesson as complete
  markLessonComplete: (lessonId) => 
    apiClient.post(`/lesson-status/${lessonId}/complete`),
  
  // Mark lesson as incomplete
  markLessonIncomplete: (lessonId) => 
    apiClient.post(`/lesson-status/${lessonId}/incomplete`),
  
  // Get all statuses for current user in a course
  getCourseProgress: (courseId) => 
    apiClient.get(`/lesson-status/course/${courseId}`),
};