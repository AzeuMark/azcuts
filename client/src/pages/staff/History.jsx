import { Clock } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function StaffHistory() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Served History</h1>
      <Card>
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
          <Clock size={48} strokeWidth={1} style={{ marginBottom: 12 }} />
          <p>Staff history coming in Phase 6</p>
        </div>
      </Card>
    </div>
  );
}
