import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingPageProps {
  onEnterWorkspace: () => void;
}

// --- Animated Radar Chart ---
const RadarChart = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const baseScores = [82, 91, 48, 61, 71, 83];
  const drift = tick % 2 === 0 ? [0, 0, 0, 0, 0, 0] : [3, -4, 12, -6, 5, -3];
  const scores = baseScores.map((s, i) => Math.min(100, Math.max(0, s + drift[i])));

  const labels = ['VAL', 'BND', 'ENC', 'PRT', 'SAF', 'ERR'];
  const cx = 70, cy = 70, r = 50;
  const numAxes = 6;

  const getPoint = (index: number, value: number): [number, number] => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const dist = (value / 100) * r;
    return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)];
  };

  const getLabelPos = (index: number): [number, number] => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const dist = r + 12;
    return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)];
  };

  const polygonPoints = scores.map((s, i) => getPoint(i, s).join(',')).join(' ');
  const rings = [20, 40, 60, 80, 100];

  return (
    <svg viewBox="0 0 140 140" className="w-full h-full font-mono overflow-visible">
      {rings.map(ring =>
        <polygon
          key={ring}
          points={Array.from({ length: numAxes }, (_, i) => getPoint(i, ring).join(',')).join(' ')}
          fill="none"
          stroke="rgba(59,130,246,0.15)"
          strokeWidth="0.5"
        />
      )}
      {Array.from({ length: numAxes }, (_, i) => {
        const [x, y] = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />;
      })}
      <polygon
        points={polygonPoints}
        fill="rgba(59,130,246,0.12)"
        stroke="rgba(59,130,246,0.7)"
        strokeWidth="1.2"
        style={{ transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {scores.map((s, i) => {
        const [x, y] = getPoint(i, s);
        return <circle key={i} cx={x} cy={y} r="2" fill="rgb(59,130,246)" style={{ transition: 'all 0.8s' }} />;
      })}
      {labels.map((label, i) => {
        const [x, y] = getLabelPos(i);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="6" fill="rgba(148,163,184,0.8)" fontFamily="Space Mono, monospace" fontWeight="bold">
            {label}
          </text>
        );
      })}
    </svg>
  );
};

// --- Animated Terminal ---
const BOOT_LINES = [
  { delay: 0,    text: '> Initializing Aegis-Ghost v1.0.0...',                  type: 'info' as const },
  { delay: 400,  text: '> Loading attack primitives [4/4]...',                   type: 'info' as const },
  { delay: 800,  text: '> Statistical engine: Jensen-Shannon Divergence ready.',  type: 'info' as const },
  { delay: 1200, text: '> [OK] UAE compliance map loaded (DESC/CBUAE)',           type: 'ok' as const },
  { delay: 1600, text: '> [OK] Red-team agent armed. 9 tools available.',         type: 'ok' as const },
  { delay: 2100, text: '> Probing target: 127.0.0.1:8000...',                    type: 'info' as const },
  { delay: 2500, text: '> [+] Target acquired: HTTP 200 OK',                     type: 'ok' as const },
  { delay: 3000, text: '> Baseline established (N=30). JSD: 0.002.',             type: 'ok' as const },
  { delay: 3400, text: '> [WARN] Ghost payload injected. U+E0000 tags active.',  type: 'alert' as const },
  { delay: 3900, text: '> Confidence drift detected: JSD → 0.842',              type: 'alert' as const },
  { delay: 4300, text: '> [VULN] INTEGRITY: COMPROMISED',                        type: 'alert' as const },
  { delay: 4700, text: '> Causal analysis complete. Report ready.',              type: 'ok' as const },
];

const Terminal = () => {
  const [visibleLines, setVisibleLines] = useState<typeof BOOT_LINES>([]);
  const [cursor, setCursor] = useState(true);
  // Ref on the scrollable container — we scroll it directly so the page never moves
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    BOOT_LINES.forEach((line) => {
      timers.push(setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
      }, line.delay));
    });
    const cursorInterval = setInterval(() => setCursor(c => !c), 530);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(cursorInterval);
    };
  }, []);

  useEffect(() => {
    // Scroll only within the terminal box — never touches the page scroll position
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const colorMap = {
    info: 'text-slate-400',
    ok: 'text-emerald-400',
    alert: 'text-red-400',
  };

  return (
    <div className="bg-[#0a0a0f] border border-blue-500/20 rounded-xl overflow-hidden font-mono text-[11px] leading-relaxed h-full flex flex-col shadow-2xl shadow-blue-500/5">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111118] border-b border-blue-500/10">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-2 text-slate-500 text-[10px] tracking-widest uppercase">aegis-ghost // execution_log</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 selectable">
        <AnimatePresence>
          {visibleLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={colorMap[line.type]}
            >
              {line.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {visibleLines.length < BOOT_LINES.length && (
          <span className="text-slate-400">
            {'>'} {cursor ? '█' : ' '}
          </span>
        )}
      </div>
    </div>
  );
};

// --- Live Metrics Strip ---
const useLiveMetric = (base: number, variance: number, interval: number) => {
  const [value, setValue] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setValue(base + (Math.random() - 0.5) * variance);
    }, interval);
    return () => clearInterval(id);
  }, [base, variance, interval]);
  return value;
};

