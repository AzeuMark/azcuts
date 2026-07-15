import './Spinner.css';

export default function Spinner({ size = 24, className = '' }) {
  return (
    <div className={`spinner ${className}`} style={{ width: size, height: size }} aria-label="Loading">
      <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
