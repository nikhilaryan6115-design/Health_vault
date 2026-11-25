import React from 'react';
import { Radio, ShieldCheck } from 'lucide-react';

interface NfcRippleGraphicProps {
  isScanning?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const NfcRippleGraphic: React.FC<NfcRippleGraphicProps> = ({
  isScanning = false,
  size = 'md'
}) => {
  const containerSize = size === 'sm' ? 'w-24 h-24' : size === 'lg' ? 'w-48 h-48' : 'w-36 h-36';
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';

  return (
    <div className={`relative flex items-center justify-center mx-auto ${containerSize}`}>
      {/* Outer ripple rings */}
      <div className={`absolute inset-0 rounded-full border border-emerald-400/30 ${isScanning ? 'animate-radar-ping' : 'scale-90 opacity-40'} transition-all`} />
      <div
        className={`absolute inset-2 rounded-full border border-emerald-500/40 ${isScanning ? 'animate-radar-ping' : 'scale-95 opacity-50'} transition-all`}
        style={{ animationDelay: '0.6s' }}
      />
      <div
        className={`absolute inset-5 rounded-full border border-emerald-600/50 ${isScanning ? 'animate-radar-ping' : 'scale-100 opacity-60'} transition-all`}
        style={{ animationDelay: '1.2s' }}
      />

      {/* Center glowing badge */}
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 border border-emerald-400/30 animate-float-gentle">
        <Radio className={`${iconSize} text-emerald-100 ${isScanning ? 'animate-pulse' : ''}`} />

        {/* Small floating privacy check badge */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-900 border-2 border-white flex items-center justify-center text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
