import { Package } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function AdminInventory() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Inventory</h1>
      <Card>
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
          <Package size={48} strokeWidth={1} style={{ marginBottom: 12 }} />
          <p>Inventory management coming in Phase 8</p>
        </div>
      </Card>
    </div>
  );
}
