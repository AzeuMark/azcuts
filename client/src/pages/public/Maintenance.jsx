import { Wrench } from 'lucide-react';
import './Maintenance.css';

export default function Maintenance() {
  return (
    <div className="maintenance-page">
      <Wrench size={64} strokeWidth={1} />
      <h1>We'll Be Right Back</h1>
      <p>AzCuts is currently undergoing maintenance. Please check back soon.</p>
    </div>
  );
}
