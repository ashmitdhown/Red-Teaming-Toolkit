import { useState, useRef, useCallback } from 'react';
import { AppProvider } from './AppContext';
import { Header } from './components/Header';
import { TargetConfig } from './components/TargetConfig';
import { RedTeamAgent } from './components/RedTeamAgent';
import { RobustnessFingerprint } from './components/RobustnessFingerprint';
import { CausalAgent } from './components/CausalAgent';
import { TelemetryInspector } from './components/TelemetryInspector';
import { ExecutionLog } from './components/ExecutionLog';
import { DispatcherControls } from './components/DispatcherControls';
import { LandingPage } from './components/LandingPage';
import { AegisChat } from './components/AegisChat';
import { ComplianceReport } from './components/ComplianceReport';
import { motion, AnimatePresence } from 'framer-motion';

// ── Widget registry ───────────────────────────────────────────────────────────
export type WidgetId = 'redteam' | 'robustness' | 'causal' | 'dispatcher';

export const OPTIONAL_WIDGETS: { id: WidgetId; label: string }[] = [
  { id: 'redteam',    label: 'RED TEAM AGENT' },
  { id: 'robustness', label: 'ROBUSTNESS FINGERPRINT' },
  { id: 'causal',     label: 'CAUSAL AGENT' },
  { id: 'dispatcher', label: 'DISPATCHER CONTROLS' },
];

// ── Drag-resize helpers ───────────────────────────────────────────────────────
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function useColResize(initial: number, min: number, max: number) {
  const [pct, setPct] = useState(initial);
  const ref = useRef(false);
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    ref.current = true;
    const x0 = e.clientX, p0 = pct;
    const move = (ev: MouseEvent) => {
      if (!ref.current) return;
      setPct(clamp(p0 + ((ev.clientX - x0) / window.innerWidth) * 100, min, max));
    };
    const up = () => { ref.current = false; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [pct, min, max]);
  return { pct, onMouseDown };
}

function useRowResize(initial: number, min: number, max: number) {
  const [pct, setPct] = useState(initial);
  const ref = useRef(false);
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    ref.current = true;
    const y0 = e.clientY, p0 = pct;
    const move = (ev: MouseEvent) => {
      if (!ref.current) return;
      const totalH = window.innerHeight - 48; // minus header
      setPct(clamp(p0 + ((ev.clientY - y0) / totalH) * 100, min, max));
    };
    const up = () => { ref.current = false; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [pct, min, max]);
  return { pct, onMouseDown };
}

