import React from 'react';

export const TargetConfig = () => {
  return (
    <div className="flex-1 bg-surface-panel relative flex flex-col overflow-hidden group">
      <div className="crosshair-corner crosshair-tl"></div>
      <div className="h-10 border-b border-ui-border flex items-center px-4 bg-surface-alt shrink-0 justify-between">
        <span className="font-mono text-xs font-bold text-ui-muted">MODULE: TARGET_CONFIGURATION</span>
        <span className="text-[9px] text-ui-muted border border-ui-border px-1.5 py-0.5 bg-surface-base opacity-0 group-hover:opacity-100 transition-opacity tracking-widest">EDITABLE_BUFFER</span>
      </div>
      <div className="flex-1 flex overflow-hidden bg-surface-base">
        {/* Line Numbers */}
        <div className="w-8 shrink-0 bg-surface-alt border-r border-ui-border text-right pr-2 py-3 text-ui-muted/50 text-[11px] leading-[20px] select-none font-mono border-b border-ui-border/30">
          {[...Array(14)].map((_, i) => (
            <React.Fragment key={i}>{i + 1}<br/></React.Fragment>
          ))}
        </div>
        {/* Editor */}
        <div 
          className="flex-1 p-3 overflow-auto font-mono text-[11px] leading-[20px] text-ui-text outline-none whitespace-pre border-b border-ui-border/30 focus-within:bg-surface-panel transition-colors" 
          contentEditable 
          spellCheck={false}
          suppressContentEditableWarning
        >
          <span className="text-ui-muted"># Target Endpoint Definition (YAML)</span>{'\n'}
          <span className="text-ui-accent font-bold">endpoint:</span> "https://my-api.com/predict"{'\n'}
          <span className="text-ui-accent font-bold">method:</span> "POST"{'\n'}
          {'\n'}
          <span className="text-ui-muted"># Dynamic Input Schema</span>{'\n'}
          <span className="text-ui-accent font-bold">input_schema:</span>{'\n'}
          {'  '}<span className="text-ui-text opacity-80">text:</span> <span className="text-ui-ok">"{'{'}{'{'}INPUT{'}'}{'}'}"</span>{'\n'}
          {'\n'}
          <span className="text-ui-muted"># Expected Valid Output</span>{'\n'}
          <span className="text-ui-accent font-bold">expected_output:</span>{'\n'}
          {'  '}<span className="text-ui-text opacity-80">label:</span> <span className="text-ui-ok">"{'{'}{'{'}LABEL{'}'}{'}'}"</span>{'\n'}
          {'  '}<span className="text-ui-text opacity-80">confidence:</span> <span className="text-ui-ok">"{'{'}{'{'}CONFIDENCE{'}'}{'}'}"</span>{'\n'}
          {'\n'}
          <span className="inline-block w-[6px] h-[14px] bg-ui-text animate-pulse align-middle"></span>
        </div>
      </div>
    </div>
  );
};
