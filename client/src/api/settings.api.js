import api from '../config/axios';

export const settingsApi = {
  getPublic: () => api.get('/settings/public'),
  getSettings: () => api.get('/settings'),
  updateSettings: (payload) => api.put('/settings', payload),
  addNickname: (value) => api.post('/settings/nicknames', { value }),
  updateNickname: (oldValue, newValue) => api.put('/settings/nicknames', { oldValue, newValue }),
  deleteNickname: (value) => api.delete('/settings/nicknames', { data: { value } }),
};
