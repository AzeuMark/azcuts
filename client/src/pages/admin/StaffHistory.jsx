import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import RatingStars from '../../components/RatingStars';
import Card from '../../components/ui/Card';
import { formatDate } from '../../utils/datetime';
import { formatMoney } from '../../utils/formatMoney';
import './AdminHistory.css';

export default function AdminStaffHistory() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminStaffHistory', page],
    queryFn: async () => {
      const { data } = await adminApi.getStaffHistory({ page });
      return data.data;
    },
  });

  const appointments = data?.appointments || [];
  const totalPages = data?.totalPages || 1;

  const columns = [
    { key: 'createdAt', label: 'Date', render: (v) => formatDate(v) },
    { key: 'service', label: 'Service', render: (v) => v?.name || '—' },
    { key: 'assignedStaff', label: 'Staff', render: (v) => v?.fullName || '—' },
    { key: 'customer', label: 'Customer', render: (v) => v?.fullName || '—' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'priceSnapshot', label: 'Total', render: (v) => formatMoney(v?.total || 0) },
    { key: 'rating', label: 'Rating', render: (v) => v ? <RatingStars value={v.stars} readonly size={14} /> : '—' },
  ];

  return (
    <div className="admin-hist-page">
      <h1 className="admin-hist-title">Staff Appointment History</h1>
      <Card padding={false}>
        <div className="admin-hist-table">
          <DataTable
            columns={columns}
            data={appointments}
            loading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyTitle="No staff appointments yet"
          />
        </div>
      </Card>
    </div>
  );
}
