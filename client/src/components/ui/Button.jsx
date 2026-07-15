import { forwardRef } from 'react';
import './Button.css';

const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', disabled, className = '', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`btn btn--${variant} btn--${size} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
