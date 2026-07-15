import { Clock } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function AdminStaffHistory() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Staff Appointment History</h1>
      <Card>
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
          <Clock size={48} strokeWidth={1} style={{ marginBottom: 12 }} />
          <p>Staff history view coming in Phase 7</p>
        </div>
      </Card>
    </div>
  );
}
