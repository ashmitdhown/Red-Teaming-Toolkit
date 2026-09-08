import { useAppContext } from '../AppContext';

export const RedTeamAgent = () => {
  const { appState } = useAppContext();
  const isActive = appState === 'ATTACKING';

  return (
    <div className="flex-1 bg-surface-panel relative flex flex-col overflow-hidden border border-ui-border/50 rounded-xl shadow-lg">
      <div className="crosshair-corner crosshair-tr"></div>
      <div className="h-10 border-b border-ui-border/50 flex items-center px-4 bg-slate-800/50 shrink-0 rounded-t-xl border-t-2 border-t-purple-500/50">
        <span className="font-mono text-xs font-bold text-purple-400">MODULE: RED_TEAM_AGENT</span>
      </div>
      <div className="flex-1 p-4 font-mono text-xs text-ui-text overflow-auto selectable flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 ${isActive ? 'bg-ui-alert animate-ping' : 'bg-ui-ok animate-pulse'}`}></div>
          <span className={`font-bold border-b pb-0.5 ${isActive ? 'border-ui-alert/30 text-ui-alert' : 'border-ui-ok/30'}`}>
            {isActive ? 'AGENT EXECUTING' : 'AGENT ACTIVE'}
          </span>
        </div>
        <div className="text-ui-muted mb-2 text-[10px] uppercase tracking-wider">Available Tools:</div>
        <ul className="space-y-1.5 text-[11px] text-ui-text/90 list-none pl-1">
          {['inspect_endpoint()', 'generate_payload()', 'mutate_input()', 'send_request()', 'measure_latency()', 'compare_prediction()', 'calculate_confidence_drift()', 'classify_vulnerability()', 'recommend_remediation()'].map((tool, i) => (
            <li key={i} className="flex items-center gap-2 hover:text-ui-accent transition-colors cursor-crosshair">
              <span className="text-ui-muted">•</span> {tool}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
