import { Settings as SettingsIcon } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function StaffSettings() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Staff Settings</h1>
      <Card>
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
          <SettingsIcon size={48} strokeWidth={1} style={{ marginBottom: 12 }} />
          <p>Staff settings coming in Phase 6</p>
        </div>
      </Card>
    </div>
  );
}
