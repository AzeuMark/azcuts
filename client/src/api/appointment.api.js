import api from '../config/axios';

export const appointmentApi = {
  getSlots: (params) => api.get('/appointments/slots', { params }),
  create: (payload) => api.post('/appointments', payload),
  getMine: (params) => api.get('/appointments/mine', { params }),
  getOne: (id) => api.get(`/appointments/${id}`),
  cancel: (id, cancelReason) => api.patch(`/appointments/${id}/cancel`, { cancelReason }),
  rate: (id, payload) => api.post(`/appointments/${id}/rate`, payload),
  getReceipt: (id) => api.get(`/appointments/${id}/receipt`),
};
