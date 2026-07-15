import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { settingsApi } from '../../api/settings.api';
import { appointmentApi } from '../../api/appointment.api';
import ServiceCard from '../../components/ServiceCard';
import ExtraChip from '../../components/ExtraChip';
import SlotPicker from '../../components/SlotPicker';
import StaffPicker from '../../components/StaffPicker';
import StepIndicator from '../../components/StepIndicator';
import ReceiptCard from '../../components/ReceiptCard';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { formatMoney } from '../../utils/formatMoney';
import { formatDateTime } from '../../utils/datetime';
import toast from 'react-hot-toast';
import './BookWizard.css';

export default function BookWizard() {
  const booking = useBooking();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const { data: publicData, isLoading } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      const { data } = await settingsApi.getPublic();
      return data.data;
    },
  });

  const services = publicData?.services || [];
  const extras = publicData?.extras || [];

  const subtotal = useMemo(() => {
    const base = booking.service?.price || 0;
    const extrasTotal = booking.extras.reduce((sum, e) => sum + e.price, 0);
    return base + extrasTotal;
  }, [booking.service, booking.extras]);

  const canNext = useCallback(() => {
    switch (booking.step) {
      case 0: return !!booking.service;
      case 1: return true;
      case 2: return !!booking.slot;
      case 3: return true;
      default: return true;
    }
  }, [booking]);

  const handleBook = async () => {
    setSubmitting(true);
    try {
      const payload = {
        serviceId: booking.service._id,
        extras: booking.extras.map((e) => e._id),
        scheduledStart: booking.slot.start,
        staffId: booking.staff === 'auto' ? undefined : booking.staff || undefined,
        paymentMethod: booking.paymentMethod,
      };
      const { data } = await appointmentApi.create(payload);
      setReceipt(data.data);
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      toast.success('Booking confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewBooking = () => {
    booking.reset();
    setReceipt(null);
  };

  if (isLoading) {
    return <div className="book-loading"><Spinner size={32} /></div>;
  }

  // Receipt screen after successful booking
  if (receipt) {
    return (
      <div className="book-wizard">
        <div className="book-receipt-header">
          <CheckCircle size={40} className="book-receipt-check" />
          <h1 className="book-title">Booking Confirmed!</h1>
          <p className="book-receipt-sub">
            Your appointment has been booked. {receipt.assignedStaff ? '' : 'Awaiting staff acceptance.'}
          </p>
        </div>
        <ReceiptCard appointment={receipt} />
        <div className="book-receipt-actions">
          <Button variant="secondary" onClick={handleNewBooking}>New Booking</Button>
          <Button onClick={() => navigate('/app/history')}>View History</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-wizard">
      <h1 className="book-title">Book an Appointment</h1>

      <StepIndicator current={booking.step} />

      <div className="book-total-bar">
        <span>Estimated Total</span>
        <span className="book-total-amount">{formatMoney(subtotal)}</span>
      </div>

      <Card className="book-step-card">
        {/* Step 0: Service */}
        {booking.step === 0 && (
          <div className="book-step">
            <h2 className="book-step-title">Choose a Service</h2>
            <div className="book-services-grid">
              {services.map((svc) => (
                <ServiceCard
                  key={svc._id}
                  service={svc}
                  selected={booking.service?._id === svc._id}
                  onSelect={() => booking.setService(svc)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Extras */}
        {booking.step === 1 && (
          <div className="book-step">
            <h2 className="book-step-title">Add Extras <span className="book-step-optional">(Optional)</span></h2>
            <p className="book-step-desc">Enhance your visit with add-on services</p>
            {extras.length > 0 ? (
              <div className="book-extras-grid">
                {extras.map((ext) => (
                  <ExtraChip
                    key={ext._id}
                    extra={ext}
                    selected={booking.extras.some((e) => e._id === ext._id)}
                    onToggle={booking.toggleExtra}
                  />
                ))}
              </div>
            ) : (
              <p className="book-empty">No extras available.</p>
            )}
          </div>
        )}

        {/* Step 2: Schedule */}
        {booking.step === 2 && (
          <div className="book-step">
            <h2 className="book-step-title">Pick a Time</h2>
            <SlotPicker
              serviceId={booking.service?._id}
              staffId={booking.staff && booking.staff !== 'auto' ? booking.staff : null}
              value={booking.slot}
              onSelect={booking.setSlot}
            />
            <div className="book-step-divider" />
            <StaffPicker
              value={booking.staff || 'auto'}
              onSelect={booking.setStaff}
            />
          </div>
        )}

        {/* Step 3: Payment */}
        {booking.step === 3 && (
          <div className="book-step">
            <h2 className="book-step-title">Payment Method</h2>
            <p className="book-step-desc">Select how you'd like to pay</p>
            <div className="book-payment-grid">
              <button
                type="button"
                className={`book-payment-card ${booking.paymentMethod === 'cash' ? 'book-payment-card--active' : ''}`}
                onClick={() => booking.setPayment('cash')}
              >
                <div className="book-payment-icon">
                  <CreditCard size={24} />
                </div>
                <div>
                  <strong>Cash</strong>
                  <span>Pay at the shop</span>
                </div>
              </button>
              <button
                type="button"
                className="book-payment-card book-payment-card--disabled"
                disabled
              >
                <div className="book-payment-icon">
                  <CreditCard size={24} />
                </div>
                <div>
                  <strong>GCash</strong>
                  <span>Coming soon</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {booking.step === 4 && (
          <div className="book-step">
            <h2 className="book-step-title">Confirm Your Booking</h2>
            <div className="book-confirm-card">
              <div className="book-confirm-section">
                <span className="book-confirm-label">Service</span>
                <strong>{booking.service?.name}</strong>
              </div>

              {booking.extras.length > 0 && (
                <div className="book-confirm-section">
                  <span className="book-confirm-label">Extras</span>
                  <div className="book-confirm-extras">
                    {booking.extras.map((e) => (
                      <span key={e._id} className="book-confirm-extra">{e.name} (+{formatMoney(e.price)})</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="book-confirm-section">
                <span className="book-confirm-label">Date & Time</span>
                <strong>{booking.slot ? formatDateTime(booking.slot.start) : '—'}</strong>
              </div>

              <div className="book-confirm-section">
                <span className="book-confirm-label">Staff</span>
                <strong>{booking.staff === 'auto' || !booking.staff ? 'Auto (least loaded)' : 'Selected staff'}</strong>
                {booking.staff === 'auto' && (
                  <span className="book-confirm-note">
                    <AlertTriangle size={13} /> May be pending if no staff is available
                  </span>
                )}
              </div>

              <div className="book-confirm-section">
                <span className="book-confirm-label">Payment</span>
                <strong style={{ textTransform: 'uppercase' }}>{booking.paymentMethod}</strong>
              </div>

              <div className="book-confirm-divider" />

              <div className="book-confirm-total">
                <span>Total</span>
                <strong>{formatMoney(subtotal)}</strong>
              </div>
              <p className="book-confirm-disclaimer">
                Final price is computed server-side and may include tax or discounts.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="book-nav">
        {booking.step > 0 && (
          <Button variant="secondary" onClick={booking.prevStep}>
            <ArrowLeft size={16} /> Back
          </Button>
        )}
        {booking.step < 4 && (
          <Button
            onClick={booking.nextStep}
            disabled={!canNext()}
            style={{ marginLeft: 'auto' }}
          >
            Next <ArrowRight size={16} />
          </Button>
        )}
        {booking.step === 4 && (
          <Button
            onClick={handleBook}
            disabled={submitting}
            style={{ marginLeft: 'auto' }}
          >
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </Button>
        )}
      </div>
    </div>
  );
}
