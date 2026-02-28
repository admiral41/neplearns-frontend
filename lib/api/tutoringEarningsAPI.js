import apiClient from './client';

export const tutoringEarningsAPI = {
  // Get earnings summary (current month + total)
  getSummary: () => {
    return apiClient.get('/tutoring-earnings/summary');
  },

  // Get breakdown by student
  getByStudent: () => {
    return apiClient.get('/tutoring-earnings/by-student');
  },

  // Get monthly breakdown for a specific year
  getMonthly: (year) => {
    const params = year ? { year } : {};
    return apiClient.get('/tutoring-earnings/monthly', { params });
  },
};
