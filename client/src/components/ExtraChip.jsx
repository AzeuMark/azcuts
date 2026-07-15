import { Check } from 'lucide-react';
import { formatMoney } from '../utils/formatMoney';
import './ExtraChip.css';

export default function ExtraChip({ extra, selected, onToggle }) {
  return (
    <button
      type="button"
      className={`extra-chip ${selected ? 'extra-chip--selected' : ''}`}
      onClick={() => onToggle(extra)}
    >
      {selected && <Check size={14} />}
      <span className="extra-chip-name">{extra.name}</span>
      <span className="extra-chip-price">+{formatMoney(extra.price)}</span>
    </button>
  );
}
