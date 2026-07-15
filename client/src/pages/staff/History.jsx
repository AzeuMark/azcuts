import { useQuery } from '@tanstack/react-query';
import { Star, Award, TrendingUp } from 'lucide-react';
import { staffApi } from '../../api/staff.api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import RatingStars from '../../components/RatingStars';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/datetime';
import { formatMoney } from '../../utils/formatMoney';
import './StaffHistory.css';

export default function StaffHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['staffHistory'],
    queryFn: async () => {
      const { data } = await staffApi.getHistory();
      return data.data;
    },
  });

  const appointments = data?.appointments || [];
  const totalServed = data?.totalServed || 0;
  const avgRating = data?.avgRating || 0;
  const ratingCount = data?.ratingCount || 0;
  const ratings = data?.ratings || [];

  const columns = [
    { key: 'createdAt', label: 'Date', render: (v) => formatDate(v) },
    { key: 'service', label: 'Service', render: (v) => v?.name || '—' },
    { key: 'customer', label: 'Customer', render: (v) => v?.fullName || '—' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'priceSnapshot', label: 'Total', render: (v) => formatMoney(v?.total || 0) },
    { key: 'rating', label: 'Rating', render: (v) => v ? <RatingStars value={v.stars} readonly size={14} /> : '—' },
  ];

  return (
    <div className="staff-history">
      <h1 className="staff-history-title">Served History</h1>

      {/* Stats */}
      <div className="staff-stats-grid">
        <Card className="staff-stat-card">
          <div className="staff-stat-icon staff-stat-icon--blue">
            <Award size={22} />
          </div>
          <div className="staff-stat-body">
            <span className="staff-stat-num">{totalServed}</span>
            <span className="staff-stat-label">Total Served</span>
          </div>
        </Card>
        <Card className="staff-stat-card">
          <div className="staff-stat-icon staff-stat-icon--amber">
            <Star size={22} />
          </div>
          <div className="staff-stat-body">
            <span className="staff-stat-num">{avgRating.toFixed(1)}</span>
            <span className="staff-stat-label">Avg Rating ({ratingCount})</span>
          </div>
        </Card>
        <Card className="staff-stat-card">
          <div className="staff-stat-icon staff-stat-icon--green">
            <TrendingUp size={22} />
          </div>
          <div className="staff-stat-body">
            <span className="staff-stat-num">{appointments.length}</span>
            <span className="staff-stat-label">Completed</span>
          </div>
        </Card>
      </div>

      {/* History Table */}
      <Card padding={false}>
        <div className="staff-history-table">
          <DataTable
            columns={columns}
            data={appointments}
            loading={isLoading}
            emptyTitle="No served appointments yet"
          />
        </div>
      </Card>

      {/* Ratings List */}
      {ratings.length > 0 && (
        <div className="staff-ratings">
          <h2 className="staff-ratings-title">Ratings & Comments</h2>
          <div className="staff-ratings-list">
            {ratings.map((r, i) => (
              <Card key={i} className="staff-rating-card">
                <div className="staff-rating-header">
                  <RatingStars value={r.stars} readonly size={16} />
                  <span className="staff-rating-date">{formatDate(r.ratedAt)}</span>
                </div>
                {r.comment && <p className="staff-rating-comment">{r.comment}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
