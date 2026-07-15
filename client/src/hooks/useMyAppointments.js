import { useQuery } from '@tanstack/react-query';
import api from '../config/axios';

export function useMyAppointments(status, page = 1) {
  return useQuery({
    queryKey: ['myAppointments', status, page],
    queryFn: async () => {
      const params = { page };
      if (status) params.status = status;
      const { data } = await api.get('/appointments/mine', { params });
      return data.data;
    },
  });
}
