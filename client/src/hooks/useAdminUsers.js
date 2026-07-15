import { useQuery } from '@tanstack/react-query';
import api from '../config/axios';

export function useAdminUsers({ role, search, page = 1 } = {}) {
  return useQuery({
    queryKey: ['adminUsers', role, search, page],
    queryFn: async () => {
      const params = { page };
      if (role) params.role = role;
      if (search) params.search = search;
      const { data } = await api.get('/admin/users', { params });
      return data.data;
    },
  });
}
