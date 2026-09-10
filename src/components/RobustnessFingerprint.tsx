import { useAppContext } from '../AppContext';

export const RobustnessFingerprint = () => {
  const { attacks, metrics, baselinePosProb } = useAppContext();

  const getScore = (categoryPrefix: string) => {
    const categoryAttacks = attacks.filter(a => a.category.startsWith(categoryPrefix) || (categoryPrefix === 'Adversarial' && a.category === 'Manual Injections'));
    if (categoryAttacks.length === 0) return null;
    
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
    
    if (executedCount === 0) return null;
    return Math.floor((defendedCount / executedCount) * 100);
  };

  const validationRaw = getScore('Boundary');
  const encRaw = getScore('Encoding');
  const perturbationRaw = getScore('Adversarial');
  const malformedRaw = getScore('Malformed');
  
  // Only average active scores
  const activeScores = [validationRaw, encRaw, perturbationRaw, malformedRaw].filter(s => s !== null) as number[];
  const executedAny = activeScores.length > 0;
  const overallAvg = executedAny ? Math.floor(activeScores.reduce((a, b) => a + b, 0) / activeScores.length) : 0;
  const isHighRisk = executedAny && overallAvg < 50;

  // For the UI display, default to 0 if untested
  const validationScore = validationRaw || 0;
  const encScore = encRaw || 0;
  const perturbationScore = perturbationRaw || 0;
  const malformedScore = malformedRaw || 0;

  // Radar chart points
  const getPoint = (angleDeg: number, score: number | null) => {
    const r = score === null ? 0 : Math.max(score / 100 * 50, 5); // min radius of 5 so it doesn't vanish completely if 0%
    const rad = (angleDeg - 90) * (Math.PI / 180);
    const x = 70 + r * Math.cos(rad);
    const y = 70 + r * Math.sin(rad);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  };

  const p1 = getPoint(0, validationRaw);
  const p2 = getPoint(60, validationRaw);
  const p3 = getPoint(120, encRaw);
  const p4 = getPoint(180, perturbationRaw);
  const p5 = getPoint(240, perturbationRaw);
  const p6 = getPoint(300, malformedRaw);

  const points = !executedAny ? "70,60 80,65 80,75 70,80 60,75 60,65" : `${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`;
  
  // Extract encoding dot coords from p3
  const [encDotCx, encDotCy] = p3.split(',');

  const overallRating = executedAny ? `${overallAvg}/100` : `—/100`;
  const riskLevel = !executedAny ? "— UNTESTED" : overallAvg < 50 ? "— HIGH RISK" : overallAvg < 80 ? "— MODERATE RISK" : "— LOW RISK";

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

              <text x="70" y="14" fill="currentColor" textAnchor="middle" className={`transition-colors font-bold ${validationRaw !== null && validationRaw < 50 ? 'text-ui-alert' : 'text-ui-muted'}`}>VAL</text>
              <text x="117" y="47" fill="currentColor" textAnchor="start" className={`transition-colors font-bold ${validationRaw !== null && validationRaw < 50 ? 'text-ui-alert' : 'text-ui-muted'}`}>BND</text>
              <text x="117" y="97" fill="currentColor" textAnchor="start" className={`transition-colors font-bold ${encRaw !== null && encRaw < 50 ? 'text-ui-alert' : 'text-ui-muted'}`}>ENC</text>
              <text x="70" y="130" fill="currentColor" textAnchor="middle" className={`transition-colors font-bold ${perturbationRaw !== null && perturbationRaw < 50 ? 'text-ui-alert' : 'text-ui-muted'}`}>PRT</text>
              <text x="23" y="97" fill="currentColor" textAnchor="end" className={`transition-colors font-bold ${perturbationRaw !== null && perturbationRaw < 50 ? 'text-ui-alert' : 'text-ui-muted'}`}>SAF</text>
              <text x="23" y="47" fill="currentColor" textAnchor="end" className={`transition-colors font-bold ${malformedRaw !== null && malformedRaw < 50 ? 'text-ui-alert' : 'text-ui-muted'}`}>ERR</text>

              <polygon 
                points={points} 
                fill={isHighRisk ? "rgb(var(--col-alert))" : "rgb(var(--col-text))"} 
                fillOpacity="0.15" 
                stroke={isHighRisk ? "rgb(var(--col-alert))" : "rgb(var(--col-text))"} 
                strokeWidth="1.5" 
                style={{ transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              
              {!isHighRisk && executedAny && (
                <circle 
                  cx={encDotCx} 
                  cy={encDotCy} 
                  r="2.5" 
                  fill="rgb(var(--col-text))"
                  style={{ transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              )}
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
              <span className="font-bold">{baselinePosProb ? `${(baselinePosProb * 100).toFixed(1)}%` : '—'}</span>
            </div>
            <div className="flex justify-between border-b border-ui-border/30 pb-1.5">
              <span className="text-ui-muted text-[10px] uppercase">Avg Latency:</span>
              <span className="font-bold">{executedAny ? metrics.latency : '—'}</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-ui-muted uppercase tracking-wider mb-3">Score Breakdown</div>
        
        <div className="space-y-2.5 text-[11px]">
          <ScoreItem label="Input Validation" score={validationScore} active={validationRaw !== null} />
          <ScoreItem label="Boundary Handling" score={validationScore} active={validationRaw !== null} />
          
          <ScoreItem label="Encoding Robustness" score={encScore} active={encRaw !== null} />

          <ScoreItem label="Perturbation Stability" score={perturbationScore} active={perturbationRaw !== null} />
          <ScoreItem label="Prompt Safety" score={perturbationScore} active={perturbationRaw !== null} />
          <ScoreItem label="Error Handling" score={malformedScore} active={malformedRaw !== null} />
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

const ScoreItem = ({ label, score, active }: { label: string, score: number, active: boolean }) => (
  <div className={`flex items-center justify-between transition-colors ${!active ? 'opacity-30' : ''}`}>
    <span className="w-32 truncate">{label}</span>
    <div className="flex-1 flex h-[8px] mx-2 bg-surface-base border border-ui-border/30">
      <div className="bg-ui-text transition-all duration-500" style={{ width: `${active ? score : 0}%` }}></div>
      <div className="bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,currentColor_2px,currentColor_4px)] text-ui-border opacity-50 transition-all duration-500" style={{ width: `${active ? (100 - score) : 100}%` }}></div>
    </div>
    <span className="w-6 text-right font-bold">{active ? score : '—'}</span>
  </div>
);
