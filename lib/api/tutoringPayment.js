import apiClient, { createMultipartConfig } from './client';

export const tutoringPaymentAPI = {
  // Student: Submit payment with proof
  submitPayment: ({ enrollmentId, paymentMethod, studentNotes, proofFile }) => {
    const formData = new FormData();
    formData.append('enrollmentId', enrollmentId);
    formData.append('paymentMethod', paymentMethod || 'bank_transfer');
    if (studentNotes) {
      formData.append('studentNotes', studentNotes);
    }
    formData.append('paymentProof', proofFile);

    return apiClient.post('/tutoring-payments', formData, createMultipartConfig());
  },

  // Student: Get payment history for enrollment
  getPaymentHistory: (enrollmentId) => {
    return apiClient.get(`/tutoring-payments/enrollment/${enrollmentId}`);
  },

  // Student: Get single payment
  getPaymentById: (id) => {
    return apiClient.get(`/tutoring-payments/${id}`);
  },

  // Admin: Get pending payments
  getPendingPayments: (params = {}) => {
    return apiClient.get('/tutoring-payments', { params });
  },

  // Admin: Verify (approve/reject) payment
  verifyPayment: (id, { action, adminNotes, rejectionReason }) => {
    return apiClient.post(`/tutoring-payments/${id}/verify`, {
      action,
      adminNotes,
      rejectionReason,
    });
  },
};
