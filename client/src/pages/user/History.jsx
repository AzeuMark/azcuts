import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, XCircle, Star } from 'lucide-react';
import { useMyAppointments } from '../../hooks/useMyAppointments';
import { useSocketEvent } from '../../hooks/useSocketEvent';
import { appointmentApi } from '../../api/appointment.api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import RatingStars from '../../components/RatingStars';
import ReceiptCard from '../../components/ReceiptCard';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { formatDate, formatDateTime } from '../../utils/datetime';
import { formatMoney } from '../../utils/formatMoney';
import toast from 'react-hot-toast';
import './History.css';

export default function UserHistory() {
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rateTarget, setRateTarget] = useState(null);
  const [receiptTarget, setReceiptTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useMyAppointments(null, page);
  const appointments = data?.appointments || [];
  const totalPages = data?.totalPages || 1;

  // Live updates via socket
  const handleAppointmentUpdate = useCallback((payload) => {
    queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
    if (payload.status === 'done') {
      toast.success('Your appointment is complete! Rate your experience.');
    }
  }, [queryClient]);

  useSocketEvent('appointment:updated', handleAppointmentUpdate);

  const columns = [
    {
      key: 'scheduledStart',
      label: 'Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'service',
      label: 'Service',
      render: (val) => val?.name || '—',
    },
    {
      key: 'assignedStaff',
      label: 'Staff',
      render: (val) => val?.fullName || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'priceSnapshot',
      label: 'Total',
      render: (val) => formatMoney(val?.total || 0),
    },
    {
      key: '_actions',
      label: '',
      width: '120px',
      render: (_, row) => (
        <div className="history-actions">
          <button className="history-action-btn" title="View receipt" onClick={(e) => { e.stopPropagation(); setReceiptTarget(row); }}>
            <Eye size={15} />
          </button>
          {(row.status === 'pending' || row.status === 'accepted') && (
            <button className="history-action-btn history-action-btn--danger" title="Cancel" onClick={(e) => { e.stopPropagation(); setCancelTarget(row); }}>
              <XCircle size={15} />
            </button>
          )}
          {row.status === 'done' && !row.rating && (
            <button className="history-action-btn history-action-btn--star" title="Rate" onClick={(e) => { e.stopPropagation(); setRateTarget(row); }}>
              <Star size={15} />
            </button>
          )}
          {row.rating && (
            <span className="history-rated">
              <Star size={13} fill="#F59E0B" color="#F59E0B" /> {row.rating.stars}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="history-page">
      <h1 className="history-title">Booking History</h1>

      <Card padding={false}>
        <div className="history-table-wrap">
          <DataTable
            columns={columns}
            data={appointments}
            loading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyTitle="No bookings yet"
          />
        </div>
      </Card>

      {/* Cancel Dialog */}
      <CancelDialog
        appointment={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={() => {
          setCancelTarget(null);
          queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
        }}
      />

      {/* Rating Modal */}
      <RatingModal
        appointment={rateTarget}
        onClose={() => setRateTarget(null)}
        onRated={() => {
          setRateTarget(null);
          queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
        }}
      />

      {/* Receipt Modal */}
      <Modal open={!!receiptTarget} onClose={() => setReceiptTarget(null)} title="Receipt">
        {receiptTarget && <ReceiptCard appointment={receiptTarget} />}
      </Modal>
    </div>
  );
}

function CancelDialog({ appointment, onClose, onCancelled }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    setLoading(true);
    try {
      await appointmentApi.cancel(appointment._id, reason);
      toast.success('Appointment cancelled');
      onCancelled();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!appointment} onClose={onClose} title="Cancel Appointment">
      <div className="cancel-dialog">
        <p>Are you sure you want to cancel this appointment?</p>
        <p className="cancel-service">{appointment?.service?.name} — {formatDateTime(appointment?.scheduledStart)}</p>
        <Input
          label="Reason for cancellation"
          placeholder="Why are you cancelling?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="cancel-actions">
          <Button variant="secondary" onClick={onClose}>Keep Appointment</Button>
          <Button variant="danger" onClick={handleCancel} disabled={loading}>
            {loading ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function RatingModal({ appointment, onClose, onRated }) {
  const [stars, setStars] = useState(appointment?.rating?.stars || 0);
  const [comment, setComment] = useState(appointment?.rating?.comment || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment) {
      setStars(appointment.rating?.stars || 0);
      setComment(appointment.rating?.comment || '');
    }
  }, [appointment]);

  const handleRate = async () => {
    if (!stars) {
      toast.error('Please select a rating');
      return;
    }
    setLoading(true);
    try {
      await appointmentApi.rate(appointment._id, { stars, comment });
      toast.success('Rating submitted!');
      onRated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rating failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!appointment} onClose={onClose} title="Rate Your Experience">
      <div className="rating-dialog">
        <p className="rating-service">{appointment?.service?.name}</p>
        <div className="rating-stars-wrap">
          <RatingStars value={stars} onChange={setStars} size={32} />
        </div>
        <Input
          label="Comment (optional)"
          placeholder="How was your experience?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="rating-actions">
          <Button variant="secondary" onClick={onClose}>Later</Button>
          <Button onClick={handleRate} disabled={loading || !stars}>
            {loading ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
