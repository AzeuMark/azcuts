import api from '../config/axios';

export const analyticsApi = {
  getSummary: (range) => api.get('/analytics/summary', { params: { range } }),
  getSales: (range) => api.get('/analytics/sales', { params: { range } }),
  getReport: (range, format = 'json') =>
    api.get('/analytics/report', { params: { range, format }, responseType: format === 'csv' ? 'blob' : 'json' }),
};
