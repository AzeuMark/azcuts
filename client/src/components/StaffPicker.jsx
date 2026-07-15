import { User, Shuffle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../config/axios';
import Spinner from './ui/Spinner';
import './StaffPicker.css';

export default function StaffPicker({ value, onSelect }) {
  const { data: staffList, isLoading } = useQuery({
    queryKey: ['activeStaff'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params: { role: 'staff' } });
      return (data.data?.users || []).filter((s) => s.status === 'active');
    },
  });

  if (isLoading) return <div className="staff-picker-loading"><Spinner size={24} /></div>;

  const isAuto = value === 'auto';

  return (
    <div className="staff-picker">
      <div className="staff-picker-header">
        <User size={18} />
        <span>Choose Your Stylist</span>
      </div>

      <div className="staff-picker-grid">
        <button
          type="button"
          className={`staff-card ${isAuto ? 'staff-card--active' : ''}`}
          onClick={() => onSelect('auto')}
        >
          <div className="staff-card-avatar staff-card-avatar--auto">
            <Shuffle size={18} />
          </div>
          <div className="staff-card-info">
            <strong>Auto Assign</strong>
            <span>Least loaded staff</span>
          </div>
        </button>

        {staffList?.map((staff) => (
          <button
            key={staff._id}
            type="button"
            className={`staff-card ${value === staff._id ? 'staff-card--active' : ''}`}
            onClick={() => onSelect(staff._id)}
          >
            <div className="staff-card-avatar">
              <User size={18} />
            </div>
            <div className="staff-card-info">
              <strong>{staff.fullName}</strong>
              <span>{staff.nickname || 'Stylist'}</span>
            </div>
          </button>
        ))}
      </div>

      {isAuto && (
        <p className="staff-picker-note">
          The appointment will be routed to the staff with the fewest active bookings. They will still need to accept it.
        </p>
      )}
    </div>
  );
}
