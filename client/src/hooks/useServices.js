import { useQuery } from '@tanstack/react-query';
import api from '../config/axios';

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await api.get('/settings/public');
      return data.data;
    },
  });
}
