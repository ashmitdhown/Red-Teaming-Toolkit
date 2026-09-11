import { useAppContext } from '../AppContext';
import { motion } from 'framer-motion';

export const RedTeamAgent = () => {
  const { attacks, selectedAttackId, setSelectedAttackId, deleteAttack } = useAppContext();

  // Group attacks by category
  const categories = Array.from(new Set(attacks.map(a => a.category)));

  return (
    <div className="flex-1 bg-surface-panel relative flex flex-col overflow-hidden">
      <div className="crosshair-corner crosshair-tr"></div>
      <div className="h-10 border-b border-ui-border flex items-center px-4 bg-surface-alt shrink-0 justify-between">
        <span className="font-mono text-xs font-bold text-ui-muted">MODULE: ATTACK_VECTORS</span>
        <span className="font-mono text-[10px] text-ui-muted opacity-50">PAYLOAD_LIBRARY</span>
      </div>
      
      <div className="flex-1 p-5 font-mono text-ui-text overflow-auto selectable flex flex-col gap-6">
        {categories.map((category) => (
          <div key={category} className="flex flex-col gap-2">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-ui-muted border-b border-ui-border/30 pb-1 mb-1">{category}</h3>
            <div className="flex flex-col gap-[1px]">
              {attacks.filter(a => a.category === category).map((attack) => {
                const isSelected = attack.id === selectedAttackId;
                const isExecuted = attack.status === 'DONE';
                
                return (
                  <div
                    key={attack.id}
                    className={`text-left text-xs px-3 py-2 transition-all flex justify-between items-center group ${
                      isSelected 
                        ? 'bg-ui-alert/10 border-l-[3px] border-ui-alert text-ui-text font-bold -ml-[3px]' 
                        : 'hover:bg-surface-alt border-l-[3px] border-transparent text-ui-muted'
                    }`}
                  >
                    <button 
                       className="flex-1 text-left cursor-pointer"
                       onClick={() => setSelectedAttackId(selectedAttackId === attack.id ? null : attack.id)}
                    >
                      <span>{attack.id}. {attack.name}</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {attack.status === 'EXECUTING' && (
                         <span className="text-ui-alert animate-pulse text-[9px] uppercase tracking-widest">RUNNING...</span>
                      )}
                      
                      {isExecuted && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                          attack.defendedStatus === 'Defended' ? 'bg-ui-ok/10 text-ui-ok border border-ui-ok/20' :
                          attack.defendedStatus === 'NOT Defended' ? 'bg-ui-alert/10 text-ui-alert border border-ui-alert/20' :
                          'bg-ui-text/5 text-ui-muted border border-ui-border/50'
                        }`}>
                          {attack.defendedStatus === 'Defended' ? 'DEF' : attack.defendedStatus === 'NOT Defended' ? 'VULN' : 'CTRL'}
                        </span>
                      )}
                      {category === 'Manual Injections' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteAttack(attack.id); }}
                          className="ml-2 px-1 text-ui-muted/30 hover:text-ui-alert transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Delete Payload"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
