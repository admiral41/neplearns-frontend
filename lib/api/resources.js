import apiClient from './client';

export const resourceAPI = {
    // Get resources by lesson
    getResourcesByLesson: async (lessonId) => {
        return apiClient.get(`/resources/lesson/${lessonId}`);
    },

    // Create resource
    createResource: async (resourceData) => {
        return apiClient.post('/resources', resourceData);
    },

    // Delete resource
    deleteResource: async (resourceId) => {
        return apiClient.delete(`/resources/${resourceId}`);
    },

    // Toggle resource status
    toggleResourceStatus: async (resourceId, isActive) => {
        return apiClient.put(`/resources/${resourceId}/status`, { isActive });
    },
};
