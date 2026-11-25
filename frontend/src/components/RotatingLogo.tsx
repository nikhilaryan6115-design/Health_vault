import React from 'react';

/**
 * Simple rotating SVG logo used as a subtle motion graphic.
 * Utilises Tailwind's custom "spin" animation (defined via animate-[spin_6s_linear_infinite]).
 */
interface RotatingLogoProps {
  className?: string;
}

export const RotatingLogo: React.FC<RotatingLogoProps> = ({ className = '' }) => (
  <svg
    viewBox="0 0 100 100"
    className={`animate-spin ${className}`}
    style={{ animationDuration: '6s' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="45" stroke="#10B981" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray="80 200" />
    <circle cx="50" cy="50" r="28" stroke="#059669" strokeWidth="4" fill="none" opacity="0.4" strokeDasharray="40 100" />
    <circle cx="50" cy="50" r="6" fill="#10B981" />
  </svg>
);
