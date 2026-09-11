import { useAppContext } from '../AppContext';
import { OPTIONAL_WIDGETS } from '../App';
import type { WidgetId } from '../App';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  activeWidgets: Set<WidgetId>;
  onToggleWidget: (id: WidgetId) => void;
}

export const Header = ({ activeWidgets, onToggleWidget }: HeaderProps) => {
  const { appState, resetApp, isChatOpen, toggleChat } = useAppContext();

  return (
    <header className="h-12 bg-surface-dark text-gray-300 flex items-center justify-between px-4 shrink-0 border-b border-ui-border gap-4 overflow-visible z-50 relative">

      {/* ── Left: brand ── */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="font-mono font-bold tracking-widest text-xs flex items-center gap-2 text-white">
          <div className="w-2 h-2 bg-ui-accent rounded-none" />
          AEGIS-GHOST
          <span className="text-gray-500 font-normal">// WORKSPACE</span>
        </div>
        <div className="h-4 w-px bg-gray-700" />
      </div>

      {/* ── Centre: widget bar ── */}
      <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar min-w-0">

        {/* Toggleable widget buttons */}
        {OPTIONAL_WIDGETS.map(w => {
          const isOn = activeWidgets.has(w.id);
          return (
            <button
              key={w.id}
              onClick={() => onToggleWidget(w.id)}
              title={isOn ? `Hide ${w.label}` : `Show ${w.label}`}
              className={`
                flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-[9px] tracking-widest
                border transition-all duration-150 shrink-0 cursor-pointer select-none
                ${isOn
                  ? 'border-ui-accent bg-ui-accent/10 text-ui-accent hover:bg-ui-accent/20'
                  : 'border-ui-border/50 bg-transparent text-ui-muted/50 hover:border-ui-muted/50 hover:text-ui-muted'
                }
              `}
            >
              {/* Indicator dot */}
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isOn ? 'bg-ui-accent' : 'bg-ui-muted/30'}`} />
              {w.label}
              {/* ✕ when on */}
              {isOn && (
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none" className="opacity-60 ml-0.5">
                  <path d="M1 1l5 5M6 1L1 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Right: controls ── */}
      <div className="flex items-center gap-3 font-mono text-xs shrink-0">
        <span className="text-gray-400 text-[10px]">
          STATE:{' '}
          <span className={appState === 'ATTACKING' ? 'text-ui-alert animate-pulse' : 'text-ui-ok'}>
            {appState}
          </span>
        </span>
        <div className="relative flex items-center">
          <AnimatePresence>
            {!isChatOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-[120%] mt-1 w-52 bg-surface-alt border border-ui-alert shadow-lg text-ui-text text-[9px] p-2 z-50 pointer-events-none"
              >
                <div className="absolute -top-[5px] right-6 w-2 h-2 bg-surface-alt border-t border-l border-ui-alert rotate-45" />
                <div className="text-ui-alert font-bold mb-0.5">AEGIS-AI</div>
                <div className="text-ui-muted">Hi! I can help you analyze vulnerabilities. Click to chat.</div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={toggleChat}
            className={`px-2 py-0.5 font-bold transition-colors cursor-pointer text-[10px] tracking-widest border ${isChatOpen ? 'bg-ui-accent text-black border-ui-accent' : 'text-ui-accent hover:bg-ui-accent hover:text-black border-ui-accent'}`}
          >
            [ AEGIS-AI ]
          </button>
        </div>
        <button
          onClick={resetApp}
          className="text-ui-alert hover:bg-ui-alert hover:text-black border border-ui-alert px-2 py-0.5 font-bold transition-colors cursor-pointer text-[10px] tracking-widest"
        >
          [ RESET ]
        </button>
      </div>
    </header>
  );
};
