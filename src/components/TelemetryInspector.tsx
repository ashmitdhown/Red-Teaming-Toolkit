import { useAppContext } from '../AppContext';

export const TelemetryInspector = () => {
  const { metrics } = useAppContext();

  // Convert JSD string back to number for percentage width
  const jsdValue = parseFloat(metrics.jsd);
  const percent = Math.min(jsdValue * 100, 100);

  return (
    <div className="h-56 bg-surface-panel relative flex flex-col shrink-0 border border-ui-border/50 rounded-xl shadow-lg">
      <div className="crosshair-corner crosshair-bl"></div>
      <div className="h-10 border-b border-ui-border/50 flex items-center px-4 bg-slate-800/50 rounded-t-xl border-t-2 border-t-amber-500/50">
        <span className="font-mono text-xs font-bold text-amber-400">TELEMETRY_INSPECTOR</span>
      </div>
      
      <div className="flex-1 p-5 flex flex-col justify-center">
        <div className="flex justify-between items-end border-b border-ui-border/50 pb-3 mb-4">
          <span className="font-mono text-[11px] text-ui-muted">JENSEN-SHANNON DIVERGENCE</span>
          <span className={`font-mono text-3xl font-bold tracking-tighter ${jsdValue > 0.4 ? 'glitch-active' : ''}`}>
            {metrics.jsd}
          </span>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <span className="font-mono text-[10px] text-ui-muted block mb-1">BASELINE (μ)</span>
            <span className="font-mono text-sm text-ui-text font-semibold">VALIDATED</span>
          </div>
          <div className="flex-1 border-l border-ui-border/50 pl-4">
            <span className="font-mono text-[10px] text-ui-muted block mb-1">LATENCY (p99)</span>
            <span className="font-mono text-sm text-ui-text font-semibold">{metrics.latency}</span>
          </div>
          <div className="flex-1 border-l border-ui-border/50 pl-4">
            <span className="font-mono text-[10px] text-ui-muted block mb-1">INTEGRITY</span>
            <span className={`font-mono text-sm font-bold ${metrics.integrity === 'COMPROMISED' ? 'text-ui-alert' : 'text-ui-ok'}`}>
              {metrics.integrity}
            </span>
          </div>
        </div>

        <div className="mt-5 h-1.5 w-full bg-surface-alt relative overflow-hidden rounded-full">
          <div className="absolute right-0 top-0 bottom-0 w-[60%] bg-ui-alert/10 border-l-2 border-ui-alert/50"></div>
          <div 
            className="absolute left-0 top-0 bottom-0 bg-ui-text transition-all duration-300 rounded-full"
            style={{ width: `${percent}%`, backgroundColor: jsdValue > 0.4 ? 'rgb(var(--col-alert))' : 'rgb(var(--col-text))' }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[10px] text-ui-muted">0.0</span>
          <span className="font-mono text-[10px] font-semibold text-ui-alert">THRESHOLD: 0.40</span>
        </div>
      </div>
    </div>
  );
};
