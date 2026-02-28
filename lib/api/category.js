import apiClient, { createMultipartConfig } from './client';

export const categoryAPI = {
  // Get all categories
  getAllCategories: (params = {}) => {
    return apiClient.get('/categories', { params });
  },

  // Get active categories (for dropdowns)
  getActiveCategories: () => {
    return apiClient.get('/categories/active');
  },

  // Get category by slug
  getCategoryBySlug: (slug) => {
    return apiClient.get(`/categories/${slug}`);
  },

  // Create category
  createCategory: (formData) => {
    return apiClient.post('/categories/create', formData, createMultipartConfig());
  },

  // Update category
  updateCategory: (slug, formData) => {
    return apiClient.put(`/categories/${slug}`, formData, createMultipartConfig());
  },

  // Delete category
  deleteCategory: (slug) => {
    return apiClient.delete(`/categories/${slug}`);
  },

  // Toggle category status
  toggleCategoryStatus: (slug, isActive) => {
    return apiClient.put(`/categories/${slug}/toggle`, { isActive });
  },

  // Search categories
  searchCategories: (query) => {
    return apiClient.get('/categories/search', { params: { q: query } });
  },

  // Get category with courses
  getCategoryWithCourses: (slug, params = {}) => {
    return apiClient.get(`/categories/${slug}/courses`, { params });
  }
};