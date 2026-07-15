import './StepIndicator.css';

const STEPS = ['Service', 'Extras', 'Schedule', 'Payment', 'Confirm'];

export default function StepIndicator({ current }) {
  return (
    <div className="step-indicator">
      {STEPS.map((label, i) => (
        <div key={label} className={`step-item ${i < current ? 'step-item--done' : ''} ${i === current ? 'step-item--active' : ''}`}>
          <div className="step-dot">{i < current ? '✓' : i + 1}</div>
          <span className="step-label">{label}</span>
          {i < STEPS.length - 1 && <div className="step-line" />}
        </div>
      ))}
    </div>
  );
}
