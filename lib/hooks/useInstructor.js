/**
 * Instructor Hooks
 * Custom React Query hooks for instructor-related operations
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import instructorService from '../services/instructor.service';

// ==================== Dashboard ====================

/**
 * Hook to get instructor dashboard data
 */
export function useInstructorDashboard() {
  return useQuery({
    queryKey: ['instructor', 'dashboard'],
    queryFn: () => instructorService.getDashboard(),
    staleTime: 2 * 60 * 1000,
  });
}

// ==================== Profile ====================

/**
 * Hook to get instructor profile
 */
export function useInstructorProfile() {
  return useQuery({
    queryKey: ['instructor', 'profile'],
    queryFn: () => instructorService.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to update instructor profile
 */
export function useUpdateInstructorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData) => instructorService.updateProfile(profileData),
    onSuccess: (data) => {
      queryClient.setQueryData(['instructor', 'profile'], data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile.');
    },
  });
}

/**
 * Hook to update profile picture
 */
export function useUpdateProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => instructorService.updateProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile picture updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile picture.');
    },
  });
}

/**
 * Hook to upload instructor documents (CV, certificates, government ID)
 */
export function useUploadDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => instructorService.uploadDocuments(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'documents'] });
      toast.success('Documents uploaded successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload documents.');
    },
  });
}

/**
 * Hook to get lecturer application data (includes documents)
 */
export function useLecturerApplication() {
  return useQuery({
    queryKey: ['instructor', 'documents'],
    queryFn: () => instructorService.getLecturerApplication(),
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== Pending Submissions ====================

/**
 * Hook to get pending submissions for grading
 */
export function usePendingSubmissions(params = {}) {
  return useQuery({
    queryKey: ['instructor', 'pending-submissions', params],
    queryFn: () => instructorService.getPendingSubmissions(params),
    staleTime: 0, // Always refetch to show latest grading status
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to get all submissions for instructor's courses
 */
export function useAllSubmissions(params = {}) {
  return useQuery({
    queryKey: ['instructor', 'all-submissions', params],
    queryFn: () => instructorService.getAllSubmissions(params),
    staleTime: 0, // Always refetch to show latest grading status
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to get recent enrollments for instructor's courses
 */
export function useRecentEnrollments(params = {}) {
  return useQuery({
    queryKey: ['instructor', 'recent-enrollments', params],
    queryFn: () => instructorService.getRecentEnrollments(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ==================== Courses ====================

/**
 * Hook to get instructor's courses
 */
export function useInstructorCourses(params = {}) {
  return useQuery({
    queryKey: ['instructor', 'courses', params],
    queryFn: () => instructorService.getCourses(params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get a single course
 */
export function useInstructorCourse(slugOrId) {
  return useQuery({
    queryKey: ['instructor', 'courses', slugOrId],
    queryFn: () => instructorService.getCourse(slugOrId),
    staleTime: 2 * 60 * 1000,
    enabled: !!slugOrId,
  });
}

/**
 * Hook to create a course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseData) => instructorService.createCourse(courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'dashboard'] });
      toast.success('Course created and submitted for approval!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create course.');
    },
  });
}

/**
 * Hook to update a course
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slugOrId, courseData }) => instructorService.updateCourse(slugOrId, courseData),
    onSuccess: (data, { slugOrId }) => {
      queryClient.setQueryData(['instructor', 'courses', slugOrId], data);
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      toast.success('Course updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update course.');
    },
  });
}

/**
 * Hook to delete a course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slugOrId) => instructorService.deleteCourse(slugOrId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'dashboard'] });
      toast.success('Course deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete course.');
    },
  });
}

/**
 * Hook to submit course for approval
 */
export function useSubmitForApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slugOrId) => instructorService.submitForApproval(slugOrId),
    onSuccess: (data, slugOrId) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', slugOrId] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      toast.success('Course submitted for approval!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit course for approval.');
    },
  });
}

// ==================== Course Weeks ====================

/**
 * Hook to get course weeks
 */
export function useCourseWeeks(courseId) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'weeks'],
    queryFn: () => instructorService.getCourseWeeks(courseId),
    staleTime: 2 * 60 * 1000,
    enabled: !!courseId,
  });
}

/**
 * Hook to create a week
 */
export function useCreateWeek() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weekData) => instructorService.createWeek(weekData),
    onSuccess: (data, weekData) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', weekData.courseId, 'weeks'] });
      toast.success('Week created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create week.');
    },
  });
}

/**
 * Hook to update a week
 */
export function useUpdateWeek() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ weekId, weekData }) => instructorService.updateWeek(weekId, weekData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      toast.success('Week updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update week.');
    },
  });
}

/**
 * Hook to delete a week
 */
