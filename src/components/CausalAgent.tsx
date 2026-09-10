import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export const CausalAgent = () => {
  const { appState, attacks, selectedAttackId } = useAppContext();
  
  const activeAttack = attacks.find(a => a.id === selectedAttackId);
  const showFindings = activeAttack && activeAttack.status === 'DONE';

  const getExplanation = () => {
    if (!activeAttack) return null;
    const isVulnerable = activeAttack.defendedStatus === 'NOT Defended';
    
    if (activeAttack.category.includes('Boundary')) {
      return {
        title: 'Type Confusion / Boundary',
        severity: isVulnerable ? 'HIGH' : 'LOW',
        observed: isVulnerable ? 'The endpoint accepted an invalid type payload and returned HTTP 200.' : 'The endpoint correctly rejected the invalid payload with HTTP 422.',
        cause: isVulnerable ? 'The API lacks strict schema validation on the input body.' : 'FastAPI Pydantic strict schema validation caught the malformed type.',
        fix: isVulnerable ? 'Implement strict type validation using Pydantic schemas.' : 'Schema validation is working as intended.'
      };
    }
    
    if (activeAttack.category.includes('Encoding')) {
      return {
        title: 'Encoding Manipulation',
        severity: isVulnerable ? 'CRITICAL' : 'LOW',
        observed: isVulnerable ? 'The prediction flipped due to invisible or homoglyph characters.' : 'The model maintained its baseline prediction.',
        cause: isVulnerable ? 'The tokenization pipeline processes invisible characters as meaningful tokens.' : 'The pipeline successfully normalizes unicode characters.',
        fix: isVulnerable ? 'Apply strict Unicode normalization (NFKC) before tokenization.' : 'Continue normalizing inputs.'
      };
    }
    
    return {
      title: 'Adversarial Manipulation',
      severity: isVulnerable ? 'HIGH' : 'LOW',
      observed: isVulnerable ? 'The payload successfully bypassed intended logic.' : 'The payload was neutralized or caught.',
      cause: isVulnerable ? 'The model is susceptible to semantic perturbations.' : 'The model robustness generalized well to the perturbation.',
      fix: isVulnerable ? 'Include adversarial examples in the fine-tuning dataset.' : 'N/A'
    };
  };

  const exp = getExplanation();

  return (
    <div className="flex-[1.2] bg-surface-panel relative flex flex-col overflow-hidden">
      <div className="h-10 border-b border-ui-border flex items-center px-4 bg-surface-alt shrink-0 justify-between">
        <span className="font-mono text-xs font-bold text-ui-text flex items-center gap-2">
          <svg className="w-3 h-3 text-ui-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          "WHY DID THIS WORK?" AGENT
        </span>
      </div>
      <div className="flex-1 p-4 overflow-auto selectable relative">
        <AnimatePresence mode="wait">
          {!showFindings || !exp ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-ui-muted font-mono text-[11px] bg-surface-panel z-10"
            >
              <svg className={`w-8 h-8 mb-3 opacity-20 ${appState === 'ATTACKING' ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
              <span>{appState === 'ATTACKING' ? 'ANALYZING VULNERABILITY...' : 'WAITING FOR EXECUTION...'}</span>
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-ui-border rounded-sm p-4 bg-surface-base font-mono text-[11px] shadow-sm h-full flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-ui-muted tracking-widest text-[10px]">FINDING FOR: {activeAttack.name.toUpperCase()}</span>
                <button className="text-ui-muted hover:text-ui-text transition-colors" title="Copy to clipboard">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
              
              <div className="font-bold text-sm text-ui-text mb-1">{exp.title}</div>
              <div className="mb-5 text-ui-text">Severity: <span className={exp.severity === 'LOW' ? 'text-ui-ok font-bold' : 'text-ui-alert font-bold'}>{exp.severity}</span></div>

              <div className="text-ui-muted mb-1 uppercase text-[10px] tracking-widest">Observed:</div>
              <div className="mb-4 text-ui-text leading-relaxed">{exp.observed}</div>

              <div className="text-ui-muted mb-1 uppercase text-[10px] tracking-widest">Likely Cause:</div>
              <div className="mb-4 text-ui-text leading-relaxed">{exp.cause}</div>

              <div className="text-ui-muted mb-1 uppercase text-[10px] tracking-widest mt-auto">Recommended Fix:</div>
              <div className={`leading-relaxed border-l-2 pl-2 py-1 ${exp.severity === 'LOW' ? 'border-ui-muted text-ui-muted bg-surface-alt' : 'text-ui-ok border-ui-ok bg-ui-ok/5'}`}>
                {exp.fix}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
