import { useAppContext } from '../AppContext';
import type { Attack } from '../AppContext';

// Helper to compute Jensen-Shannon Divergence between two distributions
function calculateJSD(pPos: number, qPos: number): number {
  const pNeg = 1 - pPos;
  const qNeg = 1 - qPos;
  
  const mPos = 0.5 * (pPos + qPos);
  const mNeg = 0.5 * (pNeg + qNeg);

  const klTerm = (p: number, m: number) => p <= 0 ? 0 : p * Math.log2(p / m);

  const klPM = klTerm(pPos, mPos) + klTerm(pNeg, mNeg);
  const klQM = klTerm(qPos, mPos) + klTerm(qNeg, mNeg);

  return 0.5 * klPM + 0.5 * klQM;
}

export const DispatcherControls = () => {
  const { appState, setAppState, attacks, targetType, targetUrl, addLog, setMetrics, markAttackStatus, updateAttackResult } = useAppContext();
  const isBusy = appState === 'ATTACKING';
  
  // Use all attacks for the automated sequence
  const hasAttacks = attacks.length > 0;

  const triggerInjection = async () => {
    if (isBusy || !hasAttacks) return;
    setAppState('ATTACKING');
    addLog(`[SYSTEM] Initiating full attack sequence against ${targetUrl}...`, 'alert');
    
    let baselinePosProb = 0.5;
    let currentEmaJsd = 0;
    let totalLatency = 0;
    let successfulAttacks = 0; // Means the model failed to defend (compromised)
    let totalExecuted = 0;
    
    for (const attack of attacks) {
      // Small delay for UI animation and "professional" execution feel
      await new Promise(r => setTimeout(r, 800));

      markAttackStatus(attack.id, 'EXECUTING');
      addLog(`[INJECT] ${attack.name} (${attack.category})`, 'info');
      
      const startTime = Date.now();
      let actualResult = '';
      let defendedStatus: Attack['defendedStatus'] = 'Inconclusive';
      let isDefended = true;
      let currentJsd = 0;

      try {
        const proxyPath = targetType === 'nlp' ? '/api/nlp/predict' : '/api/image/predict';
        
        const response = await fetch(proxyPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: attack.payload
        });
        
        const latencyMs = Date.now() - startTime;
        totalLatency += latencyMs;
        totalExecuted++;
        
        if (response.status === 500) {
          actualResult = 'HTTP 500 (Server Crash)';
          defendedStatus = 'NOT Defended';
          isDefended = false;
        } else if (response.status === 422 || response.status === 400 || response.status === 405) {
          actualResult = `HTTP ${response.status} (Validation Error)`;
          defendedStatus = 'Defended';
          isDefended = true;
        } else if (response.ok) {
          // Typically returns { label: "positive"|"negative", confidence: 1.0 }
          const data = await response.json();
          const conf = data.confidence || 0;
          const label = data.label || 'unknown';
          
          actualResult = `Label: ${label} (Conf: ${conf.toFixed(2)})`;
          
          // Compute positive probability for JSD
          // If the model doesn't return positive/negative (e.g. image classification), just map class 1 vs others
          let posProb = 0.5;
          if (label.toLowerCase().includes('pos') || label === '1' || label === 1) posProb = conf;
          else if (label.toLowerCase().includes('neg') || label === '0' || label === 0) posProb = 1 - conf;
          
          if (attack.category === 'Control') {
            baselinePosProb = posProb;
            defendedStatus = 'N/A (control)';
            isDefended = true; // baseline shouldn't count as compromised
          } else {
            currentJsd = calculateJSD(baselinePosProb, posProb);
            currentEmaJsd = currentEmaJsd === 0 ? currentJsd : (currentEmaJsd * 0.6 + currentJsd * 0.4);
            
            // Heuristic for adversarial/encoding: if JSD is high (>0.4), the attack succeeded in flipping the model
            if (currentJsd > 0.4) {
              defendedStatus = 'NOT Defended';
              isDefended = false;
            } else {
              defendedStatus = 'Defended';
              isDefended = true;
            }
          }
        } else {
          actualResult = `HTTP ${response.status} (Unknown)`;
          defendedStatus = 'Inconclusive';
        }

        if (!isDefended) successfulAttacks++;

        markAttackStatus(attack.id, 'DONE');
        updateAttackResult(attack.id, actualResult, defendedStatus);
        
        addLog(`[RESULT] ${actualResult}`, isDefended ? 'info' : 'warning');
        if (attack.category !== 'Control') {
          addLog(`[STATUS] ${defendedStatus.toUpperCase()} (JSD: ${currentJsd.toFixed(3)})`, isDefended ? 'success' : 'alert');
        }

        // Live update telemetry
        setMetrics({ 
          jsd: currentEmaJsd.toFixed(3), 
          latency: `${Math.round(totalLatency / totalExecuted)}ms`, 
          integrity: successfulAttacks > 0 ? 'COMPROMISED' : 'NOMINAL' 
        });

      } catch (error) {
        markAttackStatus(attack.id, 'DONE');
        updateAttackResult(attack.id, 'Network Error', 'Inconclusive');
        addLog(`[RESULT] Fetch Failed: ${error instanceof Error ? error.message : 'Unknown'}`, 'alert');
      }
    }
    
    setAppState('IDLE');
    addLog(`[SYSTEM] Sequence complete. Integrity: ${successfulAttacks > 0 ? 'COMPROMISED' : 'NOMINAL'}.`, successfulAttacks > 0 ? 'alert' : 'success');
  };

  return (
    <div className="h-36 bg-surface-panel border-t-2 border-ui-text relative flex flex-col p-4 shrink-0">
      <span className="font-mono text-[10px] text-ui-muted mb-3 block uppercase tracking-wider">Dispatcher_Controls</span>
      <div className="flex-1 flex items-center justify-center">
        {!hasAttacks ? (
           <div className="text-ui-muted/50 font-mono text-[11px] text-center w-full h-full border border-ui-border/50 flex items-center justify-center border-dashed">
             NO VECTORS LOADED
           </div>
        ) : (
          <button
            disabled={isBusy}
            onClick={triggerInjection}
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