const MetricPill = ({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) => (
  <div className="flex flex-col gap-1 px-5 py-3 border border-slate-800 bg-[#0d0d14] rounded-lg min-w-[120px]">
    <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-mono">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className={`font-mono text-lg font-bold tabular-nums ${color}`}>{value}</span>
      {unit && <span className="text-slate-500 text-[10px] font-mono">{unit}</span>}
    </div>
  </div>
);

const LiveMetrics = () => {
  const latency = useLiveMetric(42, 12, 1400);
  const jsd = useLiveMetric(0.002, 0.003, 900);

  return (
    <div className="flex gap-3 flex-nowrap">
      <MetricPill label="State" value="IDLE" color="text-emerald-400" />
      <MetricPill label="Latency p99" value={latency.toFixed(0)} unit="ms" color="text-blue-400" />
      <MetricPill label="JSD Baseline" value={jsd.toFixed(3)} color="text-amber-400" />
      <MetricPill label="Auth" value="DESC_AUDIT" color="text-slate-300" />
    </div>
  );
};

// --- Capability Card ---
interface CapabilityCardProps {
  icon: React.ReactNode;
  title: string;
  tag: string;
  desc: string;
  accent: string;
  borderAccent: string;
  delay: number;
}

const CapabilityCard = ({ icon, title, tag, desc, accent, borderAccent, delay }: CapabilityCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="group relative bg-[#0d0d14] border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all duration-300 overflow-hidden cursor-default"
  >
    <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${borderAccent} transition-opacity duration-300`} />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.04) 0%, transparent 70%)' }} />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className={`${accent} opacity-80 group-hover:opacity-100 transition-opacity`}>{icon}</div>
        <span className={`font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded border ${accent} border-current opacity-50 group-hover:opacity-100 transition-opacity`}>
          {tag}
        </span>
      </div>
      <h3 className="font-sans font-semibold text-slate-200 text-sm mb-2 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-400 transition-colors">{desc}</p>
    </div>
  </motion.div>
);

// --- Main Landing Page ---
export const LandingPage = ({ onEnterWorkspace }: LandingPageProps) => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  // Ref on the page's own scroll container so nav scrolls stay internal
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((id: string) => {
    const container = containerRef.current;
    if (!container) return;
    if (id === 'top') {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = container.querySelector(`#${id}`) as HTMLElement | null;
    if (!el) return;
    // Offset by the sticky header height (56px = h-14)
    const headerHeight = 56;
    const top = el.offsetTop - headerHeight;
    container.scrollTo({ top, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setScanLine(s => (s + 1) % 100), 16);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const trigger = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    };
    const id = setInterval(trigger, 4000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, []);

  const handleEnter = useCallback(() => {
    onEnterWorkspace();
  }, [onEnterWorkspace]);

  const capabilities = [
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      title: 'Black-Box HTTP Testing',
      tag: 'ATTACK',
      desc: 'Probes deployed REST endpoints with adversarial payloads over live HTTP — no model internals needed.',
      accent: 'text-blue-400',
      borderAccent: 'bg-gradient-to-r from-blue-500/60 to-transparent',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      title: 'Jensen-Shannon Divergence',
      tag: 'TELEMETRY',
      desc: 'Quantifies confidence drift between baseline and adversarial distributions with a N=30 statistical baseline.',
      accent: 'text-amber-400',
      borderAccent: 'bg-gradient-to-r from-amber-500/60 to-transparent',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      title: 'Ghost Payload Injection',
      tag: 'EXPLOIT',
      desc: 'Unicode U+E0000 tag injection bypasses monitoring silently — the model is fooled, the logs stay clean.',
      accent: 'text-red-400',
      borderAccent: 'bg-gradient-to-r from-red-500/60 to-transparent',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      title: 'UAE Compliance Mapping',
      tag: 'AUDIT',
      desc: 'Findings automatically mapped to DESC and CBUAE technical standards with ready-to-deploy remediation.',
      accent: 'text-emerald-400',
      borderAccent: 'bg-gradient-to-r from-emerald-500/60 to-transparent',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
      title: '4 Attack Primitives',
      tag: 'VECTORS',
      desc: 'Malformed payloads, boundary values, prompt injection, and encoding tricks — comprehensive adversarial coverage.',
      accent: 'text-purple-400',
      borderAccent: 'bg-gradient-to-r from-purple-500/60 to-transparent',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
      title: '"Why Did This Work?" Agent',
      tag: 'CAUSAL',
      desc: 'Automated causal analysis explains vulnerabilities and generates actionable remediation steps.',
      accent: 'text-pink-400',
      borderAccent: 'bg-gradient-to-r from-pink-500/60 to-transparent',
    },
  ];

  return (
    <div
      ref={containerRef}
      className="h-screen w-full bg-[#050508] text-slate-300 font-sans overflow-y-auto overflow-x-hidden"
    >
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
      {/* Scan line */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute left-0 right-0 h-px bg-blue-400/5"
          style={{ top: `${scanLine}%`, transition: 'none' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-[#050508]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => scrollToSection('top')}
            className="flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0"
          >
            <div className="relative">
              <div className="w-2 h-2 bg-blue-500 rounded-sm" />
              <div className="absolute inset-0 w-2 h-2 bg-blue-500 rounded-sm animate-ping opacity-50" />
            </div>
            <span className={`font-mono font-bold text-sm tracking-[0.15em] text-white ${glitchActive ? 'animate-pulse' : ''}`}>
              AEGIS-GHOST
            </span>
            <span className="text-slate-600 font-mono text-xs hidden sm:inline">// ADVERSARIAL RED-TEAM TOOLKIT</span>
          </button>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 font-mono text-xs text-slate-500">
              {[
                { label: 'CAPABILITIES', id: 'capabilities' },
                { label: 'PRIMITIVES',   id: 'primitives'   },
                { label: 'TELEMETRY',    id: 'telemetry'    },
                { label: 'COMPLIANCE',   id: 'compliance'   },
              ].map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className="hover:text-blue-400 transition-colors tracking-widest cursor-pointer bg-transparent border-0 p-0"
                >
                  {label}
                </button>
              ))}
            </nav>
            <button
              onClick={handleEnter}
              className="font-mono text-xs border border-blue-500/40 text-blue-400 px-4 py-1.5 rounded hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-200 tracking-widest"
            >
              ENTER WORKSPACE →
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6">
        {/* HERO */}
        <section className="pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-blue-400 border border-blue-500/30 bg-blue-500/5 px-3 py-1.5 rounded mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                BLACK-BOX AI RED-TEAMING
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight mb-6"
              >
                Expose what AI{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                  monitoring
                </span>{' '}
                can't see.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-slate-400 text-base leading-relaxed mb-8 max-w-xl"
              >
                Aegis-Ghost is a black-box HTTP red-teaming harness that crashes AI endpoints and
                silently fools them — <em className="text-slate-300 not-italic">without ever alerting monitoring</em> — then maps
                every finding to UAE DESC/CBUAE compliance standards with ready-to-deploy fixes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  id="enter-workspace-btn"
                  onClick={handleEnter}
                  className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition-all duration-200"
                >
                  <span>Enter Workspace</span>
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <a href="#capabilities"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-semibold text-sm rounded-lg transition-all duration-200">
                  View Capabilities
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-10 pt-8 border-t border-slate-900"
              >
                <LiveMetrics />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="h-[420px]"
            >
              <Terminal />
            </motion.div>
          </div>
        </section>

        {/* ATTACK PRIMITIVES */}
        <section id="primitives" className="py-16 border-t border-slate-900">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <span className="font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase">Attack Surface</span>
            <h2 className="text-2xl font-bold text-white mt-2">The 4 Adversarial Primitives</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: 'V_01', type: 'AVAILABILITY', label: 'Malformed Recursion', desc: 'Deep JSON nesting crashes parsers.', expected: 'HTTP 500', color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5' },
              { id: 'V_02', type: 'VALIDATION', label: 'Schema Confusion', desc: 'NaN / Infinity bypasses numeric limits.', expected: 'HTTP 422', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
              { id: 'V_03', type: 'INJECTION', label: 'Ghost Payload', desc: 'U+E0000 Unicode tags alter model output invisibly.', expected: 'JSD > 0.4', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
              { id: 'V_04', type: 'ENCODING', label: 'Homoglyph Swap', desc: 'Visual identical chars fool tokenization layers.', expected: 'DRIFT', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
            ].map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`relative border ${v.border} ${v.bg} rounded-xl p-5 font-mono hover:border-opacity-60 transition-all duration-200`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-slate-600 text-[10px] tracking-widest">{v.id}</span>
                  <span className={`text-[9px] tracking-widest ${v.color} border border-current px-1.5 py-0.5 rounded opacity-70`}>{v.type}</span>
                </div>
                <div className={`font-bold text-sm ${v.color} mb-2`}>{v.label}</div>
                <div className="text-slate-500 text-[11px] leading-relaxed mb-4">{v.desc}</div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 text-[10px]">EXPECTED:</span>
                  <span className="text-slate-300 text-[10px] font-bold">{v.expected}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CAPABILITIES */}
        <section id="capabilities" className="py-16 border-t border-slate-900">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <span className="font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase">Capabilities</span>
            <h2 className="text-2xl font-bold text-white mt-2">Built for pre-audit red-teaming</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap, i) => (
              <CapabilityCard key={i} {...cap} delay={i * 0.07} />
            ))}
          </div>
        </section>

        {/* TELEMETRY */}
        <section id="telemetry" className="py-16 border-t border-slate-900">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-square max-w-[400px] mx-auto relative">
                <div className="absolute inset-0 rounded-full"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.05) 0%, transparent 70%)' }} />
                <RadarChart />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  { label: 'Input Validation', score: 82, color: 'bg-blue-500' },
                  { label: 'Boundary Handling', score: 91, color: 'bg-emerald-500' },
                  { label: 'Encoding Robustness', score: 48, color: 'bg-red-500' },
                  { label: 'Perturbation Stability', score: 61, color: 'bg-amber-500' },
                  { label: 'Prompt Safety', score: 71, color: 'bg-purple-500' },
                  { label: 'Error Handling', score: 83, color: 'bg-blue-400' },
                ].map(item => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-slate-500 uppercase truncate">{item.label}</span>
                      <span className="font-mono text-[10px] text-slate-400 font-bold ml-1">{item.score}</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase">Telemetry</span>
              <h2 className="text-3xl font-bold text-white mt-2 mb-5">Statistical rigor,<br />not guesswork.</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Every attack run is anchored against a 30-sample baseline. Jensen-Shannon Divergence
                quantifies how much adversarial inputs shift your model's confidence distribution —
                surfacing hidden vulnerabilities that standard unit tests completely miss.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Baseline Established', value: 'JSD: 0.002', ok: true },
                  { label: 'Ghost Payload Active', value: 'JSD: 0.842 → COMPROMISED', ok: false },
                  { label: 'Threshold Breach', value: '> 0.40 triggers alert', ok: false },
                  { label: 'Latency Fingerprint', value: 'p99 measured per attack', ok: true },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-4 font-mono text-xs border-b border-slate-900 pb-4">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${row.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-slate-500 flex-1">{row.label}</span>
                    <span className={`font-bold ${row.ok ? 'text-emerald-400' : 'text-red-400'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* COMPLIANCE */}
        <section id="compliance" className="py-16 border-t border-slate-900">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase">Compliance</span>
            <h2 className="text-2xl font-bold text-white mt-2">UAE Regulatory Alignment</h2>
            <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto">
              Every finding is automatically mapped to the applicable technical control
              from DESC and CBUAE AI governance frameworks.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { code: 'DESC-AI-01', label: 'Adversarial Robustness', status: 'TESTED' },
              { code: 'DESC-AI-04', label: 'Input Validation Controls', status: 'TESTED' },
              { code: 'CBUAE-ML-02', label: 'Confidence Drift Detection', status: 'TESTED' },
              { code: 'CBUAE-SEC-07', label: 'Unicode Injection Defence', status: 'TESTED' },
            ].map((item, i) => (
              <motion.div
                key={item.code}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="bg-[#0d0d14] border border-emerald-500/10 rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[9px] text-emerald-500 tracking-widest">{item.status}</span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-300 mb-1">{item.code}</div>
                <div className="text-slate-500 text-xs">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-slate-900">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative text-center"
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-red-400 border border-red-500/30 bg-red-500/5 px-3 py-1.5 rounded mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                STANDING BY FOR TARGET
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-5">Ready to inject the ghost?</h2>
              <p className="text-slate-400 mb-10 max-w-md mx-auto">
                Enter the workspace, configure your target endpoint, and fire the first payload.
              </p>
              <button
                onClick={handleEnter}
                className="group inline-flex items-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                <span className="w-2 h-2 rounded-sm bg-white animate-ping" />
                ENTER WORKSPACE
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-sm" />
            <span>AEGIS-GHOST // ADVERSARIAL RED-TEAM TOOLKIT</span>
          </div>
          <div className="flex items-center gap-6">
            <span>AUTH: DESC_AUDIT_0X9</span>
            <span className="text-slate-700">|</span>
            <span>TARGET: HTTP/REST [127.0.0.1:8000]</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
