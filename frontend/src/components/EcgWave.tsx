import React from 'react';

interface EcgWaveProps {
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export const EcgWave: React.FC<EcgWaveProps> = ({
  className = "w-full h-12",
  color = "#34D399",
  strokeWidth = 2
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 600 80"
        className="w-full h-full preserve-3d"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ecgGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.1" />
            <stop offset="60%" stopColor={color} stopOpacity="0.8" />
            <stop offset="90%" stopColor="#A7F3D0" stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Base faint grid line */}
        <line x1="0" y1="40" x2="600" y2="40" stroke="#065F46" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />

        {/* ECG pulse rhythm path */}
        <path
          d="M0,40 L120,40 L130,40 L140,32 L150,48 L158,40 L168,40 L176,14 L184,72 L192,28 L200,44 L208,40 L220,40 L232,35 L244,40 L360,40 L370,40 L380,32 L390,48 L398,40 L408,40 L416,14 L424,72 L432,28 L440,44 L448,40 L460,40 L472,35 L484,40 L600,40"
          stroke="url(#ecgGlow)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="600"
          className="animate-ecg-draw"
        />

        {/* Scanning glowing dot */}
        <circle cx="180" cy="40" r="3" fill="#A7F3D0" className="animate-pulse-glow" filter="drop-shadow(0 0 4px #10B981)">
          <animate
            attributeName="cx"
            values="0;600"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};
