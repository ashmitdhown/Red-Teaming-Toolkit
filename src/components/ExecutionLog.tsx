import { useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext';
import { motion } from 'framer-motion';

export const ExecutionLog = () => {
  const { logs, clearLogs } = useAppContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex-1 bg-surface-panel relative flex flex-col min-h-0 border border-ui-border/50 rounded-xl shadow-lg">
      <div className="h-10 border-b border-ui-border/50 flex items-center px-4 bg-slate-800/50 justify-between rounded-t-xl border-t-2 border-t-cyan-500/50">
        <span className="font-mono text-xs font-bold text-cyan-400">EXECUTION_LOG</span>
        <button onClick={clearLogs} className="font-mono text-[10px] text-cyan-300/50 hover:text-cyan-400 transition-colors">
          CLEAR
        </button>
      </div>
      <div className="flex-1 bg-surface-alt overflow-y-auto p-4 font-mono text-xs leading-relaxed text-ui-text selectable">
        {logs.map((log) => {
          let colorCls = 'text-ui-muted';
          let prefix = '[i]';
          if (log.type === 'success') {
            colorCls = 'text-ui-text font-bold';
            prefix = '[+]';
          }
          if (log.type === 'alert') {
            colorCls = 'text-ui-alert font-bold bg-ui-alert/10 border-l-2 border-ui-alert pl-2 -ml-[8px] py-1 my-1';
            prefix = '[!]';
          }

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className={`mb-2 ${colorCls}`}
            >
              <span className="text-gray-400 mr-2 opacity-70">{log.time}</span>
              <span>{prefix} {log.message}</span>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
