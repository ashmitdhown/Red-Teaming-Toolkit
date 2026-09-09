import { useAppContext } from '../AppContext';

export const DispatcherControls = () => {
  const { appState, setAppState, setIsGhost, addLog, setMetrics } = useAppContext();
  const isBusy = appState === 'ATTACKING';

  const triggerBaseline = () => {
    if (isBusy) return;
    setAppState('ATTACKING');
    
    addLog('Calling agent.inspect_endpoint()...');
    addLog('Sending baseline payload batch (N=30)...');
    
    setIsGhost(false);
    setMetrics({ jsd: '0.012', latency: Math.floor(Math.random() * 10 + 40) + 'ms', integrity: 'NOMINAL' });

    setTimeout(() => {
      setAppState('IDLE');
      addLog('Analysis complete: Distribution within nominal variance.', 'success');
    }, 1000);
  };

  const triggerGhost = () => {
    if (isBusy) return;
    setAppState('ATTACKING');
    
    addLog('Agent tool active: generate_payload()', 'alert');
    addLog('Constructing Payload: U+E0000 hidden tags...', 'alert');
    addLog('Bypassing target validation layers...');
    
    setIsGhost(true);
    setMetrics({ jsd: '0.002', latency: '204ms', integrity: 'NOMINAL' });

    // Simulate metric drift
    let drift = 0.012;
    const interval = setInterval(() => {
      drift += 0.08;
      if (drift >= 0.842) {
        drift = 0.842;
        clearInterval(interval);
        setMetrics((m: any) => ({ ...m, integrity: 'COMPROMISED' }));
      }
      setMetrics((m: any) => ({ ...m, jsd: drift.toFixed(3) }));
    }, 50);

    setTimeout(() => {
      setAppState('IDLE');
      addLog('Vulnerability confirmed. Agent generated causal analysis.', 'success');
    }, 1200);
  };

  return (
    <div className="h-36 bg-surface-panel border-t-2 border-ui-text relative flex flex-col p-4 shrink-0">
      <span className="font-mono text-[10px] text-ui-muted mb-3 block uppercase tracking-wider">Dispatcher_Controls</span>
      <div className="grid grid-cols-2 gap-3 flex-1">
        <button
          disabled={isBusy}
          onClick={triggerBaseline}
          className="btn-hard rounded-sm font-mono text-xs font-bold flex flex-col items-center justify-center py-2"
        >
          <span className="block">SEND NORMAL</span>
          <span className="text-[10px] text-ui-muted mt-1 font-normal tracking-tight">N=30 WARMUP</span>
        </button>
        <button
          disabled={isBusy}
          onClick={triggerGhost}
          className="btn-hard btn-alert rounded-sm font-mono text-xs font-bold flex flex-col items-center justify-center py-2"
        >
          <span className="block">INJECT GHOST</span>
          <span className="text-[10px] text-ui-alert/80 mt-1 font-normal tracking-tight">[U+E0000] PAYLOAD</span>
        </button>
      </div>
    </div>
  );
};
