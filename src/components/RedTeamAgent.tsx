import { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { motion } from 'framer-motion';

const TOOLS = [
  { id: '0x01', name: 'inspect_endpoint()' },
  { id: '0x02', name: 'generate_payload()' },
  { id: '0x03', name: 'mutate_input()' },
  { id: '0x04', name: 'send_request()' },
  { id: '0x05', name: 'measure_latency()' },
  { id: '0x06', name: 'compare_prediction()' },
  { id: '0x07', name: 'calculate_drift()' },
  { id: '0x08', name: 'classify_vuln()' },
  { id: '0x09', name: 'recommend_fix()' }
];

export const RedTeamAgent = () => {
  const { appState } = useAppContext();
  const isActive = appState === 'ATTACKING';
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!isActive) {
      setActiveIndex(-1);
      return;
    }

    // Sequence through the tools to simulate an ordered pipeline
    let currentIndex = 0;
    setActiveIndex(0);
    
    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex >= TOOLS.length) {
        clearInterval(interval);
      } else {
        setActiveIndex(currentIndex);
      }
    }, 120); // Fast execution speed

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex-1 bg-surface-panel relative flex flex-col overflow-hidden">
      <div className="crosshair-corner crosshair-tr"></div>
      <div className="h-10 border-b border-ui-border flex items-center px-4 bg-surface-alt shrink-0 justify-between">
        <span className="font-mono text-xs font-bold text-ui-muted">MODULE: RED_TEAM_AGENT</span>
        <span className="font-mono text-[10px] text-ui-muted opacity-50">PROC_ID: 9942</span>
      </div>
      
      <div className="flex-1 p-5 font-mono text-ui-text overflow-auto selectable flex flex-col">
        <div className="flex items-center justify-between mb-5 border-b border-ui-border/30 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 ${isActive ? 'bg-ui-alert animate-ping' : 'bg-ui-ok animate-pulse'}`}></div>
            <span className={`font-bold text-sm tracking-wide ${isActive ? 'text-ui-alert' : 'text-ui-ok'}`}>
              {isActive ? 'AGENT EXECUTING' : 'AGENT ACTIVE'}
            </span>
          </div>
          <span className="text-ui-muted text-xs">
            {isActive ? `STEP [0${Math.min(activeIndex + 1, 9)}/09]` : '[ STANDBY ]'}
          </span>
        </div>

        {/* Execution Table */}
        <div className="flex-1 flex flex-col gap-1">
          {/* Table Header */}
          <div className="flex text-xs text-ui-muted tracking-widest uppercase pb-2 mb-2 border-b border-ui-border/20">
            <span className="w-12">SEQ</span>
            <span className="flex-1">OP_CODE</span>
            <span className="w-20 text-right">STATE</span>
          </div>

          {/* Table Rows */}
          {TOOLS.map((tool, i) => {
            let state = 'WAIT';
            let stateColor = 'text-ui-muted/50';
            let isCurrent = false;

            if (isActive) {
              if (i < activeIndex) {
                state = 'DONE';
                stateColor = 'text-ui-ok opacity-70';
              } else if (i === activeIndex) {
                state = 'EXEC';
                stateColor = 'text-ui-alert font-bold';
                isCurrent = true;
              }
            } else if (activeIndex === -1) {
              // Not attacking at all
              state = 'IDLE';
            }

            return (
              <div 
                key={i} 
                className={`flex items-center text-[13px] py-1.5 transition-colors duration-75 ${
                  isCurrent ? 'bg-ui-alert/10 border-l-[3px] border-ui-alert pl-2 -ml-[11px]' : ''
                }`}
              >
                <span className={`w-12 ${isCurrent ? 'text-ui-text' : 'text-ui-muted/50'}`}>
                  {tool.id}
                </span>
                
                <span className={`flex-1 ${isCurrent ? 'text-ui-text font-bold' : 'text-ui-muted'}`}>
                  {tool.name}
                  {isCurrent && (
                    <motion.span 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: [0, 1, 0] }} 
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-2 h-3.5 bg-ui-alert ml-2 align-middle"
                    />
                  )}
                </span>
                
                <span className={`w-20 text-right ${stateColor}`}>
                  {isCurrent ? (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.2, repeat: Infinity }}
                    >
                      {state}
                    </motion.span>
                  ) : (
                    `[${state}]`
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