// ── Resize handle UI ──────────────────────────────────────────────────────────
const ColHandle = ({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) => (
  <div
    onMouseDown={onMouseDown}
    className="w-[4px] shrink-0 cursor-col-resize bg-ui-border hover:bg-ui-accent/70 active:bg-ui-accent transition-colors duration-100 group select-none z-10 flex items-center justify-center"
  >
    <div className="w-px h-6 bg-ui-muted/20 group-hover:bg-ui-accent/60 transition-colors" />
  </div>
);

const RowHandle = ({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) => (
  <div
    onMouseDown={onMouseDown}
    className="h-[4px] shrink-0 cursor-row-resize bg-ui-border hover:bg-ui-accent/70 active:bg-ui-accent transition-colors duration-100 group select-none z-10 flex items-center justify-center"
  >
    <div className="h-px w-6 bg-ui-muted/20 group-hover:bg-ui-accent/60 transition-colors" />
  </div>
);

// ── Workspace ─────────────────────────────────────────────────────────────────
function Workspace() {
  // Which optional widgets are visible
  const [activeWidgets, setActiveWidgets] = useState<Set<WidgetId>>(
    new Set(['redteam', 'robustness', 'causal', 'dispatcher'] as WidgetId[])
  );
  const toggleWidget = (id: WidgetId) =>
    setActiveWidgets(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  // Column split: left workspace vs right sidebar (left %, 35–75)
  const mainCol  = useColResize(62, 35, 75);
  // Top row vs bottom row split within left column (top %, 25–70)
  const mainRow  = useRowResize(45, 25, 70);
  // Within top row: TargetConfig vs RedTeamAgent (left %, 25–70)
  const topCol   = useColResize(50, 25, 70);
  // Within bottom row: Robustness vs Causal (left %, 25–70)
  const botCol   = useColResize(50, 25, 70);

  const showRedteam    = activeWidgets.has('redteam');
  const showRobustness = activeWidgets.has('robustness');
  const showCausal     = activeWidgets.has('causal');
  const showDispatcher = activeWidgets.has('dispatcher');

  // Is the bottom row needed at all?
  const hasBottomRow = showRobustness || showCausal;
  // Is the top-right panel needed?
  const hasTopRight = showRedteam;

  return (
    <div className="flex flex-col font-sans text-sm transition-colors duration-300 h-screen w-screen bg-surface-base text-ui-text print:hidden">
      <Header activeWidgets={activeWidgets} onToggleWidget={toggleWidget} />

      <main className="flex-1 flex overflow-hidden bg-ui-border min-h-0" style={{ gap: '1px', padding: '1px' }}>

        {/* ── LEFT WORKSPACE ── */}
        <section
          className="flex flex-col overflow-hidden min-w-0 min-h-0"
          style={{ width: `${mainCol.pct}%` }}
        >
          {/* TOP ROW */}
          <div
            className="flex overflow-hidden min-h-0"
            style={{
              height: hasBottomRow ? `${mainRow.pct}%` : '100%',
              gap: '1px',
            }}
          >
            {/* TargetConfig — always on, left of top row */}
            <div
              className="overflow-hidden flex min-w-0"
              style={{ width: hasTopRight ? `${topCol.pct}%` : '100%' }}
            >
              <TargetConfig />
            </div>

            {/* Col handle + RedTeamAgent */}
            {hasTopRight && (
              <>
                <ColHandle onMouseDown={topCol.onMouseDown} />
                <div className="flex-1 overflow-hidden flex min-w-0">
                  <RedTeamAgent />
                </div>
              </>
            )}
          </div>

          {/* Row handle + BOTTOM ROW */}
          {hasBottomRow && (
            <>
              <RowHandle onMouseDown={mainRow.onMouseDown} />
              <div className="flex-1 flex overflow-hidden min-h-0" style={{ gap: '1px' }}>
                {/* Robustness */}
                {showRobustness && (
                  <div
                    className="overflow-hidden flex min-w-0"
                    style={{ width: showCausal ? `${botCol.pct}%` : '100%' }}
                  >
                    <RobustnessFingerprint />
                  </div>
                )}
                {/* Col handle between robustness and causal */}
                {showRobustness && showCausal && (
                  <ColHandle onMouseDown={botCol.onMouseDown} />
                )}
                {/* Causal */}
                {showCausal && (
                  <div className="flex-1 overflow-hidden flex min-w-0">
                    <CausalAgent />
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {/* ── Main column resize handle ── */}
        <ColHandle onMouseDown={mainCol.onMouseDown} />

        {/* ── Right Sidebar ── */}
        <section
          className="flex flex-col overflow-hidden min-w-[300px] min-h-0"
          style={{ width: `${100 - mainCol.pct}%`, gap: '1px' }}
        >
          <TelemetryInspector />
          <ExecutionLog />
          {showDispatcher && <DispatcherControls />}
        </section>

      </main>

      {/* Floating AEGIS-AI panel — triggered from DispatcherControls header */}
      <AegisChat />
    </div>
  );
}


// ── App shell ─────────────────────────────────────────────────────────────────
function AppContent() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');

  return (
    <AnimatePresence mode="wait">
      {view === 'landing' ? (
        <motion.div
          key="landing"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-screen min-h-screen print:hidden"
        >
          <LandingPage onEnterWorkspace={() => setView('workspace')} />
        </motion.div>
      ) : (
        <motion.div
          key="workspace"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-screen h-screen print:hidden"
        >
          <Workspace />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
      <ComplianceReport />
    </AppProvider>
  );
}

export default App;
