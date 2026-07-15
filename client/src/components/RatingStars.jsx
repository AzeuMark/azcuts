import { useState } from 'react';
import { Star } from 'lucide-react';
import './RatingStars.css';

export default function RatingStars({ value = 0, onChange, readonly = false, size = 24 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="rating-stars" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            className={`rating-star ${filled ? 'rating-star--filled' : ''} ${readonly ? 'rating-star--readonly' : ''}`}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            disabled={readonly}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
}
