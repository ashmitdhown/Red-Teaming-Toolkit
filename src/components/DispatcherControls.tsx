import { useAppContext } from '../AppContext';
import type { Attack } from '../AppContext';

export const DispatcherControls = () => {
  const { appState, setAppState, attacks, selectedAttackId, addLog, setMetrics, markAttackStatus, updateAttackResult } = useAppContext();
  const isBusy = appState === 'ATTACKING';
  
  const activeAttack = attacks.find(a => a.id === selectedAttackId);

  const triggerInjection = async () => {
    if (isBusy || !activeAttack) return;
    setAppState('ATTACKING');
    markAttackStatus(activeAttack.id, 'EXECUTING');
    
    addLog(`[INJECT] Initiating vector: ${activeAttack.name}`, 'alert');
    addLog(`[PAYLOAD] Transmitting payload logic...`, 'info');
    
    const startTime = Date.now();
    let actualResult = '';
    let defendedStatus: Attack['defendedStatus'] = 'Inconclusive';
    let isDefended = false;

    try {
      // Execute live HTTP request via Vite Proxy
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: activeAttack.payload
      });
      
      const endTime = Date.now();
      const latencyMs = endTime - startTime;
      
      if (response.status === 500) {
        // Crash / Unhandled Exception
        actualResult = 'HTTP 500 (Server Crash)';
        defendedStatus = 'NOT Defended';
        isDefended = false;
      } else if (response.status === 422 || response.status === 400) {
        // Schema Validation Caught It
        actualResult = `HTTP ${response.status} (Validation Error)`;
        defendedStatus = 'Defended';
        isDefended = true;
      } else if (response.ok) {
        // Successful Processing (Might be a silent flip!)
        const data = await response.json();
        actualResult = `Label: ${data.label} (Conf: ${data.confidence.toFixed(2)})`;
        
        // Basic heuristic: if it's a boundary/malformed attack and it got a 200, it's NOT defended.
        // If it's an adversarial attack, we'd need to compare it to the baseline, but for now we flag it.
        if (activeAttack.category === 'Control') {
          defendedStatus = 'N/A (control)';
          isDefended = true;
        } else {
          defendedStatus = 'NOT Defended';
          isDefended = false;
        }
      } else {
        actualResult = `HTTP ${response.status} (Unknown)`;
        defendedStatus = 'Inconclusive';
      }

      // Update UI with real metrics
      setAppState('IDLE');
      markAttackStatus(activeAttack.id, 'DONE');
      updateAttackResult(activeAttack.id, actualResult, defendedStatus);
      
      addLog(`[RESULT] ${actualResult}`, isDefended ? 'info' : 'warning');
      addLog(`[STATUS] ${defendedStatus.toUpperCase()}`, isDefended ? 'success' : 'alert');
      
      setMetrics({ 
        jsd: (Math.random() * 0.8).toFixed(3), // Keeping JSD simulated for now since we don't have the full baseline array
        latency: `${latencyMs}ms`, 
        integrity: isDefended ? 'NOMINAL' : 'COMPROMISED' 
      });

    } catch (error) {
      setAppState('IDLE');
      markAttackStatus(activeAttack.id, 'DONE');
      updateAttackResult(activeAttack.id, 'Network Error', 'Inconclusive');
      addLog(`[RESULT] Fetch Failed: ${error instanceof Error ? error.message : 'Unknown'}`, 'alert');
    }
  };

  return (
    <div className="h-36 bg-surface-panel border-t-2 border-ui-text relative flex flex-col p-4 shrink-0">
      <span className="font-mono text-[10px] text-ui-muted mb-3 block uppercase tracking-wider">Dispatcher_Controls</span>
      <div className="flex-1 flex items-center justify-center">
        {!activeAttack ? (
           <div className="text-ui-muted/50 font-mono text-[11px] text-center w-full h-full border border-ui-border/50 flex items-center justify-center border-dashed">
             AWAITING VECTOR SELECTION
           </div>
        ) : (
          <button
            disabled={isBusy}
            onClick={triggerInjection}
            className="w-full h-full btn-hard btn-alert rounded-sm font-mono text-sm font-bold flex flex-col items-center justify-center transition-all disabled:opacity-50"
          >
            <span className="block tracking-widest">{isBusy ? 'EXECUTING...' : 'INJECT VECTOR'}</span>
            <span className="text-[10px] text-ui-alert/80 mt-1 font-normal tracking-tight uppercase">
              {activeAttack.category}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
