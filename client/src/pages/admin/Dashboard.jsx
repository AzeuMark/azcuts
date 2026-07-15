import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, UserCheck, Clock, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { useSocketEvent } from '../../hooks/useSocketEvent';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { formatMoney } from '../../utils/formatMoney';
import { formatDateTime } from '../../utils/datetime';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const { data } = await adminApi.getDashboard();
      return data.data;
    },
    refetchInterval: 20000,
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
  }, [queryClient]);

  useSocketEvent('dashboard:refresh', refresh);
  useSocketEvent('appointment:new', refresh);
  useSocketEvent('appointment:updated', refresh);

  if (isLoading) {
    return <div className="admin-dash-loading"><Spinner size={32} /></div>;
  }

  const counters = [
    { icon: Users, label: 'Active Staff', value: data?.activeStaff ?? 0, color: 'blue' },
    { icon: UserCheck, label: 'In Service', value: data?.inService ?? 0, color: 'indigo' },
    { icon: Calendar, label: 'Customers Today', value: data?.customersToday ?? 0, color: 'amber' },
    { icon: DollarSign, label: 'Sales Today', value: formatMoney(data?.salesToday ?? 0), color: 'green' },
    { icon: Clock, label: 'Pending', value: data?.pending ?? 0, color: 'orange' },
    { icon: TrendingUp, label: 'Total Today', value: data?.totalToday ?? 0, color: 'teal' },
  ];

  return (
    <div className="admin-dash">
      <h1 className="admin-dash-title">Admin Dashboard</h1>

      <div className="admin-dash-counters">
        {counters.map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="admin-counter-card">
            <div className={`admin-counter-icon admin-counter-icon--${color}`}>
              <Icon size={22} />
            </div>
            <div className="admin-counter-body">
              <span className="admin-counter-value">{value}</span>
              <span className="admin-counter-label">{label}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="admin-dash-activity">
        <h2 className="admin-dash-section-title">Recent Appointments</h2>
        {data?.recentAppointments?.length > 0 ? (
          <div className="admin-activity-list">
            {data.recentAppointments.map((apt) => (
              <Card key={apt._id} className="admin-activity-card">
                <div className="admin-activity-row">
                  <div className="admin-activity-info">
                    <strong>{apt.customer?.fullName || 'Customer'}</strong>
                    <span>{apt.service?.name}</span>
                    <span className="admin-activity-time">{formatDateTime(apt.createdAt)}</span>
                  </div>
                  <div className="admin-activity-right">
                    <StatusBadge status={apt.status} />
                    <span className="admin-activity-price">{formatMoney(apt.priceSnapshot?.total || 0)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="admin-dash-empty">No recent appointments</p>
        )}
      </div>
    </div>
  );
}
