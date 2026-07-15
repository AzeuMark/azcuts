import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { settingsApi } from '../../api/settings.api';
import ServiceCard from '../../components/ServiceCard';
import ExtraChip from '../../components/ExtraChip';
import SlotPicker from '../../components/SlotPicker';
import StaffPicker from '../../components/StaffPicker';
import StepIndicator from '../../components/StepIndicator';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { formatMoney } from '../../utils/formatMoney';
import './BookWizard.css';

export default function BookWizard() {
  const booking = useBooking();

  const { data: publicData, isLoading } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      const { data } = await settingsApi.getPublic();
      return data.data;
    },
  });

  const services = publicData?.services || [];
  const extras = publicData?.extras || [];

  const runningTotal = useMemo(() => {
    const base = booking.service?.price || 0;
    const extrasTotal = booking.extras.reduce((sum, e) => sum + e.price, 0);
    return base + extrasTotal;
  }, [booking.service, booking.extras]);

  const canNext = () => {
    switch (booking.step) {
      case 0: return !!booking.service;
      case 1: return true; // extras optional
      case 2: return !!booking.slot;
      default: return true;
    }
  };

  if (isLoading) {
    return <div className="book-loading"><Spinner size={32} /></div>;
  }

  return (
    <div className="book-wizard">
      <h1 className="book-title">Book an Appointment</h1>

      <StepIndicator current={booking.step} />

      {/* Running total */}
      <div className="book-total-bar">
        <span>Estimated Total</span>
        <span className="book-total-amount">{formatMoney(runningTotal)}</span>
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

        {/* Step 3: Payment (placeholder for Phase 4) */}
        {booking.step === 3 && (
          <div className="book-step">
            <h2 className="book-step-title">Payment Method</h2>
            <p className="book-step-desc">Full payment step coming in Phase 4</p>
          </div>
        )}

        {/* Step 4: Confirm (placeholder for Phase 4) */}
        {booking.step === 4 && (
          <div className="book-step">
            <h2 className="book-step-title">Confirm Booking</h2>
            <p className="book-step-desc">Full confirmation step coming in Phase 4</p>
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
      </div>
    </div>
  );
}
