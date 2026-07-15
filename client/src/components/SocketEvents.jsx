import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SocketEvents() {
  const { on, off } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const handleNew = (apt) => {
      toast(`New booking from ${apt.customer?.fullName || 'Customer'}`, { icon: '📅' });
      queryClient.invalidateQueries({ queryKey: ['staffAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    };

    const handleUpdated = (apt) => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['staffAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminStaffHistory'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserHistory'] });
    };

    const handleAssigned = (apt) => {
      toast('You have been assigned a new appointment', { icon: '👤' });
      queryClient.invalidateQueries({ queryKey: ['staffAppointments'] });
    };

    const handleDashboardRefresh = () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    };

    const handleRatingAdded = (data) => {
      toast('New rating received!', { icon: '⭐' });
      queryClient.invalidateQueries({ queryKey: ['staffHistory'] });
    };

    on('appointment:new', handleNew);
    on('appointment:updated', handleUpdated);
    on('appointment:assigned', handleAssigned);
    on('dashboard:refresh', handleDashboardRefresh);
    on('rating:added', handleRatingAdded);

    return () => {
      off('appointment:new', handleNew);
      off('appointment:updated', handleUpdated);
      off('appointment:assigned', handleAssigned);
      off('dashboard:refresh', handleDashboardRefresh);
      off('rating:added', handleRatingAdded);
    };
  }, [user, on, off, queryClient]);

  return null;
}
