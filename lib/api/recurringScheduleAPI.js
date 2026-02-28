import apiClient from './client';

export const recurringScheduleAPI = {
  // ======================= INSTRUCTOR ENDPOINTS =======================

  /**
   * Create a new recurring schedule for an enrollment
   * @param {object} data - { enrollmentId, daysOfWeek, startTime, duration, startDate }
   */
  create: (data) => {
    return apiClient.post('/recurring-schedules', data);
  },

  /**
   * Get instructor's recurring schedules
   * @param {boolean} includeInactive - Include paused/deleted schedules
   */
  getMySchedules: (includeInactive = false) => {
    return apiClient.get('/recurring-schedules/instructor', {
      params: includeInactive ? { includeInactive: true } : {},
    });
  },

  /**
   * Get recurring schedules for a specific student
   * @param {string} studentId - Student ID
   */
  getSchedulesByStudent: (studentId) => {
    return apiClient.get(`/recurring-schedules/student/${studentId}`);
  },

  // ======================= STUDENT ENDPOINTS =======================

  /**
   * Get student's own recurring schedule(s)
   */
  getMySchedule: () => {
    return apiClient.get('/recurring-schedules/my-schedule');
  },

  // ======================= SHARED ENDPOINTS =======================

  /**
   * Update a recurring schedule
   * @param {string} id - Schedule ID
   * @param {object} data - { daysOfWeek?, startTime?, duration?, isPaused? }
   */
  update: (id, data) => {
    return apiClient.put(`/recurring-schedules/${id}`, data);
  },

  /**
   * Delete a recurring schedule
   * @param {string} id - Schedule ID
   */
  delete: (id) => {
    return apiClient.delete(`/recurring-schedules/${id}`);
  },
};
