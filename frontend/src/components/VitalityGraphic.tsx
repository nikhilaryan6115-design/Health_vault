import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

interface VitalityGraphicProps {
  consistency: number;
}

export const VitalityGraphic: React.FC<VitalityGraphicProps> = ({ consistency }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-emerald-950/40 border border-emerald-700/50 p-4 backdrop-blur-xs flex flex-col justify-between">
      {/* Top micro status bar */}
      <div className="flex items-center justify-between text-xs z-10">
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            <span className="absolute w-5 h-5 rounded-full bg-emerald-400/30 animate-radar-ping" />
          </div>
          <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-emerald-300 inline" />
            <span>Health Routine Vitality</span>
          </span>
        </div>

        <span className="text-[10px] bg-emerald-800/80 text-emerald-200 border border-emerald-600/50 px-2 py-0.5 rounded-full font-mono">
          {consistency}% Adherence
        </span>
      </div>

      {/* Animated ECG SVG Graphic */}
      <div className="relative h-16 w-full my-1 flex items-center">
        <svg
          viewBox="0 0 600 80"
          className="w-full h-full stroke-emerald-300 fill-none"
          preserveAspectRatio="none"
        >
          {/* Faint static background grid lines */}
          <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="4 4" strokeWidth="1" />

          {/* Glowing ECG Heartbeat Path */}
          <path
            d="M0,40 L100,40 L120,40 L135,28 L145,55 L160,8 L175,70 L190,40 L220,40 L300,40 L320,40 L335,28 L345,55 L360,8 L375,70 L390,40 L420,40 L500,40 L520,40 L535,28 L545,55 L560,8 L575,70 L590,40 L600,40"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-ecg-draw"
            strokeDasharray="1000"
            style={{
              filter: 'drop-shadow(0px 0px 4px rgba(52, 211, 153, 0.8))'
            }}
          />
        </svg>

        {/* Ambient subtle glow blob */}
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-28 h-10 bg-emerald-500/20 rounded-full blur-xl pointer-events-none animate-pulse-glow" />
      </div>

      {/* Bottom telemetry indicators */}
      <div className="flex items-center justify-between text-[10px] text-emerald-300/80 z-10 pt-1 border-t border-emerald-800/40">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Local Vault Synced</span>
        </span>
        <span className="font-mono">
          Rhythm: {consistency >= 80 ? 'Optimal' : consistency >= 60 ? 'Moderate' : 'Irregular'}
        </span>
      </div>
    </div>
  );
};
