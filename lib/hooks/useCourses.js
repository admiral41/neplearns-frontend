/**
 * Course Hooks
 * Custom React Query hooks for course-related operations
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { courseService } from '../services';

/**
 * Hook to get all courses
 */
export function useCourses(params = {}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => courseService.getCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get featured courses
 */
export function useFeaturedCourses(limit = 6) {
  return useQuery({
    queryKey: ['courses', 'featured', limit],
    queryFn: () => courseService.getFeaturedCourses(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get course by ID
 */
export function useCourse(courseId) {
  return useQuery({
    queryKey: ['courses', courseId],
    queryFn: () => courseService.getCourseById(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get course curriculum
 */
export function useCourseCurriculum(courseId) {
  return useQuery({
    queryKey: ['courses', courseId, 'curriculum'],
    queryFn: () => courseService.getCourseCurriculum(courseId),
    enabled: !!courseId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to get enrolled courses
 */
export function useEnrolledCourses(params = {}) {
  return useQuery({
    queryKey: ['student', 'courses', params],
    queryFn: () => courseService.getEnrolledCourses(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to get course progress
 */
export function useCourseProgress(courseId) {
  return useQuery({
    queryKey: ['student', 'courses', courseId, 'progress'],
    queryFn: () => courseService.getCourseProgress(courseId),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for course enrollment mutation
 */
export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, enrollmentData }) =>
      courseService.enrollInCourse(courseId, enrollmentData),
    onSuccess: (data, { courseId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['student', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      toast.success('Successfully enrolled in the course!');
    },
    onError: (error) => {
      toast.error(error.message || 'Enrollment failed. Please try again.');
    },
  });
}

/**
 * Hook to mark lesson as completed
 */
export function useMarkLessonCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId) => courseService.markLessonCompleted(lessonId),
    onSuccess: (data, lessonId) => {
      // Invalidate progress queries
      queryClient.invalidateQueries({ queryKey: ['student', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'progress'] });
      toast.success('Lesson marked as completed!');
    },
  });
}

/**
 * Hook to submit quiz
 */
export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, answers }) => courseService.submitQuiz(quizId, answers),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'progress'] });

      if (data.passed) {
        toast.success(`Great job! You scored ${data.score}/${data.total}`);
      } else {
        toast.warning(`You scored ${data.score}/${data.total}. Keep practicing!`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Quiz submission failed. Please try again.');
    },
  });
}

/**
 * Hook to add course review
 */
export function useAddCourseReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, rating, comment }) =>
      courseService.addCourseReview(courseId, rating, comment),
    onSuccess: (data, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      toast.success('Thank you for your review!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit review. Please try again.');
    },
  });
}

/**
 * Hook to get course reviews
 */
export function useCourseReviews(courseId, params = {}) {
  return useQuery({
    queryKey: ['courses', courseId, 'reviews', params],
    queryFn: () => courseService.getCourseReviews(courseId, params),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to search courses
 */
export function useSearchCourses(query, filters = {}) {
  return useQuery({
    queryKey: ['courses', 'search', query, filters],
    queryFn: () => courseService.searchCourses(query, filters),
    enabled: query.length > 0,
    staleTime: 3 * 60 * 1000,
  });
}
