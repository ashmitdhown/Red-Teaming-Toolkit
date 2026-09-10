import { useAppContext } from '../AppContext';

export const RobustnessFingerprint = () => {
  const { attacks } = useAppContext();

  const getScore = (categoryPrefix: string) => {
    const categoryAttacks = attacks.filter(a => a.category.startsWith(categoryPrefix) || (categoryPrefix === 'Adversarial' && a.category === 'Manual Injections'));
    if (categoryAttacks.length === 0) return 0;
    
    let executedCount = 0;
    let defendedCount = 0;
    
    categoryAttacks.forEach(a => {
      if (a.status === 'DONE') {
        executedCount++;
        if (a.defendedStatus === 'Defended' || a.defendedStatus === 'N/A (control)') {
           defendedCount++;
        }
      }
    });
    
    if (executedCount === 0) return 0;
    return Math.floor((defendedCount / executedCount) * 100);
  };

  const validationScore = getScore('Boundary');
  const encScore = getScore('Encoding');
  const perturbationScore = getScore('Adversarial');
  const malformedScore = getScore('Malformed');
  
  const executedAny = attacks.some(a => a.status === 'DONE');
  const overallAvg = executedAny ? Math.floor((validationScore + encScore + perturbationScore + malformedScore) / 4) : 0;
  const isHighRisk = executedAny && overallAvg < 50;

  const points = isHighRisk 
    ? "70,29 109.4,47.25 75.2,73 70,100.5 39.26,87.75 34.06,49.25"
    : executedAny ? "70,29 109.4,47.25 90.78,82 70,100.5 39.26,87.75 34.06,49.25" : "70,60 80,65 80,75 70,80 60,75 60,65";
  
  const encDotCx = isHighRisk ? "75.2" : "90.78";
  const encDotCy = isHighRisk ? "73" : "82";
  
  const overallRating = `${overallAvg}/100`;
  const riskLevel = !executedAny ? "— UNTESTED" : isHighRisk ? "— HIGH RISK" : "— MODERATE RISK";

  return (
    <div className="flex-1 bg-surface-panel relative flex flex-col overflow-hidden">
      <div className="h-10 border-b border-ui-border flex items-center px-4 bg-surface-alt shrink-0">
        <span className="font-mono text-xs font-bold text-ui-text">MODEL ROBUSTNESS FINGERPRINT™</span>
      </div>
      <div className="flex-1 p-4 font-mono text-xs text-ui-text overflow-auto selectable">
        
        <div className="flex flex-row gap-5 mb-5 items-center border-b border-ui-border/50 pb-5">
          <div className="w-[140px] h-[140px] shrink-0 relative">
            <svg viewBox="0 0 140 140" className="w-full h-full font-mono text-[8px] tracking-widest overflow-visible">
              <polygon points="70,20 113.3,45 113.3,95 70,120 26.7,95 26.7,45" fill="none" stroke="currentColor" className="text-ui-border opacity-30"/>
              <polygon points="70,30 104.64,50 104.64,90 70,110 35.36,90 35.36,50" fill="none" stroke="currentColor" className="text-ui-border opacity-30"/>
              <polygon points="70,40 95.98,55 95.98,85 70,100 44.02,85 44.02,55" fill="none" stroke="currentColor" className="text-ui-border opacity-30"/>
              <polygon points="70,50 87.32,60 87.32,80 70,90 52.68,80 52.68,60" fill="none" stroke="currentColor" className="text-ui-border opacity-30"/>
              <polygon points="70,60 78.66,65 78.66,75 70,80 61.34,75 61.34,65" fill="none" stroke="currentColor" className="text-ui-border opacity-30"/>

              <line x1="70" y1="20" x2="70" y2="120" stroke="currentColor" className="text-ui-border opacity-40"/>
              <line x1="26.7" y1="45" x2="113.3" y2="95" stroke="currentColor" className="text-ui-border opacity-40"/>
              <line x1="26.7" y1="95" x2="113.3" y2="45" stroke="currentColor" className="text-ui-border opacity-40"/>

              <text x="70" y="14" fill="currentColor" textAnchor="middle" className="text-ui-muted font-bold">VAL</text>
              <text x="117" y="47" fill="currentColor" textAnchor="start" className="text-ui-muted font-bold">BND</text>
              <text x="117" y="97" fill="currentColor" textAnchor="start" className={`transition-colors font-bold ${isHighRisk ? 'text-ui-alert' : 'text-ui-muted'}`}>ENC</text>
              <text x="70" y="130" fill="currentColor" textAnchor="middle" className="text-ui-muted font-bold">PRT</text>
              <text x="23" y="97" fill="currentColor" textAnchor="end" className="text-ui-muted font-bold">SAF</text>
              <text x="23" y="47" fill="currentColor" textAnchor="end" className="text-ui-muted font-bold">ERR</text>

              <polygon 
                points={points} 
                fill={isHighRisk ? "rgb(var(--col-alert))" : "rgb(var(--col-text))"} 
                fillOpacity="0.15" 
                stroke={isHighRisk ? "rgb(var(--col-alert))" : "rgb(var(--col-text))"} 
                strokeWidth="1.5" 
                style={{ transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              
              <circle 
                cx={encDotCx} 
                cy={encDotCy} 
                r="2.5" 
                fill={isHighRisk ? "rgb(var(--col-alert))" : "rgb(var(--col-text))"} 
                style={{ transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>
          </div>
          
          <div className="flex-1 grid grid-cols-1 gap-2 text-[11px] h-full py-1">
            <div className="flex justify-between border-b border-ui-border/30 pb-1.5">
              <span className="text-ui-muted text-[10px] uppercase">Input type:</span>
              <span className="font-bold">Text</span>
            </div>
            <div className="flex justify-between border-b border-ui-border/30 pb-1.5">
              <span className="text-ui-muted text-[10px] uppercase">Output type:</span>
              <span className="font-bold">Classification</span>
            </div>
            <div className="flex justify-between border-b border-ui-border/30 pb-1.5">
              <span className="text-ui-muted text-[10px] uppercase">Baseline Acc:</span>
              <span className="font-bold">—</span>
            </div>
            <div className="flex justify-between border-b border-ui-border/30 pb-1.5">
              <span className="text-ui-muted text-[10px] uppercase">Avg Latency:</span>
              <span className="font-bold">182 ms</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-ui-muted uppercase tracking-wider mb-3">Score Breakdown</div>
        
        <div className="space-y-2.5 text-[11px]">
          <ScoreItem label="Input Validation" score={validationScore} />
          <ScoreItem label="Boundary Handling" score={validationScore} />
          
          <div className={`flex items-center justify-between group transition-colors ${isHighRisk ? 'row-active-alert' : ''}`}>
            <span className={`w-32 truncate transition-colors ${isHighRisk ? 'text-ui-alert' : 'group-hover:text-ui-alert'}`}>Encoding Robustness</span>
            <div className="flex-1 flex h-[8px] mx-2 bg-surface-base border border-ui-border/30 transition-all duration-500">
              <div className={`transition-all duration-500 ${isHighRisk ? 'bg-ui-alert' : 'bg-ui-text'}`} style={{ width: `${encScore}%` }}></div>
              <div className={`bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,currentColor_2px,currentColor_4px)] text-ui-border opacity-50 transition-all duration-500`} style={{ width: `${100 - encScore}%` }}></div>
            </div>
            <span className={`w-6 text-right font-bold transition-colors ${isHighRisk ? 'text-ui-alert' : ''}`}>{encScore}</span>
          </div>

          <ScoreItem label="Perturbation Stability" score={perturbationScore} />
          <ScoreItem label="Prompt Safety" score={perturbationScore} />
          <ScoreItem label="Error Handling" score={malformedScore} />
        </div>

        <div className="mt-4 pt-3 border-t border-ui-border flex justify-between items-end">
          <span className="text-ui-muted text-[10px] uppercase">Overall Rating</span>
          <div className="text-right">
            <span className="text-xl font-bold tracking-tighter">{overallRating}</span>
            <span className={`text-[10px] ml-2 font-bold ${isHighRisk ? 'text-ui-alert animate-pulse' : 'text-ui-text'}`}>{riskLevel}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

const ScoreItem = ({ label, score }: { label: string, score: number }) => (
  <div className="flex items-center justify-between">
    <span className="w-32 truncate">{label}</span>
    <div className="flex-1 flex h-[8px] mx-2 bg-surface-base border border-ui-border/30">
      <div className="bg-ui-text" style={{ width: `${score}%` }}></div>
      <div className="bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,currentColor_2px,currentColor_4px)] text-ui-border opacity-50" style={{ width: `${100 - score}%` }}></div>
    </div>
    <span className="w-6 text-right font-bold">{score}</span>
  </div>
);
