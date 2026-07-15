import api from '../config/axios';

export const staffApi = {
  getAppointments: (params) => api.get('/staff/appointments', { params }),
  accept: (id) => api.patch(`/staff/appointments/${id}/accept`),
  reject: (id, reason) => api.patch(`/staff/appointments/${id}/reject`, { reason }),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  getHistory: (params) => api.get('/staff/history', { params }),
  setShift: (status) => api.patch('/staff/shift', { status }),
};
