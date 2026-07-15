import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Play, Flag, ToggleLeft, ToggleRight, Clock, User } from 'lucide-react';
import { staffApi } from '../../api/staff.api';
import { useSocketEvent } from '../../hooks/useSocketEvent';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime, formatTime } from '../../utils/datetime';
import { formatMoney } from '../../utils/formatMoney';
import toast from 'react-hot-toast';
import './StaffDashboard.css';

export default function StaffDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [shiftStatus, setShiftStatus] = useState(user?.status === 'active' ? 'active' : 'inactive');
  const [rejectTarget, setRejectTarget] = useState(null);

  const { data: incomingData, isLoading: loadingIncoming } = useQuery({
    queryKey: ['staffAppointments', 'incoming'],
    queryFn: async () => {
      const { data } = await staffApi.getAppointments({ scope: 'incoming' });
      return data.data;
    },
    refetchInterval: 15000,
  });

  const { data: myData, isLoading: loadingMy } = useQuery({
    queryKey: ['staffAppointments', 'mine'],
    queryFn: async () => {
      const { data } = await staffApi.getAppointments({ scope: 'mine' });
      return data.data;
    },
    refetchInterval: 15000,
  });

  const incoming = incomingData || [];
  const myQueue = myData || [];

  // Socket live updates
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['staffAppointments'] });
  }, [queryClient]);

  useSocketEvent('appointment:new', refresh);
  useSocketEvent('appointment:updated', refresh);

  const handleAccept = async (id) => {
    try {
      await staffApi.accept(id);
      toast.success('Appointment accepted');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Accept failed');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await staffApi.reject(id, reason);
      toast.success('Appointment rejected');
      setRejectTarget(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reject failed');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await staffApi.updateStatus(id, status);
      toast.success(status === 'in_service' ? 'Service started' : 'Service completed');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleShift = async () => {
    const next = shiftStatus === 'active' ? 'inactive' : 'active';
    try {
      await staffApi.setShift(next);
      setShiftStatus(next);
      toast.success(`Shift ${next === 'active' ? 'started' : 'ended'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Shift toggle failed');
    }
  };

  return (
    <div className="staff-dash">
      <div className="staff-dash-header">
        <h1 className="staff-dash-title">Staff Dashboard</h1>
        <Button
          variant={shiftStatus === 'active' ? 'danger' : 'primary'}
          size="sm"
          onClick={handleShift}
        >
          {shiftStatus === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          {shiftStatus === 'active' ? 'End Shift' : 'Start Shift'}
        </Button>
      </div>

      {/* Incoming */}
      <section className="staff-dash-section">
        <h2 className="staff-dash-section-title">
          <Clock size={18} /> Incoming Appointments
        </h2>
        {loadingIncoming ? (
          <div className="staff-dash-loading"><Spinner size={24} /></div>
        ) : incoming.length > 0 ? (
          <div className="staff-dash-cards">
            {incoming.map((apt) => (
              <Card key={apt._id} className="staff-apt-card">
                <div className="staff-apt-header">
                  <div className="staff-apt-info">
                    <div className="staff-apt-customer">
                      <User size={16} />
                      <strong>{apt.customer?.fullName || 'Customer'}</strong>
                    </div>
                    <span className="staff-apt-service">{apt.service?.name}</span>
                    <span className="staff-apt-time">{formatDateTime(apt.scheduledStart)}</span>
                    <span className="staff-apt-price">{formatMoney(apt.priceSnapshot?.total || 0)}</span>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
                {apt.extras?.length > 0 && (
                  <div className="staff-apt-extras">
                    {apt.extras.map((e, i) => (
                      <span key={e._id || i} className="staff-apt-extra">{e.name}</span>
                    ))}
                  </div>
                )}
                <div className="staff-apt-actions">
                  <Button size="sm" onClick={() => handleAccept(apt._id)}>
                    <CheckCircle size={14} /> Accept
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRejectTarget(apt)}>
                    <XCircle size={14} /> Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No incoming appointments" description="New bookings will appear here" icon={Clock} />
        )}
      </section>

      {/* Active Queue */}
      <section className="staff-dash-section">
        <h2 className="staff-dash-section-title">
          <Play size={18} /> Active Queue
        </h2>
        {loadingMy ? (
          <div className="staff-dash-loading"><Spinner size={24} /></div>
        ) : myQueue.length > 0 ? (
          <div className="staff-dash-cards">
            {myQueue.map((apt) => (
              <Card key={apt._id} className="staff-apt-card">
                <div className="staff-apt-header">
                  <div className="staff-apt-info">
                    <div className="staff-apt-customer">
                      <User size={16} />
                      <strong>{apt.customer?.fullName || 'Customer'}</strong>
                    </div>
                    <span className="staff-apt-service">{apt.service?.name}</span>
                    <span className="staff-apt-time">{formatDateTime(apt.scheduledStart)}</span>
                    <span className="staff-apt-price">{formatMoney(apt.priceSnapshot?.total || 0)}</span>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
                <div className="staff-apt-actions">
                  {apt.status === 'accepted' && (
                    <Button size="sm" onClick={() => handleStatus(apt._id, 'in_service')}>
                      <Play size={14} /> Start Service
                    </Button>
                  )}
                  {apt.status === 'in_service' && (
                    <Button size="sm" variant="primary" onClick={() => handleStatus(apt._id, 'done')}>
                      <Flag size={14} /> Finish
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No active appointments" description="Accepted appointments will appear here" icon={Play} />
        )}
      </section>

      {/* Reject Dialog */}
      <RejectDialog
        appointment={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onReject={handleReject}
      />
    </div>
  );
}

function RejectDialog({ appointment, onClose, onReject }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    setLoading(true);
    await onReject(appointment._id, reason);
    setLoading(false);
  };

  return (
    <Modal open={!!appointment} onClose={onClose} title="Reject Appointment">
      <div className="reject-dialog">
        <p>Reject appointment for <strong>{appointment?.customer?.fullName}</strong>?</p>
        <Input
          label="Reason"
          placeholder="Why are you rejecting this appointment?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="reject-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={handleReject} disabled={loading}>
            {loading ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
