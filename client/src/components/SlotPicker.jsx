import { useState, useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { useSlots } from '../hooks/useSlots';
import Spinner from './ui/Spinner';
import './SlotPicker.css';

export default function SlotPicker({ serviceId, staffId, value, onSelect }) {
  const today = dayjs().format('YYYY-MM-DD');
  const [date, setDate] = useState(today);

  const { data: slots, isLoading } = useSlots(serviceId, date, staffId);

  const dates = useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = dayjs().add(i, 'day');
      result.push({
        value: d.format('YYYY-MM-DD'),
        label: d.format('ddd'),
        day: d.format('D'),
        month: d.format('MMM'),
      });
    }
    return result;
  }, []);

  return (
    <div className="slot-picker">
      <div className="slot-picker-header">
        <Calendar size={18} />
        <span>Select a Date & Time</span>
      </div>

      <div className="slot-picker-dates">
        {dates.map((d) => (
          <button
            key={d.value}
            type="button"
            className={`slot-date-btn ${date === d.value ? 'slot-date-btn--active' : ''}`}
            onClick={() => setDate(d.value)}
          >
            <span className="slot-date-label">{d.label}</span>
            <span className="slot-date-day">{d.day}</span>
            <span className="slot-date-month">{d.month}</span>
          </button>
        ))}
      </div>

      <div className="slot-picker-times">
        {isLoading ? (
          <div className="slot-picker-loading"><Spinner size={24} /></div>
        ) : slots && slots.length > 0 ? (
          <div className="slot-time-grid">
            {slots.map((slot) => {
              const isSelected = value?.start === slot.start;
              const isDisabled = !slot.availableStaffCount;
              return (
                <button
                  key={slot.start}
                  type="button"
                  className={`slot-time-btn ${isSelected ? 'slot-time-btn--active' : ''} ${isDisabled ? 'slot-time-btn--disabled' : ''}`}
                  onClick={() => !isDisabled && onSelect(slot)}
                  disabled={isDisabled}
                >
                  <Clock size={13} />
                  <span>{dayjs(slot.start).format('h:mm A')}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="slot-picker-empty">No available slots for this date.</p>
        )}
      </div>
    </div>
  );
}
