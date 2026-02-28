import api from './client';

export const activityLogAPI = {
  /**
   * Get activity logs with filtering and pagination (Admin only)
   */
  getActivityLogs: async (params = {}) => {
    // api client already returns response.data, so this returns the full response object
    return await api.get('/activity-logs', { params });
  },

  /**
   * Get activity log by ID (Admin only)
   */
  getActivityLogById: async (id) => {
    return await api.get(`/activity-logs/${id}`);
  },

  /**
   * Get activity logs for a specific user (Admin only)
   */
  getUserActivityLogs: async (userId, params = {}) => {
    return await api.get(`/activity-logs/user/${userId}`, { params });
  },

  /**
   * Get current user's activity logs
   */
  getMyActivityLogs: async (params = {}) => {
    return await api.get('/activity-logs/my-activity', { params });
  },

  /**
   * Get activity statistics (Admin only)
   */
  getActivityStats: async (params = {}) => {
    return await api.get('/activity-logs/stats', { params });
  },

  /**
   * Export activity logs as CSV (Admin only)
   */
  exportActivityLogs: async (params = {}) => {
    return await api.get('/activity-logs/export', {
      params,
      responseType: 'blob',
    });
  },

  /**
   * Delete old activity logs (Admin only)
   */
  cleanupOldLogs: async (daysToKeep = 90) => {
    return await api.delete('/activity-logs/cleanup', {
      data: { daysToKeep },
    });
  },
};

// Action types for display
export const ACTION_LABELS = {
  // Auth
  USER_LOGIN: 'User Login',
  USER_LOGOUT: 'User Logout',
  USER_REGISTER: 'User Registration',
  PASSWORD_RESET: 'Password Reset',
  EMAIL_VERIFIED: 'Email Verified',

  // Course
  COURSE_CREATED: 'Course Created',
  COURSE_UPDATED: 'Course Updated',
  COURSE_DELETED: 'Course Deleted',
  COURSE_PUBLISHED: 'Course Published',
  COURSE_UNPUBLISHED: 'Course Unpublished',
  COURSE_ENROLLED: 'Course Enrollment',
  COURSE_UNENROLLED: 'Course Unenrollment',

  // Lesson
  LESSON_CREATED: 'Lesson Created',
  LESSON_UPDATED: 'Lesson Updated',
  LESSON_DELETED: 'Lesson Deleted',
  LESSON_COMPLETED: 'Lesson Completed',

  // Week
  WEEK_CREATED: 'Week Created',
  WEEK_UPDATED: 'Week Updated',
  WEEK_DELETED: 'Week Deleted',

  // Lecturer
  LECTURER_APPLIED: 'Lecturer Application',
  LECTURER_APPROVED: 'Lecturer Approved',
  LECTURER_REJECTED: 'Lecturer Rejected',
  LECTURER_REAPPLIED: 'Lecturer Reapplied',

  // Admin
  ADMIN_CREATED_USER: 'Admin Created User',
  ADMIN_UPDATED_USER: 'Admin Updated User',
  ADMIN_DELETED_USER: 'Admin Deleted User',
  ADMIN_UPDATED_SETTINGS: 'Settings Updated',

  // Category
  CATEGORY_CREATED: 'Category Created',
  CATEGORY_UPDATED: 'Category Updated',
  CATEGORY_DELETED: 'Category Deleted',

  // Live Class
  LIVE_CLASS_CREATED: 'Live Class Created',
  LIVE_CLASS_UPDATED: 'Live Class Updated',
  LIVE_CLASS_DELETED: 'Live Class Deleted',
  LIVE_CLASS_STARTED: 'Live Class Started',
  LIVE_CLASS_ENDED: 'Live Class Ended',
  LIVE_CLASS_JOINED: 'Joined Live Class',

  // Announcement
  ANNOUNCEMENT_CREATED: 'Announcement Created',
  ANNOUNCEMENT_UPDATED: 'Announcement Updated',
  ANNOUNCEMENT_DELETED: 'Announcement Deleted',

  // Quiz
  QUIZ_CREATED: 'Quiz Created',
  QUIZ_ATTEMPTED: 'Quiz Attempted',
  QUIZ_COMPLETED: 'Quiz Completed',

  OTHER: 'Other Activity',
};

// Category labels
export const CATEGORY_LABELS = {
  AUTH: 'Authentication',
  COURSE: 'Courses',
  LESSON: 'Lessons',
  WEEK: 'Weeks',
  LECTURER: 'Lecturers',
  ADMIN: 'Administration',
  CATEGORY: 'Categories',
  LIVE_CLASS: 'Live Classes',
  ANNOUNCEMENT: 'Announcements',
  QUIZ: 'Quizzes',
  OTHER: 'Other',
};

// Category colors for UI
export const CATEGORY_COLORS = {
  AUTH: 'blue',
  COURSE: 'green',
  LESSON: 'purple',
  WEEK: 'indigo',
  LECTURER: 'orange',
  ADMIN: 'red',
  CATEGORY: 'cyan',
  LIVE_CLASS: 'pink',
  ANNOUNCEMENT: 'yellow',
  QUIZ: 'teal',
  OTHER: 'gray',
};
