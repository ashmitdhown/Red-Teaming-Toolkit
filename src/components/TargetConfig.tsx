import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useAppContext, TARGET_CONFIGS } from '../AppContext';
import type { TargetType } from '../AppContext';

const NLP_DEFAULT_JSON = `{
  "text": "I love this product"
}`;

export const TargetConfig = () => {
  const {
    attacks, selectedAttackId, endpointStatus, testEndpoint, updateAttackPayload,
    targetType, setTargetType, targetUrl, setTargetUrl,
    imageFile, setImageFile,
    addLog, markAttackStatus, updateAttackResult, addAttack
  } = useAppContext();

  const activeAttack = attacks.find(a => a.id === selectedAttackId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nlpJson, setNlpJson] = useState(NLP_DEFAULT_JSON);
  const [isSending, setIsSending] = useState(false);

  // Sync textarea when a payload-library attack is selected
  useEffect(() => {
    if (activeAttack) setNlpJson(activeAttack.payload);
  }, [selectedAttackId]);

  
  const evaluateDefense = (status: number, data: any) => {
    if (status === 500) return { res: 'HTTP 500 (Server Crash)', def: 'NOT Defended', isDef: false };
    if (status === 422 || status === 400 || status === 405) return { res: `HTTP ${status} (Validation Error)`, def: 'Defended', isDef: true };
    if (status >= 200 && status < 300) {
      const conf = data.confidence || 0;
      const label = data.label || 'unknown';
      // Manual sends count as NOT defended if they get through validation, for simplicity, 
      // or we just say 'Inconclusive' unless it's the control.
      return { res: `Label: ${label} (Conf: ${conf.toFixed(2)})`, def: 'NOT Defended', isDef: false };
    }
    return { res: `HTTP ${status} (Unknown)`, def: 'Inconclusive', isDef: false };
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetType(e.target.value as TargetType);
    setImagePreview(null);
  };

  const handleNlpChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNlpJson(val);
    if (activeAttack) updateAttackPayload(activeAttack.id, val);
  };

  // ── NLP Send ────────────────────────────────────────────────────
  const handleSendNlp = async () => {
    setIsSending(true);
    
    // Create manual attack if none is selected
    let attackId = activeAttack?.id;
    if (!attackId) {
      attackId = 'manual-' + Date.now();
      addAttack({
        id: attackId,
        name: 'Manual Payload',
        category: 'Manual Injections',
        payload: nlpJson,
        expectedResult: 'N/A',
        defendedStatus: 'Inconclusive',
        status: 'IDLE'
      });
    }
    
    markAttackStatus(attackId, 'EXECUTING');
    addLog(`Sending NLP payload → ${targetUrl}`, 'info');
    
    try {
      const body = JSON.parse(nlpJson);
      const res = await fetch('/api/nlp/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      addLog(`Response [${res.status}]: ${JSON.stringify(data)}`, res.ok ? 'success' : 'warning');
      
      const { res: resultText, def } = evaluateDefense(res.status, data);
      updateAttackResult(attackId, resultText, def as any);
      markAttackStatus(attackId, 'DONE');
      
    } catch (err) {
      if (err instanceof SyntaxError) {
        addLog('Invalid JSON — check your input format.', 'alert');
      } else {
        addLog(`Send failed: ${err instanceof Error ? err.message : String(err)}`, 'alert');
      }
      markAttackStatus(attackId, 'DONE');
    } finally {
      setIsSending(false);
    }
  };

  // ── Image Send ──────────────────────────────────────────────────
  const handleSendImage = async () => {
    if (!imageFile) return;
    setIsSending(true);
    
    let attackId = activeAttack?.id;
    if (!attackId) {
      attackId = 'manual-img-' + Date.now();
      addAttack({
        id: attackId,
        name: 'Manual Image: ' + imageFile.name,
        category: 'Manual Injections',
        payload: 'Image data',
        expectedResult: 'N/A',
        defendedStatus: 'Inconclusive',
        status: 'IDLE'
      });
    }
    
    markAttackStatus(attackId, 'EXECUTING');
    addLog(`Sending image "${imageFile.name}" → ${targetUrl}`, 'info');
    
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      const res = await fetch('/api/image/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      addLog(`Response [${res.status}]: ${JSON.stringify(data)}`, res.ok ? 'success' : 'warning');
      
      const { res: resultText, def } = evaluateDefense(res.status, data);
      updateAttackResult(attackId, resultText, def as any);
      markAttackStatus(attackId, 'DONE');
      
    } catch (err) {
      addLog(`Send failed: ${err instanceof Error ? err.message : String(err)}`, 'alert');
      markAttackStatus(attackId, 'DONE');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const lineCount = Math.max(nlpJson.split('\n').length, 8);

  const statusColor =
    endpointStatus === 'ONLINE'  ? 'text-ui-ok' :
    endpointStatus === 'TESTING' ? 'text-ui-alert animate-pulse' :
    endpointStatus === 'OFFLINE' ? 'text-ui-alert' :
    'text-ui-muted';

  const SendButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled || isSending}
      className="w-full font-mono text-[10px] tracking-widest border border-ui-border py-2 bg-surface-panel text-ui-text hover:bg-ui-accent hover:border-ui-accent hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
    >
      {isSending ? (
        <>
          <span className="inline-block w-2 h-2 border border-current border-t-transparent rounded-full animate-spin"/>
          SENDING...
        </>
      ) : '[ SEND ]'}
    </button>
  );

  return (
    <div className="flex-1 bg-surface-panel relative flex flex-col overflow-hidden group">
      <div className="crosshair-corner crosshair-tl"></div>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="h-10 border-b border-ui-border flex items-center px-4 bg-surface-alt shrink-0 justify-between">
        <span className="font-mono text-xs font-bold text-ui-muted tracking-widest">
          MODULE: TARGET_CONFIGURATION
        </span>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-[9px] tracking-widest ${statusColor}`}>
            STATUS: {endpointStatus}
          </span>
          <button
            onClick={testEndpoint}
            disabled={endpointStatus === 'TESTING'}
            className="text-[9px] text-ui-text border border-ui-border px-2 py-0.5 bg-surface-base hover:bg-ui-text hover:text-surface-base transition-colors tracking-widest disabled:opacity-50 cursor-pointer"
          >
            [ TEST CONNECTION ]
          </button>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-surface-base p-4 gap-4 selectable">

        {/* ── Target Type ──────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] text-ui-muted tracking-widest uppercase">Target Type</label>
          <div className="relative">
            <select
              id="target-type-select"
              value={targetType}
              onChange={handleTypeChange}
              className="w-full appearance-none font-mono text-xs text-ui-text bg-surface-panel border border-ui-border px-3 py-2 pr-8 focus:outline-none focus:border-ui-accent transition-colors cursor-pointer"
            >
              {(Object.entries(TARGET_CONFIGS) as [TargetType, typeof TARGET_CONFIGS[TargetType]][]).map(
                ([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>
              )}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ui-muted" width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* ── Target URL ───────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] text-ui-muted tracking-widest uppercase">Target URL</label>
          <input
            id="target-url-input"
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full font-mono text-[11px] text-ui-text bg-surface-panel border border-ui-border px-3 py-2 focus:outline-none focus:border-ui-accent transition-colors placeholder:text-ui-muted/40"
            placeholder="https://..."
            spellCheck={false}
          />
        </div>

        {/* ── Input ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="font-mono text-[10px] text-ui-muted tracking-widest uppercase">Input</label>

          {targetType === 'nlp' ? (
            <div className="flex flex-col gap-3 flex-1">
              {/* JSON editor with line numbers */}
              <div className="flex border border-ui-border" style={{ minHeight: '160px' }}>
                <div className="w-8 shrink-0 bg-surface-alt border-r border-ui-border text-right pr-2 py-3 text-ui-muted/50 text-[11px] leading-[20px] select-none font-mono overflow-hidden">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <React.Fragment key={i}>{i + 1}<br /></React.Fragment>
                  ))}
                </div>
                <textarea
                  id="nlp-json-editor"
                  className="flex-1 p-3 bg-transparent text-ui-text outline-none resize-none font-mono text-[11px] leading-[20px] focus:bg-surface-panel transition-colors selectable"
                  value={nlpJson}
                  onChange={handleNlpChange}
                  spellCheck={false}
                  rows={lineCount}
                />
              </div>

              <p className="font-mono text-[9px] text-ui-muted/50 leading-relaxed">
                Expected format: <span className="text-ui-muted">{'{ "text": "..." }'}</span>
              </p>

              <SendButton onClick={handleSendNlp} />
            </div>

          ) : (
            <div className="flex flex-col gap-3 flex-1">
              {/* Drop zone */}
              <div
                id="image-drop-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed cursor-pointer min-h-[160px] transition-all duration-200 select-none ${
                  dragOver
                    ? 'border-ui-accent bg-ui-accent/5 scale-[1.01]'
                    : 'border-ui-border hover:border-ui-accent/60 hover:bg-surface-panel'
                }`}
              >
                {imagePreview ? (
                  <div className="flex flex-col items-center gap-2 w-full px-4">
                    <img src={imagePreview} alt="preview" className="max-h-[120px] max-w-full object-contain border border-ui-border"/>
                    <span className="font-mono text-[9px] text-ui-muted truncate max-w-[90%]">{imageFile?.name}</span>
                  </div>
                ) : (
                  <>
                    <svg className={`w-8 h-8 transition-colors ${dragOver ? 'text-ui-accent' : 'text-ui-muted/40'}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-mono text-[11px] text-ui-muted tracking-wide">Drop image here</span>
                      <span className="font-mono text-[9px] text-ui-muted/50 tracking-widest">or choose a file</span>
                    </div>
                    <div className="absolute inset-0 pointer-events-none">
                      <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-ui-accent/30"/>
                      <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-ui-accent/30"/>
                      <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-ui-accent/30"/>
                      <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-ui-accent/30"/>
                    </div>
                  </>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />

              <SendButton onClick={handleSendImage} disabled={!imageFile} />

              {imageFile && (
                <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="font-mono text-[9px] text-ui-muted/60 hover:text-ui-alert tracking-widest text-center transition-colors cursor-pointer">
                  ✕ clear image
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
