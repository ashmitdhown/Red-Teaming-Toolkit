import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AttackVector {
  label: string;
  wafInput: string;
  wafMatch: string;
  wafStatus: string;
  realityPayload: string;
  realityDrift: string;
  realityResult: string;
  remediatedFix: string;
  remediatedStatus: string;
  telemetry: string;
  telemetryColor: 'cyan' | 'rose' | 'amber';
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const attackVectors: AttackVector[] = [
  {
    label: 'Ghost Tags (U+E0000)',
    wafInput: '"Ignore instructions"',
    wafMatch: 'False',
    wafStatus: 'Forwarded to Inference...',
    realityPayload: 'U+E0000 Plane 14 Ghost Tags',
    realityDrift: 'Tokenizer Drift (Critical Desync)',
    realityResult: 'Prompt Hijacked',
    remediatedFix: 'Plane 14 Tag Stripping',
    remediatedStatus: 'HTTP 422 Unprocessable',
    telemetry: 'HTTP 200 | JSD = 0.812 | DESC ISR v3.1: §10.2 VIOLATION',
    telemetryColor: 'rose',
  },
  {
    label: 'BiDi + Tashkeel Smuggling',
    wafInput: '"تجاهل التعليمات"',
    wafMatch: 'False',
    wafStatus: 'Forwarded to Inference...',
    realityPayload: 'BiDi Override + Stacked Tashkeel',
    realityDrift: 'Subword Fragmentation (Confidence Flip)',
    realityResult: 'Decision Outcome Flipped',
    remediatedFix: 'NFKC Normalization + BiDi Strip',
    remediatedStatus: 'HTTP 422 Unprocessable',
    telemetry: 'HTTP 200 | JSD = 0.684 | CBUAE MODEL FAIRNESS VIOLATION',
    telemetryColor: 'amber',
  },
  {
    label: 'IEEE-754 Boundary Breach',
    wafInput: '{ temperature: NaN } — Valid JSON',
    wafMatch: 'False',
    wafStatus: 'Forwarded to Inference...',
    realityPayload: 'NaN / Infinity Float Primitive',
    realityDrift: 'C-Runtime Exception (Worker Crashed)',
    realityResult: 'Inference Worker Terminated',
    remediatedFix: 'Pydantic StrictFloat Schema',
    remediatedStatus: 'HTTP 422 Unprocessable',
    telemetry: 'HTTP 500 FATAL | UAE CYBERCRIME LAW: ARTICLE 7 VIOLATION',
    telemetryColor: 'rose',
  },
  {
    label: 'Quadratic Recursion Bomb',
    wafInput: 'Nested JSON Depth: 1500 — Rate Limit OK',
    wafMatch: 'False',
    wafStatus: 'Forwarded to Inference...',
    realityPayload: 'Deeply Nested JSON Object (×1500)',
    realityDrift: 'CPU Spike 100% (Silent DoS)',
    realityResult: 'Service Unavailable',
    remediatedFix: 'Max Depth Gateway Limiter',
    remediatedStatus: 'HTTP 429 Depth Exceeded',
    telemetry: 'LATENCY p99/p50 = 34× | SAMA CSF: AVAILABILITY DEGRADATION',
    telemetryColor: 'amber',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const TerminalLine = ({
  prefix,
  value,
  prefixColor = 'text-[#34D399]',
  valueColor = 'text-[#71717A]',
}: {
  prefix: string;
  value: string;
  prefixColor?: string;
  valueColor?: string;
}) => (
  <div className="flex flex-wrap gap-x-2 leading-relaxed">
    <span className={`${prefixColor} shrink-0`}>{`>`} {prefix}</span>
    <span className={valueColor}>{value}</span>
  </div>
);

const CardShell = ({
  children,
  className = '',
  style,
  spotlightColor = 'rgba(255,255,255,0.06)',
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  spotlightColor?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setSpotlight({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseLeave = useCallback(() => setSpotlight(null), []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex flex-col gap-5 p-6 rounded-sm border backdrop-blur-md overflow-hidden cursor-default ${className}`}
      style={style}
    >
      {/* Dynamic spotlight */}
      {spotlight && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
          style={{
            background: `radial-gradient(280px circle at ${spotlight.x}px ${spotlight.y}px, ${spotlightColor}, transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  );
};

const CardHeader = ({
  title,
  badge,
  badgeClass,
}: {
  title: string;
  badge: string;
  badgeClass: string;
}) => (
  <div className="flex items-center justify-between border-b border-white/10 pb-4">
    <span
      className="text-sm font-semibold uppercase tracking-widest text-white"
      style={{ fontFamily: "'Oswald', sans-serif" }}
    >
      {title}
    </span>
    <span className={`font-mono text-[9px] tracking-widest px-2 py-1 uppercase ${badgeClass}`}>
      {badge}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const WafIllusion: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const vec = attackVectors[activeTab];

  const telemetryColorMap = {
    rose: 'text-[#F43F5E] border-[#F43F5E]/30 bg-[#F43F5E]/5',
    cyan: 'text-[#22D3EE] border-[#22D3EE]/30 bg-[#22D3EE]/5',
    amber: 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/5',
  };

  return (
    <section className="relative w-full py-32 px-6 md:px-24 z-10 bg-[#0A0A0C] border-t border-[#27272A] overflow-hidden">

      {/* Subtle radial glow behind section */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-[#F43F5E]/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-14 relative z-10">

        {/* ── Section Header ───────────────────────────────────────────── */}
        <div className="text-center flex flex-col gap-3">
          <span
            className="font-mono text-[10px] tracking-[0.35em] text-[#F43F5E] uppercase block"
          >
            WHY THIS PRODUCT?
          </span>
          <h2
            className="text-5xl md:text-6xl font-bold uppercase tracking-tight text-white leading-none"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            THE WAF ILLUSION.
          </h2>
          <p
            className="text-[#A1A1AA] max-w-2xl mx-auto text-sm leading-relaxed mt-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            AI models are deployed behind legacy security systems that monitor strings, not semantic
            logic. They assume the text they see is the text the LLM executes.{' '}
            <span className="text-white font-medium">
              Aegis-Ghost exploits this exact gap.
            </span>
          </p>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 justify-center">
          {attackVectors.map((v, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`
                relative px-4 py-2 text-[11px] font-mono tracking-widest uppercase transition-all duration-300 border
                ${activeTab === i
                  ? 'border-[#F43F5E] text-[#F43F5E] bg-[#F43F5E]/8'
                  : 'border-white/10 text-[#71717A] bg-white/5 hover:border-white/20 hover:text-[#A1A1AA]'
                }
              `}
            >
              {activeTab === i && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute inset-0 bg-[#F43F5E]/5"
                  transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                />
              )}
              <span className="relative z-10">{v.label}</span>
            </button>
          ))}
        </div>

        {/* ── 3-Stage Grid ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          >
            {/* ── Card 1: Legacy Defense ──────────────────────────────── */}
            <CardShell
              className="bg-white/[0.03] border-white/10"
              spotlightColor="rgba(255,255,255,0.07)"
            >
              {/* Scan-line effect */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 4px)' }}
              />

              <CardHeader
                title="Legacy Defense"
                badge="0 ANOMALIES DETECTED"
                badgeClass="text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/20"
              />

              <div
                className="flex flex-col gap-2 font-mono text-xs"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <TerminalLine prefix="Input Scanned:" value={vec.wafInput} prefixColor="text-[#34D399]" />
                <TerminalLine prefix="Regex Match:" value={vec.wafMatch} prefixColor="text-[#34D399]" valueColor="text-[#34D399]" />
                <TerminalLine prefix="Status:" value={vec.wafStatus} prefixColor="text-[#34D399]" valueColor="text-[#A1A1AA]" />
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 font-mono text-[9px] text-[#52525B] tracking-widest uppercase">
                WAF Layer · String Heuristics · No Semantic Analysis
              </div>
            </CardShell>

            {/* ── Card 2: Aegis Reality ───────────────────────────────── */}
            <CardShell
              className="bg-[#111111] border-[#F43F5E]/25"
              style={{ boxShadow: '0 0 30px rgba(255,42,77,0.05)' }}
              spotlightColor="rgba(244,63,94,0.1)"
            >
              {/* Pulsing glow overlay */}
              <div className="absolute inset-0 bg-[#F43F5E]/[0.04] animate-pulse pointer-events-none" />

              <CardHeader
                title="Aegis-Ghost Reality"
                badge="SYSTEM COMPROMISED"
                badgeClass="text-[#F43F5E] bg-[#F43F5E]/10 border border-[#F43F5E]/25 animate-pulse"
              />

              <div
                className="relative z-10 flex flex-col gap-2 font-mono text-xs"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <TerminalLine prefix="Payload Contains:" value={vec.realityPayload} prefixColor="text-white" valueColor="text-[#A1A1AA]" />
                <TerminalLine prefix="Tokenizer Drift:" value={vec.realityDrift} prefixColor="text-white" valueColor="text-[#F43F5E]" />
                <TerminalLine
                  prefix="Result:"
                  value={vec.realityResult}
                  prefixColor="text-[#F43F5E]"
                  valueColor="text-[#F43F5E]"
                />
              </div>

              {/* Telemetry strip */}
              <div className={`relative z-10 mt-auto pt-4 border-t border-[#F43F5E]/15 font-mono text-[9px] tracking-widest uppercase border rounded px-3 py-2 ${telemetryColorMap[vec.telemetryColor]}`}>
                {vec.telemetry}
              </div>
            </CardShell>

            {/* ── Card 3: Aegis Remediated ────────────────────────────── */}
            <CardShell
              className="bg-white/[0.03] border-[#22D3EE]/20"
              style={{ boxShadow: '0 0 30px rgba(34,211,238,0.05)' }}
              spotlightColor="rgba(34,211,238,0.08)"
            >
              {/* Top-edge cyan accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22D3EE]/50 to-transparent" />

              <CardHeader
                title="Aegis Remediated"
                badge="ATTACK INTERCEPTED"
                badgeClass="text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/25"
              />

              <div
                className="flex flex-col gap-2 font-mono text-xs"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <TerminalLine prefix="Middleware:" value={vec.remediatedFix} prefixColor="text-[#22D3EE]" valueColor="text-[#A1A1AA]" />
                <TerminalLine prefix="HTTP Status:" value={vec.remediatedStatus} prefixColor="text-[#22D3EE]" valueColor="text-[#22D3EE]" />
                <TerminalLine prefix="Attack Blocked:" value="True" prefixColor="text-[#22D3EE]" valueColor="text-[#22D3EE]" />
              </div>

              {/* Shield indicator */}
              <div className="relative mt-auto pt-4 border-t border-[#22D3EE]/10">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="font-mono text-[9px] text-[#22D3EE]/70 tracking-widest uppercase">
                    Threat Neutralised · Compliance Preserved
                  </span>
                </div>
              </div>
            </CardShell>
          </motion.div>
        </AnimatePresence>

        {/* ── Vector counter pill ───────────────────────────────────── */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
            {attackVectors.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`transition-all duration-300 rounded-full ${
                  activeTab === i
                    ? 'w-6 h-1.5 bg-[#F43F5E]'
                    : 'w-1.5 h-1.5 bg-[#3F3F46] hover:bg-[#71717A]'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default WafIllusion;
