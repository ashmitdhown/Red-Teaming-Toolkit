import { useAppContext } from '../AppContext';
import { motion } from 'framer-motion';

export const DispatcherControls = () => {
  const { appState, attacks, triggerFullSequence, isChatOpen, toggleChat } = useAppContext();
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
          <button
            disabled={isBusy}
            onClick={triggerFullSequence}
            className="w-full h-full btn-hard btn-alert rounded-sm font-mono text-sm font-bold flex flex-col items-center justify-center transition-all disabled:opacity-50"
          >
            <span className="block tracking-widest">{isBusy ? 'EXECUTING SEQUENCE...' : 'START ATTACK SEQUENCE'}</span>
            {!isBusy && (
              <span className="text-[10px] text-ui-alert/80 mt-1 font-normal tracking-tight uppercase">
                {attacks.length} Vectors Loaded
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
