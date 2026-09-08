import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export const CausalAgent = () => {
  const { isGhost, appState } = useAppContext();
  
  // Is active only when attack has finished and it was ghost
  const showFindings = isGhost && appState === 'IDLE';

  return (
    <div className="flex-[1.2] bg-surface-panel relative flex flex-col overflow-hidden border border-ui-border/50 rounded-xl shadow-lg">
      <div className="h-10 border-b border-ui-border/50 flex items-center px-4 bg-slate-800/50 shrink-0 justify-between rounded-t-xl border-t-2 border-t-pink-500/50">
        <span className="font-mono text-xs font-bold text-pink-400 flex items-center gap-2">
          <svg className="w-3 h-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          "WHY DID THIS WORK?" AGENT
        </span>
      </div>
      <div className="flex-1 p-4 overflow-auto selectable relative">
        <AnimatePresence mode="wait">
          {!showFindings ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-ui-muted font-mono text-[11px] bg-surface-panel z-10"
            >
              <svg className={`w-8 h-8 mb-3 opacity-20 ${appState === 'ATTACKING' ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
              <span>{appState === 'ATTACKING' ? 'ANALYZING VULNERABILITY...' : 'WAITING FOR VULNERABILITY...'}</span>
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-ui-border rounded-sm p-4 bg-surface-base font-mono text-[11px] shadow-sm h-full flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-ui-muted tracking-widest text-[10px]">FINDING #04</span>
                <button className="text-ui-muted hover:text-ui-text transition-colors" title="Copy to clipboard">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
              
              <div className="font-bold text-sm text-ui-text mb-1">Unicode Manipulation</div>
              <div className="mb-5 text-ui-text">Severity: <span className="text-ui-alert font-bold">HIGH</span></div>

              <div className="text-ui-muted mb-1 uppercase text-[10px] tracking-widest">Observed:</div>
              <div className="mb-4 text-ui-text leading-relaxed">Prediction changed in <span className="bg-ui-alert/10 text-ui-alert px-1">14/50</span> equivalent inputs.</div>

              <div className="text-ui-muted mb-1 uppercase text-[10px] tracking-widest">Likely Cause:</div>
              <div className="mb-4 text-ui-text leading-relaxed">The preprocessing pipeline appears sensitive to Unicode normalization differences.</div>

              <div className="text-ui-muted mb-1 uppercase text-[10px] tracking-widest mt-auto">Recommended Fix:</div>
              <div className="text-ui-ok leading-relaxed border-l-2 border-ui-ok pl-2 bg-ui-ok/5 py-1">Apply Unicode normalization before tokenization and test against mixed-script and zero-width inputs.</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
