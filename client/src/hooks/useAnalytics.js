import { useQuery } from '@tanstack/react-query';
import api from '../config/axios';

export function useAnalytics(range = 'daily') {
  return useQuery({
    queryKey: ['analytics', range],
    queryFn: async () => {
      const { data } = await api.get('/analytics/summary', { params: { range } });
      return data.data;
    },
  });
}

export function useSalesData(range = 'daily') {
  return useQuery({
    queryKey: ['sales', range],
    queryFn: async () => {
      const { data } = await api.get('/analytics/sales', { params: { range } });
      return data.data;
    },
  });
}
