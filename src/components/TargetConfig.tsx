import React from 'react';
import { useAppContext } from '../AppContext';

export const TargetConfig = () => {
  const { 
    attacks, selectedAttackId, endpointStatus, testEndpoint, updateAttackPayload 
  } = useAppContext();
  
  const activeAttack = attacks.find(a => a.id === selectedAttackId);

  return (
    <div className="flex-1 bg-surface-panel relative flex flex-col overflow-hidden group">
      <div className="crosshair-corner crosshair-tl"></div>
      
      {/* HEADER WITH ENDPOINT TESTER */}
      <div className="h-10 border-b border-ui-border flex items-center px-4 bg-surface-alt shrink-0 justify-between">
        <span className="font-mono text-xs font-bold text-ui-muted">MODULE: TARGET_CONFIGURATION</span>
        <div className="flex items-center gap-3">
           <span className={`font-mono text-[9px] tracking-widest ${
              endpointStatus === 'ONLINE' ? 'text-ui-ok' :
              endpointStatus === 'TESTING' ? 'text-ui-alert animate-pulse' :
              'text-ui-muted'
           }`}>
              STATUS: {endpointStatus}
           </span>
           <button 
             onClick={testEndpoint}
             disabled={endpointStatus === 'TESTING'}
             className="text-[9px] text-ui-text border border-ui-border px-2 py-0.5 bg-surface-base hover:bg-ui-text hover:text-surface-base transition-colors tracking-widest disabled:opacity-50 cursor-pointer"
           >
             [ TEST CONNECTION ]
           </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden bg-surface-base">
        {/* Editor Area */}
        <div className="flex-1 flex border-b border-ui-border/30">
          {/* Line Numbers */}
          <div className="w-8 shrink-0 bg-surface-alt border-r border-ui-border text-right pr-2 py-3 text-ui-muted/50 text-[11px] leading-[20px] select-none font-mono">
            {[...Array(14)].map((_, i) => (
              <React.Fragment key={i}>{i + 1}<br/></React.Fragment>
            ))}
          </div>
          
          <div className="flex-1 relative font-mono text-[11px] leading-[20px]">
             {!activeAttack ? (
                <div className="absolute inset-0 flex items-center justify-center text-ui-muted/50 flex-col gap-2">
                  <span>[ NO ATTACK VECTOR SELECTED ]</span>
                  <span className="text-[9px]">Select a vector from the Payload Library</span>
                </div>
             ) : (
                <textarea 
                  className="absolute inset-0 w-full h-full p-3 bg-transparent text-ui-text outline-none resize-none focus:bg-surface-panel transition-colors"
                  value={activeAttack.payload}
                  onChange={(e) => updateAttackPayload(activeAttack.id, e.target.value)}
                  spellCheck={false}
                />
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
