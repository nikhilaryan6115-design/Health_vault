import React from 'react';
import { Radio, Wifi } from 'lucide-react';

interface NfcRadarGraphicProps {
  isScanning: boolean;
  statusText?: string;
  onTap?: () => void;
}

export const NfcRadarGraphic: React.FC<NfcRadarGraphicProps> = ({
  isScanning,
  statusText = 'Ready for Contactless Tap',
  onTap
}) => {
  return (
    <div
      onClick={onTap}
      className={`relative py-8 flex flex-col items-center justify-center cursor-pointer select-none group transition-all`}
    >
      {/* Concentric Radar Waves */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Outer Ring 3 */}
        <div
          className={`absolute inset-0 rounded-full border border-emerald-400/20 ${
            isScanning ? 'animate-radar-ping' : 'group-hover:scale-110 transition-transform duration-500'
          }`}
          style={{ animationDelay: '0.6s' }}
        />

        {/* Outer Ring 2 */}
        <div
          className={`absolute w-28 h-28 rounded-full border border-emerald-500/30 bg-emerald-50/20 ${
            isScanning ? 'animate-radar-ping' : 'group-hover:scale-105 transition-transform duration-500'
          }`}
          style={{ animationDelay: '0.3s' }}
        />

        {/* Center Target Disc */}
        <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white flex flex-col items-center justify-center shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-all duration-300">
          <Radio className={`w-8 h-8 text-emerald-200 ${isScanning ? 'animate-pulse' : ''}`} />
          <span className="text-[9px] font-bold tracking-widest text-emerald-100 uppercase mt-1">
            NFC
          </span>
        </div>

        {/* Ambient breathing aura */}
        <div className="absolute w-24 h-24 rounded-full bg-emerald-400/20 blur-md pointer-events-none animate-pulse-glow" />
      </div>

      {/* Subtext */}
      <div className="mt-3 text-center">
        <p className="text-xs font-bold text-charcoal-800 flex items-center justify-center space-x-1.5">
          <Wifi className="w-3.5 h-3.5 text-emerald-700" />
          <span>{statusText}</span>
        </p>
        <p className="text-[10px] text-charcoal-500 mt-0.5">
          Hold device near NFC tag or click here to simulate physical tap
        </p>
      </div>
    </div>
  );
};
