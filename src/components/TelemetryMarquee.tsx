import React from 'react';

// ─── Log entries ───────────────────────────────────────────────────────────────
// Each segment is { text, type } where type drives the color
type SegType = 'muted' | 'red' | 'green' | 'cyan' | 'amber' | 'white';
type Seg = { text: string; type: SegType };

const buildLog = (segments: Seg[]): Seg[] => segments;

const LOGS: Seg[][] = [
  buildLog([
    { text: '[SYS_ALERT]', type: 'red' },
    { text: ' BLOCKED: BiDi Override ', type: 'muted' },
    { text: '<U+202E>', type: 'amber' },
    { text: ' from IP ', type: 'muted' },
    { text: '192.168.1.47', type: 'white' },
    { text: ' → DESC ISR §10.2', type: 'cyan' },
  ]),
  buildLog([
    { text: '[JSD_DRIFT]', type: 'amber' },
    { text: ' Score ', type: 'muted' },
    { text: '0.812', type: 'red' },
    { text: ' DETECTED → HTTP ', type: 'muted' },
    { text: '422', type: 'green' },
    { text: ' ENFORCED', type: 'green' },
  ]),
  buildLog([
    { text: '[RUNTIME]', type: 'cyan' },
    { text: ' HTTP 500 CRASH AVOIDED → Pydantic StrictFloat ', type: 'muted' },
    { text: 'ACTIVE', type: 'green' },
  ]),
  buildLog([
    { text: '[GHOST_TAG]', type: 'red' },
    { text: ' U+E0000 Plane-14 payload stripped from ', type: 'muted' },
    { text: 'POST /api/classify', type: 'white' },
    { text: ' → latency +', type: 'muted' },
    { text: '0.3ms', type: 'green' },
  ]),
  buildLog([
    { text: '[SAMA_CSF]', type: 'amber' },
    { text: ' Availability check: p99/p50 ratio ', type: 'muted' },
    { text: '34×', type: 'red' },
    { text: ' → DoS flag raised', type: 'muted' },
  ]),
  buildLog([
    { text: '[CBUAE]', type: 'cyan' },
    { text: ' MODEL_FAIRNESS audit triggered → JSD=', type: 'muted' },
    { text: '0.684', type: 'red' },
    { text: ' on Tashkeel payload', type: 'muted' },
  ]),
  buildLog([
    { text: '[INTERCEPT]', type: 'green' },
    { text: ' Quadratic recursion depth ', type: 'muted' },
    { text: '1500', type: 'red' },
    { text: ' → Max-depth limiter ', type: 'muted' },
    { text: 'BLOCKED', type: 'green' },
  ]),
  buildLog([
    { text: '[SYS_ALERT]', type: 'red' },
    { text: ' NaN primitive in temperature field → IEEE-754 breach from ', type: 'muted' },
    { text: '10.0.0.212', type: 'white' },
  ]),
  buildLog([
    { text: '[BASELINE]', type: 'cyan' },
    { text: ' N=30 empirical sample complete → JSD baseline locked at ', type: 'muted' },
    { text: '0.023', type: 'green' },
  ]),
  buildLog([
    { text: '[OWASP_LLM01]', type: 'amber' },
    { text: ' Prompt injection attempt via homoglyph: Cyrillic ', type: 'muted' },
    { text: '"а"→"a"', type: 'red' },
    { text: ' swap neutralised', type: 'muted' },
  ]),
];

// ─── Color map ─────────────────────────────────────────────────────────────────
const COLOR: Record<SegType, string> = {
  muted:  'text-[#52525B]',
  red:    'text-[#F43F5E]',
  green:  'text-[#34D399]',
  cyan:   'text-[#22D3EE]',
  amber:  'text-[#F59E0B]',
  white:  'text-[#D4D4D8]',
};

// ─── Single rendered log line ──────────────────────────────────────────────────
const LogLine = ({ segs }: { segs: Seg[] }) => (
  <span className="inline-flex items-center gap-0 whitespace-nowrap font-mono text-[11px] tracking-wide">
    {segs.map((s, i) => (
      <span key={i} className={COLOR[s.type]}>{s.text}</span>
    ))}
  </span>
);

// ─── Separator between log entries ────────────────────────────────────────────
const Sep = () => (
  <span className="mx-8 text-[#3F3F46] font-mono text-[10px] select-none">{'///'}</span>
);

// ─── Build one full pass of all logs ─────────────────────────────────────────
const FullPass = () => (
  <>
    {LOGS.map((log, i) => (
      <React.Fragment key={i}>
        <LogLine segs={log} />
        <Sep />
      </React.Fragment>
    ))}
  </>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const TelemetryMarquee: React.FC = () => {
  return (
    <footer className="relative w-full bg-[#050505] border-t border-[#27272A] overflow-hidden">

      {/* Top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F43F5E]/30 to-transparent pointer-events-none" />

      {/* Left + right fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #050505, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #050505, transparent)' }} />

      {/* Header bar */}
      <div className="flex items-center justify-between px-8 py-2 border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] animate-pulse" />
          <span className="font-mono text-[9px] tracking-[0.3em] text-[#52525B] uppercase">
            AEGIS-GHOST // LIVE TELEMETRY FEED
          </span>
        </div>
        <span className="font-mono text-[9px] tracking-widest text-[#3F3F46] uppercase">
          THREAT_STREAM_ACTIVE
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="py-3 flex overflow-hidden">
        {/* Two identical passes so it loops seamlessly */}
        <div
          className="flex shrink-0 items-center"
          style={{
            animation: 'marquee-scroll 55s linear infinite',
          }}
        >
          <FullPass />
          <FullPass />
        </div>
      </div>

      {/* Footer credits */}
      <div className="flex items-center justify-between px-8 py-2 border-t border-[#27272A]">
        <span className="font-mono text-[9px] tracking-widest text-[#3F3F46] uppercase">
          © 2025 AEGIS-GHOST — GCC AI ADVERSARIAL RESEARCH
        </span>
        <div className="flex items-center gap-4">
          {['DESC ISR', 'SAMA CSF', 'CBUAE', 'OWASP LLM'].map(f => (
            <span key={f} className="font-mono text-[8px] tracking-widest text-[#3F3F46] uppercase">{f}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </footer>
  );
};

export default TelemetryMarquee;
