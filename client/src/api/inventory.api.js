import api from '../config/axios';

export const inventoryApi = {
  getServices: () => api.get('/services'),
  createService: (formData) => api.post('/services', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateService: (id, formData) => api.put(`/services/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteService: (id) => api.delete(`/services/${id}`),
  getExtras: () => api.get('/extras'),
  createExtra: (payload) => api.post('/extras', payload),
  updateExtra: (id, payload) => api.put(`/extras/${id}`, payload),
  deleteExtra: (id) => api.delete(`/extras/${id}`),
};