export function useDeleteWeek() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weekId) => instructorService.deleteWeek(weekId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      toast.success('Week deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete week.');
    },
  });
}

/**
 * Hook to toggle week status
 */
export function useToggleWeekStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weekId) => instructorService.toggleWeekStatus(weekId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      toast.success('Week status updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update week status.');
    },
  });
}

// ==================== Lessons ====================

/**
 * Hook to get week lessons
 */
export function useWeekLessons(weekId) {
  return useQuery({
    queryKey: ['instructor', 'weeks', weekId, 'lessons'],
    queryFn: () => instructorService.getWeekLessons(weekId),
    staleTime: 2 * 60 * 1000,
    enabled: !!weekId,
  });
}

/**
 * Hook to create a lesson
 */
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonData) => instructorService.createLesson(lessonData),
    onSuccess: (data, lessonData) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'weeks', lessonData.weekId, 'lessons'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      toast.success('Lesson created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create lesson.');
    },
  });
}

/**
 * Hook to update a lesson
 */
export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, lessonData }) => instructorService.updateLesson(lessonId, lessonData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('Lesson updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update lesson.');
    },
  });
}

/**
 * Hook to delete a lesson
 */
export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId) => instructorService.deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('Lesson deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete lesson.');
    },
  });
}

/**
 * Hook to toggle lesson status
 */
export function useToggleLessonStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId) => instructorService.toggleLessonStatus(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('Lesson status updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update lesson status.');
    },
  });
}

// ==================== Assignments ====================

/**
 * Hook to get course assignments
 */
export function useCourseAssignments(courseId) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'assignments'],
    queryFn: () => instructorService.getCourseAssignments(courseId),
    staleTime: 2 * 60 * 1000,
    enabled: !!courseId,
  });
}

/**
 * Hook to get lesson assignments
 */
export function useLessonAssignments(lessonId) {
  return useQuery({
    queryKey: ['instructor', 'lessons', lessonId, 'assignments'],
    queryFn: () => instructorService.getLessonAssignments(lessonId),
    staleTime: 2 * 60 * 1000,
    enabled: !!lessonId,
  });
}

/**
 * Hook to get assignment details
 */
export function useAssignment(assignmentId) {
  return useQuery({
    queryKey: ['instructor', 'assignments', assignmentId],
    queryFn: () => instructorService.getAssignment(assignmentId),
    staleTime: 1 * 60 * 1000,
    enabled: !!assignmentId,
  });
}

/**
 * Hook to create an assignment
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentData) => instructorService.createAssignment(assignmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('Assignment created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create assignment.');
    },
  });
}

/**
 * Hook to update an assignment
 */
export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, assignmentData }) =>
      instructorService.updateAssignment(assignmentId, assignmentData),
    onSuccess: (data, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assignments', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('Assignment updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update assignment.');
    },
  });
}

/**
 * Hook to delete an assignment
 */
export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId) => instructorService.deleteAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('Assignment deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete assignment.');
    },
  });
}

/**
 * Hook to get assignment submissions
 */
export function useAssignmentSubmissions(assignmentId) {
  return useQuery({
    queryKey: ['instructor', 'assignments', assignmentId, 'submissions'],
    queryFn: () => instructorService.getAssignmentSubmissions(assignmentId),
    staleTime: 1 * 60 * 1000,
    enabled: !!assignmentId,
  });
}

/**
 * Hook to grade a submission
 */
export function useGradeSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, gradeData }) =>
      instructorService.gradeSubmission(submissionId, gradeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('Submission graded successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to grade submission.');
    },
  });
}

// ==================== Quizzes ====================

/**
 * Hook to get course quizzes
 */
export function useCourseQuizzes(courseId) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'quizzes'],
    queryFn: () => instructorService.getCourseQuizzes(courseId),
    staleTime: 2 * 60 * 1000,
    enabled: !!courseId,
  });
}

/**
 * Hook to get week quizzes
 */
export function useWeekQuizzes(weekId) {
  return useQuery({
    queryKey: ['instructor', 'weeks', weekId, 'quizzes'],
    queryFn: () => instructorService.getWeekQuizzes(weekId),
    staleTime: 2 * 60 * 1000,
    enabled: !!weekId,
  });
}

/**
 * Hook to get lesson quizzes
 */
export function useLessonQuizzes(lessonId) {
  return useQuery({
    queryKey: ['instructor', 'lessons', lessonId, 'quizzes'],
    queryFn: () => instructorService.getLessonQuizzes(lessonId),
    staleTime: 2 * 60 * 1000,
    enabled: !!lessonId,
  });
}

/**
 * Hook to get quiz details
 */
