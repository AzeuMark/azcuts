import { Scissors } from 'lucide-react';
import { formatMoney } from '../utils/formatMoney';
import './ServiceCard.css';

export default function ServiceCard({ service, onSelect, selected, compact }) {
  const imgSrc = service.image
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${service.image}`
    : null;

  return (
    <button
      type="button"
      className={`service-card ${selected ? 'service-card--selected' : ''} ${compact ? 'service-card--compact' : ''}`}
      onClick={() => onSelect?.(service)}
    >
      <div className="service-card-img">
        {imgSrc ? (
          <img src={imgSrc} alt={service.name} loading="lazy" />
        ) : (
          <div className="service-card-placeholder">
            <Scissors size={32} strokeWidth={1.2} />
          </div>
        )}
      </div>
      <div className="service-card-body">
        <h3 className="service-card-name">{service.name}</h3>
        {service.description && !compact && (
          <p className="service-card-desc">{service.description}</p>
        )}
        <div className="service-card-footer">
          <span className="service-card-price">{formatMoney(service.price)}</span>
          {service.durationMinutes && !compact && (
            <span className="service-card-duration">{service.durationMinutes} min</span>
          )}
        </div>
      </div>
    </button>
  );
}
