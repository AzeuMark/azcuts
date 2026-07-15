import { Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function BookWizard() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Book an Appointment</h1>
      <Card>
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
          <Calendar size={48} strokeWidth={1} style={{ marginBottom: 12 }} />
          <p>Booking wizard coming in Phase 4</p>
        </div>
      </Card>
    </div>
  );
}