export function useQuiz(quizId) {
  return useQuery({
    queryKey: ['instructor', 'quizzes', quizId],
    queryFn: () => instructorService.getQuiz(quizId),
    staleTime: 1 * 60 * 1000,
    enabled: !!quizId,
  });
}

/**
 * Hook to create a quiz
 */
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizData) => instructorService.createQuiz(quizData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('Quiz created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create quiz.');
    },
  });
}

/**
 * Hook to update a quiz
 */
export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, quizData }) => instructorService.updateQuiz(quizId, quizData),
    onSuccess: (data, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'quizzes', quizId] });
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('Quiz updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update quiz.');
    },
  });
}

/**
 * Hook to delete a quiz
 */
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId) => instructorService.deleteQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('Quiz deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete quiz.');
    },
  });
}

/**
 * Hook to toggle quiz publish status
 */
export function useToggleQuizPublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId) => instructorService.toggleQuizPublish(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('Quiz publish status updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update quiz status.');
    },
  });
}

/**
 * Hook to duplicate a quiz
 */
export function useDuplicateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId) => instructorService.duplicateQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('Quiz duplicated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to duplicate quiz.');
    },
  });
}

/**
 * Hook to get quiz statistics
 */
export function useQuizStats(quizId) {
  return useQuery({
    queryKey: ['instructor', 'quizzes', quizId, 'stats'],
    queryFn: () => instructorService.getQuizStats(quizId),
    staleTime: 1 * 60 * 1000,
    enabled: !!quizId,
  });
}

// ==================== Quiz Questions ====================

/**
 * Hook to get quiz questions
 */
export function useQuizQuestions(quizId) {
  return useQuery({
    queryKey: ['instructor', 'quizzes', quizId, 'questions'],
    queryFn: () => instructorService.getQuizQuestions(quizId),
    staleTime: 1 * 60 * 1000,
    enabled: !!quizId,
  });
}

/**
 * Hook to add a question to a quiz
 */
export function useAddQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questionData }) => instructorService.addQuestion(quizId, questionData),
    onSuccess: (data, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'quizzes', quizId, 'questions'] });
      toast.success('Question added successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add question.');
    },
  });
}

/**
 * Hook to update a question
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, questionData }) =>
      instructorService.updateQuestion(questionId, questionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'quizzes'] });
      toast.success('Question updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update question.');
    },
  });
}

/**
 * Hook to delete a question
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId) => instructorService.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'quizzes'] });
      toast.success('Question deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete question.');
    },
  });
}

// ==================== Quiz Attempts ====================

/**
 * Hook to get quiz attempts
 */
export function useQuizAttempts(quizId) {
  return useQuery({
    queryKey: ['instructor', 'quizzes', quizId, 'attempts'],
    queryFn: () => instructorService.getQuizAttempts(quizId),
    staleTime: 1 * 60 * 1000,
    enabled: !!quizId,
  });
}

/**
 * Hook to get quiz analytics
 */
export function useQuizAnalytics(quizId) {
  return useQuery({
    queryKey: ['instructor', 'quizzes', quizId, 'analytics'],
    queryFn: () => instructorService.getQuizAnalytics(quizId),
    staleTime: 1 * 60 * 1000,
    enabled: !!quizId,
  });
}

/**
 * Hook to reset a quiz attempt
 */
export function useResetQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attemptId) => instructorService.resetQuizAttempt(attemptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'quizzes'] });
      toast.success('Quiz attempt reset successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset quiz attempt.');
    },
  });
}

/**
 * Hook to grade an essay question
 */
export function useGradeEssayQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attemptId, questionId, gradeData }) =>
      instructorService.gradeEssayQuestion(attemptId, questionId, gradeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'quizzes'] });
      toast.success('Essay graded successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to grade essay.');
    },
  });
}

// ==================== Live Classes ====================

/**
 * Hook to get instructor's live classes
 */
export function useInstructorLiveClasses(params = {}) {
  return useQuery({
    queryKey: ['instructor', 'live-classes', params],
    queryFn: () => instructorService.getLiveClasses(params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get course live classes
 */
export function useCourseLiveClasses(courseId) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'live-classes'],
    queryFn: () => instructorService.getCourseLiveClasses(courseId),
    staleTime: 2 * 60 * 1000,
    enabled: !!courseId,
  });
}

/**
 * Hook to get upcoming live classes
 */
export function useUpcomingLiveClasses() {
  return useQuery({
    queryKey: ['instructor', 'live-classes', 'upcoming'],
    queryFn: () => instructorService.getUpcomingLiveClasses(),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get live class details
 */
export function useLiveClass(classId) {
  return useQuery({
    queryKey: ['instructor', 'live-classes', classId],
    queryFn: () => instructorService.getLiveClass(classId),
    staleTime: 1 * 60 * 1000,
    enabled: !!classId,
  });
}

/**
 * Hook to create a live class
 */
export function useCreateLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classData) => instructorService.createLiveClass(classData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'live-classes'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'dashboard'] });
      toast.success('Live class scheduled successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to schedule live class.');
    },
  });
}

