import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Card from '../../components/ui/Card';
import { formatDate } from '../../utils/datetime';
import { formatMoney } from '../../utils/formatMoney';
import './AdminHistory.css';

export default function AdminUserHistory() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUserHistory', page],
    queryFn: async () => {
      const { data } = await adminApi.getUserHistory({ page });
      return data.data;
    },
  });

  const appointments = data?.appointments || [];
  const totalPages = data?.totalPages || 1;

  const columns = [
    { key: 'createdAt', label: 'Date', render: (v) => formatDate(v) },
    { key: 'service', label: 'Service', render: (v) => v?.name || '—' },
    { key: 'customer', label: 'Customer', render: (v) => v?.fullName || '—' },
    { key: 'assignedStaff', label: 'Staff', render: (v) => v?.fullName || '—' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'priceSnapshot', label: 'Total', render: (v) => formatMoney(v?.total || 0) },
  ];

  return (
    <div className="admin-hist-page">
      <h1 className="admin-hist-title">User Appointment History</h1>
      <Card padding={false}>
        <div className="admin-hist-table">
          <DataTable
            columns={columns}
            data={appointments}
            loading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyTitle="No user appointments yet"
          />
        </div>
      </Card>
    </div>
  );
}
