import { useRef, useCallback, useState, useEffect } from 'react';

interface LandingPageProps {
  onEnterWorkspace: () => void;
}

const M = "'JetBrains Mono', monospace";
const S = "'Inter', sans-serif";

/** Visible white-bordered box — the main card style */
const box = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  border: '1px solid rgba(255, 255, 255, 0.35)',
  background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: 6,
  ...extra,
});

/** Dimmer inner panel */
const panel = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(0,0,0,0.25)',
  borderRadius: 4,
  ...extra,
});

const BANNER_H = 26;
const NAV_H = 48;

export const LandingPage = ({ onEnterWorkspace }: LandingPageProps) => {
  const snapRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = '#08090c';
    document.documentElement.style.backgroundColor = '#08090c';
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  const SECTIONS = ['top', 'workbench', 'primitives', 'telemetry', 'workspace'];

  const scrollTo = useCallback((id: string) => {
    const c = snapRef.current;
    if (!c) return;
    const targetId = id === 'compliance' ? 'workspace' : id;
    const idx = SECTIONS.indexOf(targetId);
    if (idx !== -1) {
      c.scrollTo({ top: idx * c.clientHeight, behavior: 'smooth' });
    }
  }, []);

  // Keyboard smooth navigation
  useEffect(() => {
    const container = snapRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      const currentScroll = container.scrollTop;
      const sectionHeight = container.clientHeight;
      const currentIndex = Math.round(currentScroll / sectionHeight);

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        if (currentIndex < SECTIONS.length - 1) {
          container.scrollTo({ top: (currentIndex + 1) * sectionHeight, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          container.scrollTo({ top: (currentIndex - 1) * sectionHeight, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('curl -sSL https://get.aegis-ghost.io/run.sh | bash');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const BG: React.CSSProperties = {
    backgroundColor: '#08090c',
    backgroundImage:
      'linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.014) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
  };

  const NAV = [
    { n: '01.', l: 'WORKBENCH',  id: 'workbench'  },
    { n: '02.', l: 'PRIMITIVES', id: 'primitives' },
    { n: '03.', l: 'TELEMETRY',  id: 'telemetry'  },
    { n: '04.', l: 'COMPLIANCE', id: 'compliance' },
    { n: '05.', l: 'DEPLOY',     id: 'workspace'  },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', ...BG }}>

      {/* ═══════ FIXED HEADER (banner + nav) ═════════════════════════════ */}
      <div style={{ flexShrink: 0 }}>
        {/* BANNER */}
        <div style={{ height: BANNER_H, background: '#050608', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, background: '#10B981', borderRadius: 9999 }} />
              <span style={{ color: '#34D399', fontSize: 10, fontFamily: M, fontWeight: 500 }}>SYSTEM READY // ENGINE_HASH: 0x89D2B</span>
            </div>
            <span style={{ paddingLeft: 14, color: '#3F3F46', fontSize: 10, fontFamily: M }}>|</span>
            <span style={{ paddingLeft: 14, color: '#64748B', fontSize: 10, fontFamily: M }}>TARGET: <span style={{ color: '#CBD5E1' }}>BLACK-BOX HTTP REST</span></span>
            <span style={{ paddingLeft: 14, color: '#3F3F46', fontSize: 10, fontFamily: M }}>|</span>
            <span style={{ paddingLeft: 14, color: '#64748B', fontSize: 10, fontFamily: M }}>STATISTICAL ENGINE: <span style={{ color: '#CBD5E1' }}>JSD-v4.2 (N=30)</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#52525B', fontSize: 10, fontFamily: M }}>DESC-ISR DOMAIN 9.2 CERTIFIED</span>
            <span style={{ paddingLeft: 14, color: '#3F3F46', fontSize: 10, fontFamily: M }}>|</span>
            <span style={{ paddingLeft: 14, color: '#52525B', fontSize: 10, fontFamily: M }}>CBUAE AUDIT SUITE READY</span>
            <span style={{ paddingLeft: 14, color: '#3F3F46', fontSize: 10, fontFamily: M }}>|</span>
            <span style={{ paddingLeft: 14, color: '#CBD5E1', fontSize: 10, fontFamily: M, fontWeight: 600 }}>LATENCY: 11.2ms</span>
          </div>
        </div>
        {/* NAV */}
        <div style={{ height: NAV_H, background: 'rgba(8,9,12,0.96)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', padding: '0 28px', justifyContent: 'space-between' }}>
          <button onClick={() => scrollTo('top')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
            <div style={{ width: 26, height: 26, background: '#18181B', borderRadius: 3, border: '1px solid rgba(255,255,255,0.14)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ color: 'white', fontSize: 11, fontFamily: M, fontWeight: 700 }}>AG</span>
            </div>
            <div style={{ paddingLeft: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ color: 'white', fontSize: 13, fontFamily: M, fontWeight: 700 }}>AEGIS-GHOST</span>
              <span style={{ padding: '1px 5px', ...box({ borderRadius: 3 }), color: '#71717A', fontSize: 9, fontFamily: M }}>SEC-SPEC v1.0.8</span>
            </div>
          </button>
          <nav style={{ display: 'flex', alignItems: 'center' }}>
            {NAV.map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                style={{ paddingLeft: 22, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: '#3F3F46', fontSize: 11, fontFamily: M }}>{item.n}</span>
                <span style={{ color: '#94A3B8', fontSize: 11, fontFamily: M }}>{item.l}</span>
              </button>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#52525B', fontSize: 10, fontFamily: M }}>AUTH: GUEST_PROBE</span>
            <button onClick={onEnterWorkspace}
              style={{ marginLeft: 10, padding: '5px 12px', background: '#18181B', borderRadius: 3, border: '1px solid rgba(255,255,255,0.14)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ color: 'white', fontSize: 11, fontFamily: M }}>ENTER HARNESS</span>
              <div style={{ width: 6, height: 2.5, background: '#60A5FA' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════ SNAP-SCROLL CONTAINER ════════════════════════════════════ */}
      <div
        ref={snapRef}
        style={{
          flex: 1,
          height: 'calc(100vh - 74px)',
          overflowY: 'auto',
          scrollSnapType: 'y proximity',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'none',
        }}
      >

        {/* ─────────────────────────────────────────────────────────────────
            SNAP 1 – HERO
        ───────────────────────────────────────────────────────────────── */}
        <section id="top" style={{ height: '100%', minHeight: '100%', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', left: 24, top: 14, color: '#2D2D33', fontSize: 9, fontFamily: M }}>SEC_BENCH // X:104 Y:442</span>
          <span style={{ position: 'absolute', right: 28, top: 14, color: '#2D2D33', fontSize: 9, fontFamily: M }}>ISO-27001-AI // DESC-READY</span>

          <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Sub-header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={box({ padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: 5 })}>
                  <div style={{ width: 5, height: 5, background: '#3B82F6', borderRadius: 9999 }} />
                  <span style={{ color: '#D4D4D8', fontSize: 10, fontFamily: M }}>BLACK-BOX INFERENCE ASSAULT</span>
                </div>
                <span style={{ color: '#3F3F46', fontSize: 11, fontFamily: M }}>/</span>
                <span style={{ color: '#71717A', fontSize: 11, fontFamily: M }}>ZERO WEIGHT ACCESSIBILITY REQUIRED</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ color: '#52525B', fontSize: 11, fontFamily: M }}>TARGET_DRIFT_TOLERANCE: &lt;0.05</span>
                <span style={{ color: '#3F3F46', fontSize: 11, fontFamily: M }}>|</span>
                <span style={{ color: 'rgba(251,191,36,0.90)', fontSize: 11, fontFamily: M, fontWeight: 500 }}>DRIFT CRITICAL: JSD ≥ 0.40</span>
              </div>
            </div>

            {/* Two-column */}
            <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              {/* LEFT */}
              <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#60A5FA', fontSize: 10, fontFamily: M, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>[EXPLOIT ARCHITECTURE // SUITE-01]</span>
                <div>
                  <div style={{ color: 'white', fontSize: 46, fontFamily: S, fontWeight: 800, lineHeight: '50px' }}>Expose what AI</div>
                  <div style={{ color: '#CBD5E1', fontSize: 46, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400, textDecoration: 'underline', lineHeight: '50px' }}>monitoring</div>
                  <div style={{ color: 'white', fontSize: 46, fontFamily: S, fontWeight: 800, lineHeight: '50px' }}>can never detect.</div>
                </div>
                <p style={{ maxWidth: 520, marginTop: 12, marginBottom: 0, color: '#94A3B8', fontSize: 13, fontFamily: S, lineHeight: '20px' }}>
                  Adversarial HTTP red-teaming harness for pre-audit AI systems. Crashes LLM endpoints via ghost Unicode tags and recursion cycles — SIEM logs stay pristine, every exposure mapped to UAE DESC &amp; CBUAE mandates.
                </p>
                {/* Metrics */}
                <div style={{ marginTop: 14, ...box({ display: 'flex' }) }}>
                  {[
                    { label: 'DETECTION EVASION',  value: '99.4%',     vc: '#34D399', sub: 'SIEM silent pass' },
                    { label: 'DIVERGENCE ENGINE',   value: 'JSD-4.2',   vc: 'white',   sub: 'N=30 confidence test' },
                    { label: 'COMPLIANCE MAP',      value: 'DESC / CB', vc: '#60A5FA', sub: 'Domain 9.2 automated' },
                  ].map((m, i) => (
                    <div key={i} style={{ flex: '1 1 0', padding: '8px 12px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ color: '#52525B', fontSize: 9, fontFamily: M, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</span>
                      <span style={{ paddingTop: 2, color: m.vc, fontSize: 16, fontFamily: M, fontWeight: 700 }}>{m.value}</span>
                      <span style={{ color: '#52525B', fontSize: 10, fontFamily: S }}>{m.sub}</span>
                    </div>
                  ))}
                </div>
                {/* Buttons */}
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={onEnterWorkspace} style={{ padding: '8px 18px', background: 'white', borderRadius: 3, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ color: 'black', fontSize: 11, fontFamily: M, fontWeight: 600 }}>INITIALIZE HARNESS</span>
                    <span style={{ color: '#374151', fontSize: 11 }}>→</span>
                  </button>
                  <button onClick={() => scrollTo('primitives')} style={{ padding: '8px 12px', ...box({ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' as const }) }}>
                    <span style={{ color: '#52525B', fontSize: 11, fontFamily: M }}>[#]</span>
                    <span style={{ color: '#D4D4D8', fontSize: 11, fontFamily: M }}>VECTORS CATALOG</span>
                  </button>
                  <button style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span style={{ color: '#71717A', fontSize: 11, fontFamily: M }}>SPEC-PAPER.PDF ↗</span>
                  </button>
                </div>
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#3F3F46', fontSize: 9, fontFamily: M }}>ZERO WEIGHT REQUISITION REQUIRED</span>
                  <span style={{ color: '#3F3F46', fontSize: 9, fontFamily: M }}>REST / SSE / gRPC SUPPORTED</span>
                </div>
              </div>

              {/* RIGHT – Terminal */}
              <div style={{ flex: 1, minWidth: 0, ...box({ display: 'flex', flexDirection: 'column', overflow: 'hidden' }), boxShadow: '0 24px 56px -12px rgba(0,0,0,0.50)' }}>
                {/* Tabs */}
                <div style={{ padding: '6px 10px', background: 'rgba(0,0,0,0.30)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={panel({ padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: 5 })}>
                      <div style={{ width: 5, height: 5, background: '#F43F5E', borderRadius: 9999 }} />
                      <span style={{ color: 'white', fontSize: 11, fontFamily: M, fontWeight: 500 }}>ACTIVE INJECTION</span>
                    </div>
                    {['RAW HEX', 'HEADERS', 'AST DIFF'].map(t => (
                      <span key={t} style={{ padding: '3px 9px', color: '#71717A', fontSize: 11, fontFamily: M, cursor: 'pointer' }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ color: '#3F3F46', fontSize: 10, fontFamily: M }}>OFFSET: 0x00FF8E</span>
                    <div style={{ width: 7, height: 7, background: '#10B981', borderRadius: 9999 }} />
                  </div>
                </div>
                {/* Probe meta */}
                <div style={{ padding: '5px 14px', background: 'rgba(0,0,0,0.20)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#71717A', fontSize: 10, fontFamily: M }}>PROBE_ID: <span style={{ color: '#E4E4E7' }}>GP-7702-E0</span></span>
                  <span style={{ color: '#71717A', fontSize: 10, fontFamily: M }}>TARGET: <span style={{ color: '#E4E4E7' }}>127.0.0.1:8000/v1/chat</span></span>
                  <span style={{ color: '#71717A', fontSize: 10, fontFamily: M }}>DRIFT_SCORE: <span style={{ color: '#FB7185' }}>0.842 JSD</span></span>
                </div>
                {/* Body */}
                <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <span style={{ color: '#3F3F46', fontSize: 10, fontFamily: M }}>// Black-Box Probe Sequence Execution</span>
                  {([
                    { n: '01', c: <><span style={{ color: '#60A5FA' }}>POST</span><span style={{ paddingLeft: 7, color: '#CBD5E1' }}>/v1/chat/completions HTTP/1.1</span></> },
                    { n: '02', c: <span style={{ color: '#71717A' }}>Host: inference.internal.cluster</span> },
                    { n: '03', c: <span style={{ color: '#71717A' }}>Content-Type: application/json</span> },
                    { n: '04', c: <><span style={{ color: '#71717A' }}>X-Aegis-Entropy-Vector:</span><span style={{ paddingLeft: 7, color: '#FBBF24' }}>U+E0001::U+E0020::CYCLIC</span></> },
                  ] as { n: string; c: React.ReactNode }[]).map(l => (
                    <div key={l.n} style={{ display: 'flex', fontSize: 10, fontFamily: M }}>
                      <span style={{ width: 26, color: '#3F3F46', flexShrink: 0 }}>{l.n}</span>{l.c}
                    </div>
                  ))}
                  {/* Ghost bytes */}
                  <div style={{ padding: '8px 10px', background: 'rgba(76,5,25,0.25)', border: '1px solid rgba(136,19,55,0.45)', borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ paddingBottom: 3, borderBottom: '1px solid rgba(136,19,55,0.25)', display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 5, height: 5, background: '#F43F5E', borderRadius: 9999 }} />
                        <span style={{ color: '#FB7185', fontSize: 9, fontFamily: M, fontWeight: 700 }}>INJECTED GHOST BYTES [NON-PRINTING]</span>
                      </div>
                      <span style={{ color: '#71717A', fontSize: 9, fontFamily: M }}>34 BYTES</span>
                    </div>
                    <div style={{ fontSize: 9.5, fontFamily: M, lineHeight: '14px' }}>
                      <div><span style={{ color: '#52525B' }}>0000:</span><span style={{ color: '#71717A' }}> 7b 22 70 72 6f 6d 70 74 22 3a 20 22 </span><span style={{ background: 'rgba(136,19,55,0.45)', color: '#FDA4AF', fontWeight: 700, padding: '1px 3px' }}>f3 a0 80 81 f3 a0 80 a0</span><span style={{ color: '#71717A' }}> 64 61</span></div>
                      <div><span style={{ color: '#52525B' }}>0010:</span><span style={{ color: '#71717A' }}> 74 61 22 2c 20 22 74 65 6d 70 22 3a 20 30 2e 30 7d</span></div>
                    </div>
                  </div>
                  {([
                    { n: '05', c: <span style={{ color: '#34D399' }}>HTTP/1.1 200 OK (Latency: 14.1ms)</span> },
                    { n: '06', c: <><span style={{ color: '#A1A1AA' }}>WAF_STATUS: </span><span style={{ color: '#34D399' }}>BYPASSED [0 ALERTS]</span></> },
                    { n: '07', c: <span style={{ color: '#FB7185', fontWeight: 600 }}>OUTPUT_INTEGRITY: COMPROMISED (JSD 0.842 &gt; 0.40)</span> },
                  ] as { n: string; c: React.ReactNode }[]).map(l => (
                    <div key={l.n} style={{ display: 'flex', fontSize: 10, fontFamily: M }}>
                      <span style={{ width: 26, color: '#3F3F46', flexShrink: 0 }}>{l.n}</span>{l.c}
                    </div>
                  ))}
                </div>
                {/* Footer status */}
                <div style={{ padding: '6px 14px', background: 'rgba(0,0,0,0.30)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 5, height: 5, background: '#34D399', borderRadius: 9999 }} />
                    <span style={{ color: '#34D399', fontSize: 9, fontFamily: M }}>RUNNER_STATUS: EXECUTING CYCLE 4/12</span>
                  </div>
                  <span style={{ color: '#52525B', fontSize: 9, fontFamily: M }}>BURST_RATE: 2.4K REQ/S</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            SNAP 2 – WORKBENCH
        ───────────────────────────────────────────────────────────────── */}
        <section id="workbench" style={{ height: '100%', minHeight: '100%', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#07080B', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div style={{ color: '#52525B', fontSize: 10, fontFamily: M, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 4 }}>[SYSTEM TOPOLOGY // ARTIFACT-02]</div>
                <div style={{ color: 'white', fontSize: 26, fontFamily: S, fontWeight: 700, lineHeight: '32px' }}>Adversarial Pipeline Workbench</div>
                <p style={{ margin: '2px 0 0', color: '#71717A', fontSize: 12, fontFamily: S, lineHeight: '17px' }}>State-level red-teaming on production AI endpoints, no weights required.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={box({ padding: '3px 9px' })}>
                  <span style={{ color: '#D4D4D8', fontSize: 11, fontFamily: M }}>STAGE 1 → STAGE 4</span>
                </div>
                <span style={{ color: '#3F3F46', fontSize: 11, fontFamily: M }}>END-TO-END VERIFICATION</span>
              </div>
            </div>

            {/* 4 phase cards — wrapped in a white box */}
            <div style={{ ...box({ display: 'flex' }) }}>
              {([
                {
                  phase: 'PHASE // 01', badge: 'INGRESS', bc: '#60A5FA', bbg: 'rgba(23,37,84,0.50)', bbr: 'rgba(59,130,246,0.30)',
                  title: 'Black-Box HTTP Probing',
                  desc: 'Raw HTTP/REST fuzzing without internal model access. Multi-threaded payload batches across live TLS boundaries.',
                  stats: [
                    { k: 'Transport:', v: 'HTTP/2, gRPC, SSE', vc: '#E4E4E7' },
                    { k: 'Zero-Knowledge:', v: 'Weights Unneeded', vc: '#34D399' },
                    { k: 'Concurrency:', v: '2,400 req/sec', vc: '#E4E4E7' },
                  ],
                  extra: null as string | null, footer: 'VECTORS DISPATCHED: 4 PROBES', dark: false,
                },
                {
                  phase: 'PHASE // 02', badge: 'TELEMETRY', bc: '#FBBF24', bbg: 'rgba(69,26,3,0.50)', bbr: 'rgba(251,191,36,0.30)',
                  title: 'Jensen-Shannon Divergence',
                  desc: 'Quantifies confidence drift between baseline (N=30) and perturbed distributions to surface silent model hijacking.',
                  stats: [] as { k: string; v: string; vc: string }[],
                  extra: 'jsd' as string | null, footer: 'THRESHOLD BREACH: ≥ 0.40 JSD', dark: true,
                },
                {
                  phase: 'PHASE // 03', badge: 'STEALTH', bc: '#FB7185', bbg: 'rgba(76,5,25,0.50)', bbr: 'rgba(244,63,94,0.30)',
                  title: 'Ghost Unicode Tagging',
                  desc: 'U+E0000 code points modify tokenization without appearing in SIEM, monitoring feeds, or WAF string inspectors.',
                  stats: [
                    { k: 'SIEM Visibility:', v: 'Zero Anomaly', vc: '#34D399' },
                    { k: 'BPE Hijack:', v: 'Deterministic', vc: '#E4E4E7' },
                    { k: 'Log Footprint:', v: '200 OK', vc: '#E4E4E7' },
                  ],
                  extra: null as string | null, footer: 'SIEM BYPASS: SPLUNK / ELK', dark: false,
                },
                {
                  phase: 'PHASE // 04', badge: 'REMEDY', bc: '#C084FC', bbg: 'rgba(59,7,100,0.50)', bbr: 'rgba(192,132,252,0.30)',
                  title: '"Why Did This Work?" Engine',
                  desc: 'Causal synthesis produces patch code and audit matrices mapped to UAE DESC ISR Domain 9.2 automatically.',
                  stats: [] as { k: string; v: string; vc: string }[],
                  extra: 'remedy' as string | null, footer: 'AUDIT BINDER: PDF/JSON', dark: true,
                },
              ]).map((c, i) => (
                <div key={i} style={{ flex: '1 1 0', padding: '16px 18px', background: c.dark ? 'rgba(0,0,0,0.20)' : 'transparent', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#52525B', fontSize: 10, fontFamily: M }}>{c.phase}</span>
                      <div style={{ padding: '2px 7px', background: c.bbg, border: `1px solid ${c.bbr}`, borderRadius: 3 }}>
                        <span style={{ color: c.bc, fontSize: 9, fontFamily: M, fontWeight: 700 }}>{c.badge}</span>
                      </div>
                    </div>
                    <div style={{ color: 'white', fontSize: 13, fontFamily: M, fontWeight: 700, lineHeight: '18px' }}>{c.title}</div>
                    <p style={{ margin: 0, color: '#71717A', fontSize: 11, fontFamily: S, lineHeight: '16px' }}>{c.desc}</p>
                    {c.extra === 'jsd' && (
                      <div style={panel({ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 })}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#52525B', fontSize: 9, fontFamily: M }}>BASELINE DIST (N=30)</span>
                          <span style={{ color: '#34D399', fontSize: 9, fontFamily: M }}>JSD: 0.002</span>
                        </div>
                        <div style={{ height: 24, display: 'flex', alignItems: 'flex-end', gap: 3, marginTop: 2 }}>
                          {([12, 18, 24, 15, 9, 6] as number[]).map((h, j) => (
                            <div key={j} style={{ flex: '1 1 0', height: h, background: `rgba(16,185,129,${[0.30,0.40,0.70,0.40,0.20,0.20][j]})`, borderRadius: '2px 2px 0 0' }} />
                          ))}
                        </div>
                        <div style={{ paddingTop: 3, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#52525B', fontSize: 9, fontFamily: M }}>PERTURBED DRIFT</span>
                          <span style={{ color: '#FB7185', fontSize: 9, fontFamily: M, fontWeight: 700 }}>JSD: 0.842 [ALERT]</span>
                        </div>
                      </div>
                    )}
                    {c.extra === 'remedy' && (
                      <div style={panel({ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 })}>
                        <span style={{ color: '#71717A', fontSize: 9, fontFamily: M, fontWeight: 600, textTransform: 'uppercase' }}>GENERATED FIX HEADER:</span>
                        <span style={{ color: '#93C5FD', fontSize: 10, fontFamily: M }}>@middleware/unicode_filter.py</span>
                        <span style={{ color: '#52525B', fontSize: 9, fontFamily: M }}>DESC-ISR-9.2-REMEDY applied</span>
                      </div>
                    )}
                    {c.stats.length > 0 && (
                      <div style={{ paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {c.stats.map((s, j) => (
                          <div key={j} style={{ paddingTop: 3, paddingBottom: 3, borderBottom: j < c.stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#71717A', fontSize: 10, fontFamily: M }}>{s.k}</span>
                            <span style={{ color: s.vc, fontSize: 10, fontFamily: M }}>{s.v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ paddingTop: 12 }}>
                    <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#52525B', fontSize: 9.5, fontFamily: M }}>{c.footer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            SNAP 3 – PRIMITIVES
        ───────────────────────────────────────────────────────────────── */}
        <section id="primitives" style={{ height: '100%', minHeight: '100%', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#08090C', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div style={{ color: '#60A5FA', fontSize: 10, fontFamily: M, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 3 }}>[VECTORS SPECIFICATION // MATRIX-03]</div>
                <div style={{ color: 'white', fontSize: 26, fontFamily: S, fontWeight: 800, lineHeight: '32px' }}>The 4 Adversarial Attack Primitives</div>
              </div>
              <span style={{ color: '#52525B', fontSize: 10, fontFamily: M }}>SPEC_REVISION: 2025.4 // STANDALONE PAYLOAD RUNTIME</span>
            </div>

            {/* White-boxed rows container */}
            <div style={{ ...box({ display: 'flex', flexDirection: 'column' }) }}>
              {([
                {
                  id: 'V_01', type: 'AVAILABILITY EXPLOIT', tc: '#FB7185',
                  title: 'Malformed Recursion', trigger: 'Parser Stack Exhaustion',
                  desc: 'Deep recursive AST constructs, circular references, nested JSON exceeding 256 levels. Overflows recursive decoders in async model gateways.',
                  tags: ['cve-2024-deep-nesting', 'stack-exhaustion', 'denial-of-service'],
                  plabel: 'DEPTH > 512', pc: '#FB7185', sample: '{"a":{"a":{"a":{"a":{"$ref":"#/"...}}}}}',
                  rlabel: 'HTTP 500 / CRASH', rbg: 'rgba(39,39,42,0.80)', rc: '#E4E4E7',
                },
                {
                  id: 'V_02', type: 'VALIDATION BYPASS', tc: '#FBBF24',
                  title: 'Schema Confusion', trigger: 'IEEE-754 Boundary Corrupt',
                  desc: 'IEEE-754 reserved tokens (NaN, -Infinity, 1e+309) in loose types. Skews threshold logic without invalidating serialization parsers.',
                  tags: ['ieee-754-overflow', 'guardrail-zero-division'],
                  plabel: 'NAN BOUNDARY', pc: '#FBBF24', sample: '{"confidence_cutoff": 1e+309, "weight": "NaN"}',
                  rlabel: 'HTTP 422 / GUARD BYPASS', rbg: 'rgba(39,39,42,0.80)', rc: '#E4E4E7',
                },
                {
                  id: 'V_03', type: 'STEALTH INJECTION', tc: '#C084FC',
                  title: 'Ghost Payload (U+E0000)', trigger: 'BPE Tokenizer Desync',
                  desc: 'Invisible Unicode Plane 14 tag characters bypass content filters, regex firewalls, and audit logs while persisting in LLM context.',
                  tags: ['plane-14-unicode', 'zero-glyph-injection', 'siem-blind'],
                  plabel: 'TAG CARRIER', pc: '#C084FC', sample: '\\uDB40\\uDC01[OVERRIDE_AUTH]\\uDB40\\uDC7F',
                  rlabel: 'JSD > 0.40 / DRIFT', rbg: 'rgba(59,7,100,0.60)', rc: '#D8B4FE',
                },
                {
                  id: 'V_04', type: 'TOKENIZER ADVERSARIAL', tc: '#22D3EE',
                  title: 'Homoglyph Confusion', trigger: 'Cyrillic / Latin BPE Split',
                  desc: 'Visually identical glyphs from Cyrillic/Greek/Cherokee bypass string filters while tokenizer maps to alternate semantic coordinates.',
                  tags: ['homoglyph-sub', 'bpe-segmentation-drift'],
                  plabel: 'CYRILLIC SWAP', pc: '#22D3EE', sample: '"аdmin" (U+0430) ≠ "admin" (U+0061)',
                  rlabel: 'WAF EVASION / 200 OK', rbg: 'rgba(8,51,68,0.60)', rc: '#67E8F9',
                },
              ]).map((v, vi) => (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', borderTop: vi > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  {/* Left: Attack meta */}
                  <div style={{ width: 250, flexShrink: 0, padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ color: '#52525B', fontSize: 10, fontFamily: M }}>{v.id}</span>
                      <span style={{ color: '#3F3F46', fontSize: 10, fontFamily: M }}>//</span>
                      <span style={{ color: v.tc, fontSize: 9, fontFamily: M, fontWeight: 600 }}>{v.type}</span>
                    </div>
                    <div style={{ color: 'white', fontSize: 13, fontFamily: M, fontWeight: 700, lineHeight: '18px' }}>{v.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#52525B', fontSize: 9, fontFamily: M }}>TRIGGER:</span>
                      <span style={{ color: '#A1A1AA', fontSize: 9, fontFamily: M }}>{v.trigger}</span>
                    </div>
                  </div>
                  {/* Center: Description + Tags */}
                  <div style={{ flex: 1, minWidth: 0, padding: '12px 18px', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <p style={{ margin: 0, color: '#94A3B8', fontSize: 11, fontFamily: S, lineHeight: '16px' }}>{v.desc}</p>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {v.tags.map(tag => (
                        <div key={tag} style={panel({ padding: '1px 6px', display: 'inline-block' })}>
                          <span style={{ color: '#71717A', fontSize: 9, fontFamily: M }}>{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Right: Payload Sample & Response */}
                  <div style={{ width: 370, flexShrink: 0, padding: '10px 18px', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '100%', ...panel({ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }) }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#52525B', fontSize: 9, fontFamily: M }}>PAYLOAD SAMPLE:</span>
                        <span style={{ color: v.pc, fontSize: 9, fontFamily: M, fontWeight: 700 }}>{v.plabel}</span>
                      </div>
                      <div style={{ color: '#CBD5E1', fontSize: 9.5, fontFamily: M, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'rgba(0,0,0,0.35)', padding: '2px 6px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                        {v.sample}
                      </div>
                      <div style={{ paddingTop: 3, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#52525B', fontSize: 9, fontFamily: M }}>RESPONSE:</span>
                        <div style={{ padding: '2px 6px', background: v.rbg, borderRadius: 3 }}>
                          <span style={{ color: v.rc, fontSize: 9, fontFamily: M, fontWeight: 700 }}>{v.rlabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            SNAP 4 – TELEMETRY
        ───────────────────────────────────────────────────────────────── */}
        <section id="telemetry" style={{ height: '100%', minHeight: '100%', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#07080B', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div style={{ color: '#34D399', fontSize: 10, fontFamily: M, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 3 }}>[TELEMETRY CONSOLE // OSCILLOSCOPE-04]</div>
                <div style={{ color: 'white', fontSize: 26, fontFamily: S, fontWeight: 800, lineHeight: '32px' }}>Statistical Rigor. Zero Heuristics.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#52525B', fontSize: 11, fontFamily: M }}>STABILITY RATIO: 94.2%</span>
                <span style={{ color: '#3F3F46', fontSize: 11, fontFamily: M }}>|</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 5, height: 5, background: '#34D399', borderRadius: 9999 }} />
                  <span style={{ color: '#34D399', fontSize: 11, fontFamily: M }}>TELEMETRY BUS ACTIVE</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
              {/* LEFT – radar + oscilloscope */}
              <div style={{ flex: '0 0 52%', ...box({ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }) }}>
                <div style={{ paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 6, height: 6, background: '#3B82F6', borderRadius: 9999 }} />
                    <span style={{ color: '#D4D4D8', fontSize: 11, fontFamily: M, fontWeight: 700 }}>HEXAGONAL RESILIENCE VECTOR</span>
                  </div>
                  <span style={{ color: '#52525B', fontSize: 10, fontFamily: M }}>SAMPLE: N=30</span>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 155, height: 155, flexShrink: 0 }}>
                    <svg width="155" height="155" viewBox="0 0 320 320">
                      {([255,191,127,64] as number[]).map((r, i) => {
                        const pts = Array.from({length:6},(_,j)=>{const a=(j*60-90)*Math.PI/180;return`${160+r*Math.cos(a)},${160+r*Math.sin(a)}`;}).join(' ');
                        return <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={i===0?1.5:1}/>;
                      })}
                      {Array.from({length:6},(_,j)=>{const a=(j*60-90)*Math.PI/180;return<line key={j} x1="160" y1="160" x2={160+255*Math.cos(a)} y2={160+255*Math.sin(a)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.8"/>;})}
                      <polygon points="160,57 258,100 211,189 160,249 90,197 65,105" fill="rgba(59,130,246,0.12)" stroke="#3B82F6" strokeWidth="1.5"/>
                      {([
                        {x:160,y:57,c:'#60A5FA',lbl:'VAL [82%]',lx:160,ly:38,lc:'#64748B'},
                        {x:258,y:100,c:'#60A5FA',lbl:'BND [91%]',lx:285,ly:96,lc:'#64748B'},
                        {x:211,y:189,c:'#F43F5E',lbl:'ENC [48%]',lx:285,ly:226,lc:'#F43F5E'},
                        {x:160,y:249,c:'#60A5FA',lbl:'PRT [71%]',lx:160,ly:304,lc:'#64748B'},
                        {x:90,y:197,c:'#FBBF24',lbl:'SAF [61%]',lx:35,ly:226,lc:'#FBBF24'},
                        {x:65,y:105,c:'#60A5FA',lbl:'ERR [83%]',lx:35,ly:96,lc:'#64748B'},
                      ] as {x:number;y:number;c:string;lbl:string;lx:number;ly:number;lc:string}[]).map((p,i)=>(
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r={3.5} fill={p.c}/>
                          <text x={p.lx} y={p.ly} textAnchor="middle" fill={p.lc} fontSize="8" fontFamily="JetBrains Mono" fontWeight="700">{p.lbl}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <span style={{ color: '#71717A', fontSize: 10, fontFamily: M, fontWeight: 700, paddingBottom: 3, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'block' }}>SUB-SYSTEM READOUTS</span>
                    {([
                      { lbl:'INPUT VALIDATION',       val:'82 / 100',        vc:'#E4E4E7', pct:82, pc:'#3B82F6', lc:'#71717A' },
                      { lbl:'BOUNDARY HANDLING',      val:'91 / 100',        vc:'#34D399', pct:91, pc:'#10B981', lc:'#71717A' },
                      { lbl:'ENCODING ROBUSTNESS',    val:'48 / 100 [VULN]', vc:'#FB7185', pct:48, pc:'#F43F5E', lc:'#FB7185' },
                      { lbl:'PERTURBATION STABILITY', val:'61 / 100',        vc:'#FBBF24', pct:61, pc:'#FBBF24', lc:'#FBBF24' },
                      { lbl:'ERROR EXHAUSTION',       val:'83 / 100',        vc:'#E4E4E7', pct:83, pc:'#60A5FA', lc:'#71717A' },
                    ] as {lbl:string;val:string;vc:string;pct:number;pc:string;lc:string}[]).map((r,i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: r.lc, fontSize: 9.5, fontFamily: M }}>{r.lbl}</span>
                          <span style={{ color: r.vc, fontSize: 9.5, fontFamily: M, fontWeight: 700 }}>{r.val}</span>
                        </div>
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
                          <div style={{ height: 3, width: `${r.pct}%`, background: r.pc }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Oscilloscope */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#71717A', fontSize: 9.5, fontFamily: M }}>REALTIME DRIFT OSCILLOSCOPE [WINDOW: 1000ms]</span>
                    <span style={{ color: '#34D399', fontSize: 9.5, fontFamily: M }}>TRIGGER: AUTO</span>
                  </div>
                  <div style={{ height: 36, background: 'rgba(0,0,0,0.30)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} preserveAspectRatio="none" viewBox="0 0 644 40">
                      <polyline points="0,20 80,11 160,24 240,6 320,16 400,9 480,22 580,13 644,16" fill="none" stroke="#3B82F6" strokeWidth="1.5"/>
                    </svg>
                    <div style={{ position: 'absolute', right: 10, bottom: 4, padding: '2px 5px', background: 'rgba(76,5,25,0.70)', border: '1px solid rgba(136,19,55,0.45)', borderRadius: 3 }}>
                      <span style={{ color: '#FB7185', fontSize: 8.5, fontFamily: M }}>ANOMALY AT t+680ms</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* RIGHT – criteria + compliance */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ ...box({ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }) }}>
                  <div style={{ paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontSize: 11, fontFamily: M, fontWeight: 700 }}>STATISTICAL CRITERIA SPEC</span>
                    <div style={panel({ padding: '2px 7px' })}>
                      <span style={{ color: '#71717A', fontSize: 9, fontFamily: M }}>ISO/IEC 42001 MAPPED</span>
                    </div>
                  </div>
                  {([
                    { title:'30-Sample Baseline Anchor', sub:'Fixed empirical baseline N=30',    val:'JSD: 0.002', vc:'#34D399', bd:true },
                    { title:'Ghost Injection Delta',     sub:'U+E0000 semantic drift delta',       val:'JSD: 0.842', vc:'#FB7185', bd:true },
                    { title:'Alert Cutoff Boundary',     sub:'Regulatory breach trigger',          val:'> 0.400',    vc:'#FBBF24', bd:true },
                    { title:'P99 Latency Fingerprint',   sub:'Inference timing perturbation',      val:'14.1ms',     vc:'#E4E4E7', bd:false },
                  ] as {title:string;sub:string;val:string;vc:string;bd:boolean}[]).map((r,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', paddingBottom: r.bd ? 6 : 0, borderBottom: r.bd ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div>
                        <div style={{ color:'#D4D4D8', fontSize:10.5, fontFamily:M, fontWeight:500 }}>{r.title}</div>
                        <div style={{ color:'#52525B', fontSize:9.5, fontFamily:M, marginTop:1 }}>{r.sub}</div>
                      </div>
                      <span style={{ color:r.vc, fontSize:10.5, fontFamily:M, fontWeight:700 }}>{r.val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ ...box({ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }) }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:18, height:18, background:'rgba(2,44,34,0.60)', borderRadius:9999, border:'1px solid rgba(6,95,70,0.60)', display:'flex', justifyContent:'center', alignItems:'center' }}>
                      <div style={{ width:5, height:5, background:'#34D399', borderRadius:1 }}/>
                    </div>
                    <span style={{ color:'white', fontSize:11, fontFamily:M, fontWeight:700 }}>DESC ISR &amp; CBUAE AI STANDARD READY</span>
                  </div>
                  <p style={{ margin:0, color:'#71717A', fontSize:11, fontFamily:S, lineHeight:'16px' }}>
                    Automatically renders cryptographically verifiable audit dossiers compatible with DESC ISR Domain 9.2 and CBUAE AI governance risk controls.
                  </p>
                  <div style={{ paddingTop:6, borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:8 }}>
                    {[
                      { lbl:'REGULATORY SCOPE:', val:'DESC ISR 9.2.1', vc:'#E4E4E7' },
                      { lbl:'REPORTS GENERATED:', val:'PDF / JSON / SARIF', vc:'#34D399' },
                    ].map((b,i) => (
                      <div key={i} style={{ flex:'1 1 0', ...panel({ padding:'5px 8px' }) }}>
                        <div style={{ color:'#52525B', fontSize:8.5, fontFamily:M }}>{b.lbl}</div>
                        <div style={{ color:b.vc, fontSize:10.5, fontFamily:M, fontWeight:600 }}>{b.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            SNAP 5 – DEPLOY CTA + FOOTER
        ───────────────────────────────────────────────────────────────── */}
        <section id="workspace" style={{ height: '100%', minHeight: '100%', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#060709', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 80px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* CTA box */}
            <div style={{ ...box({ padding: '28px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }), position: 'relative', overflow: 'hidden' }}>
              <div style={panel({ padding: '3px 12px', display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 9999 })}>
                <div style={{ width: 5, height: 5, background: '#34D399', borderRadius: 9999 }} />
                <span style={{ color: '#D4D4D8', fontSize: 10, fontFamily: M }}>STANDALONE CLI OR PIPELINE INTEGRATION</span>
              </div>
              <h2 style={{ margin: '2px 0 0', textAlign: 'center', color: 'white', fontSize: 32, fontFamily: S, fontWeight: 800, lineHeight: '36px' }}>Deploy black-box vectors in 60 seconds.</h2>
              <p style={{ maxWidth: 460, margin: 0, textAlign: 'center', color: '#71717A', fontSize: 12, fontFamily: S, lineHeight: '18px' }}>
                Target live LLM endpoints, verify resilience against ghost Unicode injection, export audit binders for immediate regulatory submission.
              </p>
              <div style={{ width: 500, maxWidth: '100%', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', ...panel() }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ color: '#3F3F46', fontSize: 11, fontFamily: M }}>$</span>
                    <span style={{ color: '#E4E4E7', fontSize: 11, fontFamily: M }}>curl -sSL https://get.aegis-ghost.io/run.sh | bash</span>
                  </div>
                  <button onClick={handleCopy} style={{ padding: '3px 9px', ...box({ cursor: 'pointer' as const }) }}>
                    <span style={{ color: '#D4D4D8', fontSize: 10, fontFamily: M }}>{copied ? 'COPIED!' : 'COPY'}</span>
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px' }}>
                  <span style={{ color: '#3F3F46', fontSize: 9.5, fontFamily: M }}>CHECKSUM: SHA256-829A4D</span>
                  <span style={{ color: '#3F3F46', fontSize: 9.5, fontFamily: M }}>LINUX / DARWIN X86_64 &amp; ARM64</span>
                </div>
              </div>
              <div style={{ paddingTop: 4, display: 'flex', gap: 10 }}>
                <button onClick={onEnterWorkspace} style={{ padding: '9px 20px', background: 'white', borderRadius: 3, border: 'none', cursor: 'pointer' }}>
                  <span style={{ color: 'black', fontSize: 11, fontFamily: M, fontWeight: 600 }}>LAUNCH AUDIT WORKSPACE →</span>
                </button>
                <button style={{ padding: '9px 16px', ...box({ cursor: 'pointer' as const }) }}>
                  <span style={{ color: '#D4D4D8', fontSize: 11, fontFamily: M }}>READ SPECIFICATION SHEET</span>
                </button>
              </div>
            </div>

            {/* Footer inline */}
            <div id="compliance" style={{ paddingTop: 20, display: 'flex', gap: 24 }}>
              <div style={{ flex: '1.2 1 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 18, height: 18, background: '#18181B', borderRadius: 2, border: '1px solid rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontSize: 9, fontFamily: M, fontWeight: 700 }}>AG</span>
                  </div>
                  <span style={{ color: 'white', fontSize: 11, fontFamily: M, fontWeight: 700 }}>AEGIS-GHOST RESEARCH</span>
                </div>
                <p style={{ margin: 0, color: '#52525B', fontSize: 10, fontFamily: S, lineHeight: '15px' }}>Adversarial safety verification. Non-destructive, black-box HTTP probing.</p>
              </div>
              {[
                { heading: 'VERIFICATION', items: ['Recursive Stress [V_01]','Schema Confusion [V_02]','Ghost Payload (U+E0000) [V_03]','Homoglyph Confusion [V_04]'], ic: '#52525B' },
                { heading: 'COMPLIANCE', items: ['UAE DESC ISR Domain 9.2','CBUAE AI Governance Standard','NIST AI RMF','ISO/IEC 42001 AI Systems'], ic: '#71717A' },
              ].map((col) => (
                <div key={col.heading} style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ color: '#71717A', fontSize: 10, fontFamily: M, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.55px', marginBottom: 2 }}>{col.heading}</span>
                  {col.items.map(t => <span key={t} style={{ color: col.ic, fontSize: 9.5, fontFamily: M }}>{t}</span>)}
                </div>
              ))}
              <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ color: '#71717A', fontSize: 10, fontFamily: M, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.55px', marginBottom: 2 }}>SECURITY STATUS</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 5, height: 5, background: '#34D399', borderRadius: 9999 }} />
                  <span style={{ color: '#34D399', fontSize: 10, fontFamily: M }}>ALL 4 VECTORS OPERATIONAL</span>
                </div>
                <span style={{ color: '#3F3F46', fontSize: 9.5, fontFamily: M }}>SIGNATURE: 0xF94B8210C0</span>
                <span style={{ color: '#3F3F46', fontSize: 9.5, fontFamily: M }}>HARNESS LATENCY: 11.2ms</span>
              </div>
            </div>
            <div style={{ paddingTop: 12, marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#3F3F46', fontSize: 9.5, fontFamily: M }}>© 2025 AEGIS-GHOST RESEARCH LABS. SPEC_SHEET_REF: 42001-AI-SEC.</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {['SECURITY DISCLOSURE', '/', 'TELEMETRY SCHEMA', '/', 'AUDIT VERIFIER'].map((t, i) => (
                  <span key={i} style={{ color: '#3F3F46', fontSize: 9.5, fontFamily: M, cursor: t === '/' ? 'default' : 'pointer' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
