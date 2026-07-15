import { Clock } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function UserHistory() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Booking History</h1>
      <Card>
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
          <Clock size={48} strokeWidth={1} style={{ marginBottom: 12 }} />
          <p>Booking history coming in Phase 5</p>
        </div>
      </Card>
    </div>
  );
}
