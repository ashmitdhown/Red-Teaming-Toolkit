import { motion } from 'framer-motion';
import { useAppContext } from '../AppContext';
import type { Attack } from '../AppContext';

export const DispatcherControls = () => {
  const { 
    appState, attacks, triggerFullSequence, isChatOpen, toggleChat, toggleReport 
  } = useAppContext();
  
  const isBusy = appState === 'ATTACKING';
  const hasAttacks = attacks.length > 0;

  return (
    <div className="h-36 bg-surface-panel border-t-2 border-ui-text relative flex flex-col p-4 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] text-ui-muted uppercase tracking-wider">Dispatcher_Controls</span>
        <button
          onClick={toggleChat}
          className={`btn-hard font-mono text-[9px] font-bold tracking-widest px-3 py-1 flex items-center gap-1.5 cursor-pointer transition-colors ${
            isChatOpen ? 'border-ui-muted text-ui-muted' : 'btn-alert'
          }`}
        >
          <motion.span
            animate={isChatOpen ? {} : { opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚡
          </motion.span>
          {isChatOpen ? 'CLOSE AI' : 'AEGIS-AI'}
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {!hasAttacks ? (
           <div className="text-ui-muted/50 font-mono text-[11px] text-center w-full h-full border border-ui-border/50 flex items-center justify-center border-dashed">
             NO VECTORS LOADED
           </div>
        ) : (
          <div className="w-full h-full flex gap-2">
            <button
              disabled={isBusy}
              onClick={triggerFullSequence}
              className="flex-1 h-full btn-hard btn-alert rounded-sm font-mono text-sm font-bold flex flex-col items-center justify-center transition-all disabled:opacity-50"
            >
              <span className="block tracking-widest">{isBusy ? 'EXECUTING SEQUENCE...' : 'START ATTACK SEQUENCE'}</span>
              {!isBusy && (
                <span className="text-[10px] text-ui-alert/80 mt-1 font-normal tracking-tight uppercase">
                  {attacks.length} Vectors Loaded
                </span>
              )}
            </button>
            <button
              disabled={isBusy || attacks.every(a => a.status === 'IDLE')}
              onClick={toggleReport}
              className="w-16 h-full flex flex-col items-center justify-center bg-surface-alt border border-ui-border hover:border-ui-accent transition-colors disabled:opacity-50 group"
              title="Generate Compliance Report"
            >
              <svg className="w-6 h-6 text-ui-muted group-hover:text-ui-accent transition-colors mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span className="text-[8px] font-mono text-ui-muted group-hover:text-ui-accent uppercase tracking-widest">Report</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
