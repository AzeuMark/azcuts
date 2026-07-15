import api from '../config/axios';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (payload) => api.post('/admin/users', payload),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  setDiscount: (appointmentId, discountPercent) =>
    api.patch(`/admin/appointments/${appointmentId}/discount`, { discountPercent }),
  getStaffHistory: (params) => api.get('/admin/history/staff', { params }),
  getUserHistory: (params) => api.get('/admin/history/users', { params }),
};
