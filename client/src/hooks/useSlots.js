import { useQuery } from '@tanstack/react-query';
import api from '../config/axios';

export function useSlots(serviceId, date, staffId) {
  return useQuery({
    queryKey: ['slots', serviceId, date, staffId],
    queryFn: async () => {
      const params = { serviceId, date };
      if (staffId) params.staffId = staffId;
      const { data } = await api.get('/appointments/slots', { params });
      return data.data;
    },
    enabled: !!serviceId && !!date,
  });
}
