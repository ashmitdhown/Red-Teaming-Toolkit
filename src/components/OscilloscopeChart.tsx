import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// JSD cycles: 8 nominal ticks (~4s) → 4 anomaly ticks (~2s) → repeat
const ANOMALY_VALUES = [0.312, 0.581, 0.812, 0.634];

const Y_LABELS = ['1.0', '0.8', '0.6', '0.4', '0.2', '0.0'];
const X_LABELS = ['0', 'N/8', 'N/4', '3N/8', 'N/2', '5N/8', '3N/4', '7N/8', 'N=30'];

export const OscilloscopeChart: React.FC = () => {
  const [jsd, setJsd] = useState(0.023);
  const [isAnomaly, setIsAnomaly] = useState(false);

  useEffect(() => {
    let tick = 0;
    const id = setInterval(() => {
      tick += 1;
      const phase = tick % 12;
      if (phase >= 8) {
        setJsd(ANOMALY_VALUES[phase - 8]);
        setIsAnomaly(true);
      } else {
        setJsd(parseFloat((0.018 + Math.random() * 0.012).toFixed(3)));
        setIsAnomaly(false);
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full aspect-[21/9] max-w-5xl border border-[#F43F5E]/30 bg-black relative flex flex-col shadow-[0_0_50px_rgba(244,63,94,0.1)]">

      {/* ── Title bar ───────────────────────────────────────────────── */}
      <div className="h-8 border-b border-[#F43F5E]/30 flex justify-between items-center px-4 font-mono text-[9px] tracking-widest text-[#71717A] shrink-0">
        <span>DRIFT_OSCILLOSCOPE // JSD-MATH</span>
        <span className="text-[#F43F5E] animate-pulse">RECORDING_ANOMALY</span>
      </div>

      {/* ── Chart body ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Y-axis labels */}
        <div className="flex flex-col justify-between py-1 px-2 shrink-0 border-r border-[#F43F5E]/15 relative">
          {/* Rotated "JSD" unit label */}
          <span
            className="absolute left-0 top-1/2 font-mono text-[7px] text-[#3F3F46] uppercase tracking-widest select-none"
            style={{ writingMode: 'vertical-rl', transform: 'translateX(-2px) translateY(-50%) rotate(180deg)' }}
          >
            JSD
          </span>
          {Y_LABELS.map(l => (
            <span key={l} className="font-mono text-[8px] text-[#3F3F46] leading-none pl-3">{l}</span>
          ))}
        </div>

        {/* SVG canvas */}
        <div className="flex-1 relative overflow-hidden">

          {/* Horizontal grid lines at 0 / 20 / 40 / 60 / 80 / 100% */}
          {[0, 20, 40, 60, 80, 100].map(pct => (
            <div
              key={pct}
              className="absolute left-0 right-0 border-t border-[#27272A]/50 pointer-events-none"
              style={{ top: `${pct}%` }}
            />
          ))}

          {/* Dashed anomaly threshold at JSD = 0.5 → 50% height */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{ top: '50%', borderTop: '1px dashed rgba(244,63,94,0.2)' }}
          >
            <span className="absolute right-2 -top-3 font-mono text-[7px] text-[#F43F5E]/40 uppercase tracking-widest">
              ANOMALY THRESHOLD · 0.5
            </span>
          </div>

          {/* Waveform SVG */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Fill under the wave */}
            <motion.path
              d="M0,50 C100,50 150,150 250,150 C350,150 400,50 500,50 C600,50 650,150 750,150 C850,150 900,50 1000,50 L1000,200 L0,200 Z"
              fill="url(#waveGrad)"
              animate={{
                d: [
                  'M0,50 C100,50 150,150 250,150 C350,150 400,50 500,50 C600,50 650,150 750,150 C850,150 900,50 1000,50 L1000,200 L0,200 Z',
                  'M0,150 C100,150 150,50 250,50 C350,50 400,150 500,150 C600,150 650,50 750,50 C850,50 900,150 1000,150 L1000,200 L0,200 Z',
                  'M0,50 C100,50 150,150 250,150 C350,150 400,50 500,50 C600,50 650,150 750,150 C850,150 900,50 1000,50 L1000,200 L0,200 Z',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Waveform stroke */}
            <motion.path
              d="M0,50 C100,50 150,150 250,150 C350,150 400,50 500,50 C600,50 650,150 750,150 C850,150 900,50 1000,50"
              fill="none"
              stroke="#F43F5E"
              strokeWidth="2"
              animate={{
                d: [
                  'M0,50 C100,50 150,150 250,150 C350,150 400,50 500,50 C600,50 650,150 750,150 C850,150 900,50 1000,50',
                  'M0,150 C100,150 150,50 250,50 C350,50 400,150 500,150 C600,150 650,50 750,50 C850,50 900,150 1000,150',
                  'M0,50 C100,50 150,150 250,150 C350,150 400,50 500,50 C600,50 650,150 750,150 C850,150 900,50 1000,50',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>

          {/* ── Live JSD readout ──────────────────────────────────── */}
          <div className="absolute bottom-3 right-3 z-10">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 border backdrop-blur-sm transition-all duration-300 ${
                isAnomaly
                  ? 'border-[#F43F5E]/50 bg-[#F43F5E]/8 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                  : 'border-[#27272A] bg-black/70'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                  isAnomaly ? 'bg-[#F43F5E] animate-pulse' : 'bg-[#34D399]'
                }`}
              />
              <span className="font-mono text-[9px] tracking-widest text-[#52525B] uppercase">
                Current JSD:
              </span>
              <span
                className={`font-mono text-[11px] font-bold tabular-nums transition-colors duration-300 ${
                  isAnomaly ? 'text-[#F43F5E]' : 'text-[#71717A]'
                }`}
              >
                {jsd.toFixed(3)}
              </span>
              <span
                className={`font-mono text-[9px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                  isAnomaly ? 'text-[#F43F5E]' : 'text-[#34D399]'
                }`}
              >
                {isAnomaly ? '(ANOMALY)' : '(NOMINAL)'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── X-axis label bar ────────────────────────────────────────── */}
      <div className="h-5 border-t border-[#F43F5E]/15 flex items-center justify-between px-4 shrink-0">
        {X_LABELS.map(l => (
          <span key={l} className="font-mono text-[7px] text-[#3F3F46]">{l}</span>
        ))}
      </div>

    </div>
  );
};

export default OscilloscopeChart;