/**
 * Hook to update a live class
 */
export function useUpdateLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, classData }) => instructorService.updateLiveClass(classId, classData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'live-classes'] });
      toast.success('Live class updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update live class.');
    },
  });
}

/**
 * Hook to delete a live class
 */
export function useDeleteLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId) => instructorService.deleteLiveClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'live-classes'] });
      toast.success('Live class deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete live class.');
    },
  });
}

/**
 * Hook to start a live class
 */
export function useStartLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId) => instructorService.startLiveClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'live-classes'] });
      toast.success('Live class started!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start live class.');
    },
  });
}

/**
 * Hook to end a live class
 */
export function useEndLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId) => instructorService.endLiveClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'live-classes'] });
      toast.success('Live class ended!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to end live class.');
    },
  });
}

/**
 * Hook to cancel a live class
 */
export function useCancelLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId) => instructorService.cancelLiveClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'live-classes'] });
      toast.success('Live class cancelled!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel live class.');
    },
  });
}

/**
 * Hook to reschedule a live class
 */
export function useRescheduleLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, scheduleData }) =>
      instructorService.rescheduleLiveClass(classId, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'live-classes'] });
      toast.success('Live class rescheduled!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reschedule live class.');
    },
  });
}

/**
 * Hook to send live class reminder
 */
export function useSendLiveClassReminder() {
  return useMutation({
    mutationFn: (classId) => instructorService.sendLiveClassReminder(classId),
    onSuccess: () => {
      toast.success('Reminder sent to all enrolled students!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reminder.');
    },
  });
}

/**
 * Hook to get live class stats
 */
export function useLiveClassStats() {
  return useQuery({
    queryKey: ['instructor', 'live-classes', 'stats'],
    queryFn: () => instructorService.getLiveClassStats(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get live class attendance
 */
export function useLiveClassAttendance(classId) {
  return useQuery({
    queryKey: ['instructor', 'live-classes', classId, 'attendance'],
    queryFn: () => instructorService.getLiveClassAttendance(classId),
    staleTime: 1 * 60 * 1000,
    enabled: !!classId,
  });
}

// ==================== Categories ====================

/**
 * Hook to get active categories (read-only for instructors)
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => instructorService.getCategories(),
    staleTime: 10 * 60 * 1000,
  });
}

// ==================== Content Upload ====================

/**
 * Hook to upload an image
 */
export function useUploadImage() {
  return useMutation({
    mutationFn: (file) => instructorService.uploadImage(file),
    onError: (error) => {
      toast.error(error.message || 'Failed to upload image.');
    },
  });
}

/**
 * Hook to upload a video
 */
export function useUploadVideo() {
  return useMutation({
    mutationFn: ({ file, onProgress }) => instructorService.uploadVideo(file, onProgress),
    onError: (error) => {
      toast.error(error.message || 'Failed to upload video.');
    },
  });
}

/**
 * Hook to upload a file
 */
export function useUploadFile() {
  return useMutation({
    mutationFn: (file) => instructorService.uploadFile(file),
    onError: (error) => {
      toast.error(error.message || 'Failed to upload file.');
    },
  });
}

// ==================== Settings ====================

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      instructorService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password.');
    },
  });
}

// ==================== Announcements ====================

/**
 * Hook to get announcements
 */
export function useAnnouncements(params = {}) {
  return useQuery({
    queryKey: ['instructor', 'announcements', params],
    queryFn: () => instructorService.getAnnouncements(params),
    staleTime: 2 * 60 * 1000,
  });
}

// ==================== Analytics ====================

export function useInstructorAnalytics(period = '30days') {
  return useQuery({
    queryKey: ['instructor', 'analytics', period],
    queryFn: () => instructorService.getAnalytics({ period }),
    staleTime: 2 * 60 * 1000,
  });
}

// ==================== Instructor Tools ====================

export function useInstructorTools() {
  return useQuery({
    queryKey: ['instructor', 'tools'],
    queryFn: () => instructorService.getTools(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateTool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (toolData) => instructorService.createTool(toolData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'tools'] });
      toast.success('Tool created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create tool.');
    },
  });
}

export function useUpdateTool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ toolId, toolData }) => instructorService.updateTool(toolId, toolData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'tools'] });
      toast.success('Tool updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update tool.');
    },
  });
}

export function useDeleteTool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (toolId) => instructorService.deleteTool(toolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'tools'] });
      toast.success('Tool deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete tool.');
    },
  });
}
