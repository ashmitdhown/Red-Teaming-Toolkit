import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../AppContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  isArabic: boolean;
  isAction?: boolean; // true for AI-executed workspace actions
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const isArabicText = (text: string): boolean => {
  const arabicRange = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const arabicChars = (text.match(arabicRange) || []).length;
  return arabicChars > text.length * 0.2;
};
const getTimestamp = () => new Date().toISOString().split('T')[1].substring(0, 8);
const uid = () => Math.random().toString(36).substring(2, 9);

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------
const buildSystemPrompt = (context: {
  selectedAttack: string | null;
  endpointStatus: string;
  appState: string;
  logCount: number;
  lang: 'EN' | 'AR';
  attacks: { id: string; name: string; category: string }[];
}) => `You are AEGIS-AI, an expert AI red-teaming assistant AND agentic operator embedded inside the AEGIS-GHOST workspace — a UAE-focused adversarial testing toolkit for deployed AI inference endpoints.

WORKSPACE STATE:
- Selected Attack Vector: ${context.selectedAttack ?? 'None selected'}
- Target Endpoint Status: ${context.endpointStatus}
- Current App State: ${context.appState}
- Execution Log Entries: ${context.logCount}

LOADED ATTACK VECTORS:
${context.attacks.map(a => `  [${a.id}] ${a.name} (${a.category})`).join('\n')}

YOUR TOOL CAPABILITIES (use these to act, not just describe):
• execute_attack → run a specific vector by ID or name
• run_all_attacks → start the full attack sequence
• select_attack → highlight an attack without executing
• test_endpoint → ping the target to check connectivity
• clear_logs → wipe the execution log
• reset_app → restore workspace to initial state
• switch_target → change target between nlp/image

When the user asks you to run, execute, fire, launch, ping, clear, reset, or switch — USE THE TOOL instead of describing it.

YOUR EXPERTISE:
1. Adversarial ML: BiDi overrides (U+202E), Unicode homoglyphs, Tashkeel injection (U+064E-U+0652), ZWNJ token splitting (U+200C)
2. Jensen-Shannon Divergence (JSD) for silent prediction flip detection — threshold 0.40
3. UAE regulatory: DESC ISR v2/v3.1, CBUAE Consumer Protection Art.6.3, SAMA CSF, Federal Decree-Law No.34/2021, TDRA IA T-IA-01.1
4. API security: type confusion, IEEE 754 edge cases (NaN, Infinity), deep JSON recursion, schema boundary testing
5. OWASP LLM Top 10 (2025), CVSS-ML severity: Critical=HTTP500, High=Silent Flip, Medium=JSD drift >2sigma
6. FastAPI/Pydantic v2 defensive gateway patterns, NFKC normalization
7. Arabic NLP vectors: Arabizi fragmentation, Arabic prompt injection, mixed-script attacks

RESPONSE STYLE:
- Concise and precise — terminal UI
- Technical language for security engineers
- Cite UAE regulations with article numbers
- Under 200 words unless detail explicitly requested
- No markdown headers — use plain structured text

${context.lang === 'AR'
  ? 'LANGUAGE: Respond in Arabic (Modern Standard Arabic). Include English technical terms where necessary.'
  : 'LANGUAGE: Respond in English.'}`;


// ---------------------------------------------------------------------------
// Quick Prompts
// ---------------------------------------------------------------------------
// Knowledge quick-prompts
const QUICK_PROMPTS = [
  { label: 'BiDi injection?', text: 'Explain how BiDi override injection works and why it bypasses WAFs', isArabic: false },
  { label: 'JSD > 0.40?', text: 'What does Jensen-Shannon Divergence above 0.40 mean for a deployed model?', isArabic: false },
  { label: 'DESC mapping', text: 'Map a silent prediction flip to DESC ISR v2 controls with article numbers', isArabic: false },
  { label: 'اشرح هجمات البيدي', text: 'اشرح هجمات الترميز البيدي وكيف تؤثر على نماذج الذكاء الاصطناعي', isArabic: true },
  { label: 'ما هو JSD؟', text: 'ما هو Jensen-Shannon Divergence وكيف يكشف الانقلابات الصامتة؟', isArabic: true },
];

// Action quick-prompts (trigger agentic tool calls)
const ACTION_PROMPTS = [
  { label: '⚡ Run all attacks', text: 'Run the full attack sequence now' },
  { label: '⚡ Ping endpoint', text: 'Test the target endpoint connection' },
  { label: '⚡ Reset workspace', text: 'Reset the workspace to initial state' },
  { label: '⚡ Clear logs', text: 'Clear the execution log' },
];

// ---------------------------------------------------------------------------
// Groq API
// ---------------------------------------------------------------------------
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL   = 'openai/gpt-oss-20b';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';

// ---------------------------------------------------------------------------
// Agentic Tool Definitions (OpenAI-compatible function calling)
// ---------------------------------------------------------------------------
const TOOLS = [
  { type: 'function', function: { name: 'execute_attack', description: 'Execute a specific attack vector against the target AI endpoint. Use when the user says run, execute, fire, launch, or test a specific attack by name or ID.', parameters: { type: 'object', properties: { id: { type: 'string', description: 'Numeric attack ID e.g. "9"' }, name: { type: 'string', description: 'Partial attack name for fuzzy match e.g. "bidi", "sarcasm"' } } } } },
  { type: 'function', function: { name: 'run_all_attacks', description: 'Run the full attack sequence — all loaded vectors in order. Use when user says run all, start sequence, launch all vectors, or attack everything.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'select_attack', description: 'Select (highlight) a specific attack in the Attack Vectors panel without running it.', parameters: { type: 'object', properties: { id: { type: 'string', description: 'Attack ID' }, name: { type: 'string', description: 'Partial attack name' } } } } },
  { type: 'function', function: { name: 'test_endpoint', description: 'Ping the target endpoint to check if it is online. Use when user says test, ping, or check the endpoint/connection.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'clear_logs', description: 'Clear the execution log. Use when user says clear logs, reset log, or wipe the log.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'reset_app', description: 'Reset the entire workspace — all attack statuses, metrics, and logs return to initial state.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'switch_target', description: 'Switch the target AI endpoint between NLP sentiment and image classification.', parameters: { type: 'object', properties: { type: { type: 'string', enum: ['nlp', 'image'], description: 'Target type' } }, required: ['type'] } } },
];

type GroqResult =
  | { type: 'text'; content: string }
  | { type: 'tool_call'; toolName: string; toolArgs: Record<string, any> };

const callGroqWithTools = async (history: Message[], systemPrompt: string, userMessage: string): Promise<GroqResult> => {
  if (!GROQ_API_KEY) return { type: 'text', content: getFallbackResponse(userMessage) };

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages, tools: TOOLS, tool_choice: 'auto', temperature: 0.7, max_tokens: 512 }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();

  const choice = data.choices?.[0];
  if (choice?.finish_reason === 'tool_calls' && choice?.message?.tool_calls?.length > 0) {
    const tc = choice.message.tool_calls[0];
    let args: Record<string, any> = {};
    try { args = JSON.parse(tc.function.arguments || '{}'); } catch { /* ignore */ }
    return { type: 'tool_call', toolName: tc.function.name, toolArgs: args };
  }

  return { type: 'text', content: choice?.message?.content ?? '[No response]' };
};

// ---------------------------------------------------------------------------
// FAQ Fallback
// ---------------------------------------------------------------------------
const getFallbackResponse = (query: string): string => {
  const q = query.toLowerCase();
  if (q.includes('bidi') || q.includes('بيدي') || q.includes('ترميز')) {
    return `BiDi Override Injection exploits Unicode bidirectional control chars (U+202E).\n\nAttack:\n→ Inject \\u202E before a malicious sequence\n→ WAFs see visually reversed (harmless) text\n→ Tokenizer processes raw Unicode — including the payload\n\nResult: Classification flip with HTTP 200. JSD typically > 0.55.\nFix: NFKC normalization + strip BiDi controls before tokenization.`;
  }
  if (q.includes('jsd') || q.includes('jensen') || q.includes('انحراف')) {
    return `JSD measures statistical distance between two probability distributions.\n\nIn AEGIS-GHOST:\n→ P = baseline softmax (clean input)\n→ Q = perturbed softmax (attack input)\n→ JSD ∈ [0,1] base-2\n\nThresholds:\n< 0.20 → Noise\n0.20–0.40 → Significant drift\n> 0.40 → Silent Model Failure (COMPROMISED)\n> 0.60 → Critical adversarial inversion`;
  }
  if (q.includes('desc') || q.includes('cbuae') || q.includes('compliance') || q.includes('امتثال')) {
    return `UAE Compliance Mapping:\n\n• HTTP 500 → DESC ISR v2 Domain 10.2 + CWE-754\n• Silent Flips → OWASP LLM01:2025 + CBUAE Art.6.3\n• BiDi/Encoding → Federal Decree-Law No.34/2021 Art.7\n• Latency DoS → TDRA T-IA-01.1`;
  }
  return `AEGIS-AI running in FAQ mode — no Groq API key detected.\n\nI can answer:\n• BiDi & Unicode injection attacks\n• JSD scoring & silent flip detection\n• UAE regulatory compliance (DESC ISR, CBUAE, SAMA)\n• Arabic NLP adversarial vectors\n• Pydantic v2 defensive gateway patches\n\nTry a quick prompt, or add VITE_GROQ_API_KEY to .env for live AI.`;
};

// ---------------------------------------------------------------------------
// Floating Panel Component
// ---------------------------------------------------------------------------
export const AegisChat = () => {
  const {
    attacks, selectedAttackId, setSelectedAttackId,
    endpointStatus, appState, logs,
    isChatOpen, toggleChat,
    triggerSingleAttack, triggerFullSequence,
    testEndpoint, clearLogs, resetApp, setTargetType,
  } = useAppContext();

  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [lang, setLang]               = useState<'EN' | 'AR'>('EN');
  const [inputIsArabic, setInputIsArabic] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const hasApiKey = !!GROQ_API_KEY;

  const selectedAttack = attacks.find(a => a.id === selectedAttackId);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => { if (isChatOpen) setTimeout(() => inputRef.current?.focus(), 300); }, [isChatOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    setInputIsArabic(isArabicText(val));
  };

  // Dispatches a tool call from AEGIS-AI to the real workspace action
  const executeAction = useCallback(async (toolName: string, toolArgs: Record<string, any>): Promise<string> => {
    switch (toolName) {
      case 'execute_attack': {
        const attack = attacks.find(a =>
          (toolArgs.id && a.id === String(toolArgs.id)) ||
          (toolArgs.name && a.name.toLowerCase().includes(String(toolArgs.name).toLowerCase()))
        );
        if (!attack) return `[ERROR] Attack not found: "${toolArgs.id ?? toolArgs.name}". Valid IDs: 1–${attacks.length}.`;
        setSelectedAttackId(attack.id);
        await triggerSingleAttack(attack.id);
        return `⚡ Executed: "${attack.name}" [ID: ${attack.id}]\nResults posted to Execution Log.`;
      }
      case 'run_all_attacks':
        if (appState === 'ATTACKING') return '[BUSY] Attack sequence already running.';
        triggerFullSequence();
        return `⚡ Full sequence initiated — ${attacks.length} vectors queued.\nMonitor Dispatcher Controls & Execution Log.`;
      case 'select_attack': {
        const attack = attacks.find(a =>
          (toolArgs.id && a.id === String(toolArgs.id)) ||
          (toolArgs.name && a.name.toLowerCase().includes(String(toolArgs.name).toLowerCase()))
        );
        if (!attack) return `[ERROR] Attack not found: "${toolArgs.id ?? toolArgs.name}"`;
        setSelectedAttackId(attack.id);
        return `✓ Selected: "${attack.name}" [ID: ${attack.id}] in Attack Vectors panel.`;
      }
      case 'test_endpoint':
        testEndpoint();
        return `⚡ Pinging target endpoint...\nCheck Endpoint Status in Target Config panel.`;
      case 'clear_logs':
        clearLogs();
        return `✓ Execution log cleared.`;
      case 'reset_app':
        resetApp();
        return `✓ Workspace reset — attacks, metrics, and logs restored to initial state.`;
      case 'switch_target': {
        const t = toolArgs.type as 'nlp' | 'image';
        if (t !== 'nlp' && t !== 'image') return `[ERROR] Invalid target: "${t}". Use "nlp" or "image".`;
        setTargetType(t);
        return `✓ Switched to ${t === 'nlp' ? 'NLP Sentiment' : 'Image Classification'} target.`;
      }
      default:
        return `[ERROR] Unknown action: ${toolName}`;
    }
  }, [attacks, appState, setSelectedAttackId, triggerSingleAttack, triggerFullSequence, testEndpoint, clearLogs, resetApp, setTargetType]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;

    const isArabic = isArabicText(msg);
    const userMsg: Message = { id: uid(), role: 'user', content: msg, time: getTimestamp(), isArabic };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setInputIsArabic(false);
    setIsLoading(true);

    const sysPrompt = buildSystemPrompt({
      selectedAttack: selectedAttack?.name ?? null,
      endpointStatus, appState, logCount: logs.length,
      lang: isArabic ? 'AR' : lang,
      attacks,
    });

    try {
      const result = await callGroqWithTools(messages, sysPrompt, msg);

      if (result.type === 'tool_call') {
        const confirmation = await executeAction(result.toolName, result.toolArgs);
        setMessages(prev => [...prev, {
          id: uid(), role: 'assistant', content: confirmation,
          time: getTimestamp(), isArabic: false, isAction: true,
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: uid(), role: 'assistant', content: result.content,
          time: getTimestamp(), isArabic: isArabicText(result.content),
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: uid(), role: 'assistant',
        content: `[ERROR] ${err instanceof Error ? err.message : 'Unknown error.'}`,
        time: getTimestamp(), isArabic: false,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, selectedAttack, endpointStatus, appState, logs.length, lang, attacks, executeAction]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            drag
            dragMomentum={false}
            dragConstraints={{ left: -1000, right: 0, top: -800, bottom: 0 }}
            key="aegis-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[148px] right-4 z-50 w-[400px] h-[560px] bg-surface-panel border border-ui-border flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_20px_rgba(var(--col-alert),0.08)] cursor-move"
          >
          {/* Crosshair corners */}
          <div className="crosshair-corner crosshair-tl" />
          <div className="crosshair-corner crosshair-tr" />

          {/* Header */}
          <div className="h-10 border-b border-ui-border flex items-center px-4 bg-surface-alt shrink-0 justify-between">
            <div className="flex items-center gap-2">
              <img src="/aegis-logo.png" alt="Aegis AI" className="w-4 h-4 object-contain drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
              <span className="font-mono text-xs font-bold text-ui-text">AEGIS-AI</span>
              <span className="font-mono text-[10px] text-ui-muted">// BILINGUAL ASSIST</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(l => l === 'EN' ? 'AR' : 'EN')}
                className={`font-mono text-[9px] tracking-widest px-1.5 py-0.5 border transition-colors cursor-pointer ${
                  lang === 'AR' ? 'border-ui-accent text-ui-accent bg-ui-accent/10' : 'border-ui-border text-ui-muted hover:text-ui-text'
                }`}
              >
                {lang}
              </button>
              <span className={`font-mono text-[8px] ${hasApiKey ? 'text-ui-ok' : 'text-ui-muted'}`}>
                {hasApiKey ? '● GROQ' : '○ FAQ'}
              </span>
              <button
                onClick={() => setMessages([])}
                className="font-mono text-[9px] text-ui-muted hover:text-ui-text transition-colors cursor-pointer"
              >
                CLR
              </button>
              <button
                onClick={toggleChat}
                className="font-mono text-[9px] text-ui-muted hover:text-ui-alert transition-colors cursor-pointer ml-1"
              >
                ×
              </button>
            </div>
          </div>

          {/* Context strip */}
          {selectedAttack && (
            <div className="border-b border-ui-border/40 bg-surface-base px-4 py-1 shrink-0">
              <span className="font-mono text-[9px] text-ui-muted">
                CTX: <span className="text-ui-accent">{selectedAttack.name}</span>
                <span className="ml-3">EP: </span>
                <span className={endpointStatus === 'ONLINE' ? 'text-ui-ok' : endpointStatus === 'TESTING' ? 'text-ui-alert animate-pulse' : 'text-ui-muted'}>
                  {endpointStatus}
                </span>
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 selectable">
            {messages.length === 0 && (
              <div className="flex flex-col h-full">
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-8 h-8 border border-ui-border flex items-center justify-center opacity-30">
                    <span className="font-mono text-xs text-ui-alert font-bold">AI</span>
                  </div>
                  <p className="font-mono text-[10px] text-ui-muted leading-relaxed max-w-[260px]">
                    Ask questions or give commands — AEGIS-AI can execute real workspace actions.
                  </p>
                  {!hasApiKey && (
                    <div className="font-mono text-[9px] text-ui-muted border border-ui-border/50 px-3 py-2 bg-surface-base text-left">
                      <span className="text-ui-alert">○ FAQ MODE</span><br />
                      Add <span className="text-ui-text">VITE_GROQ_API_KEY</span> to <span className="text-ui-text">.env</span> for live AI
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[9px] text-ui-alert/70 tracking-wider">⚡ ACTIONS:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {ACTION_PROMPTS.map(ap => (
                      <button
                        key={ap.label}
                        onClick={() => sendMessage(ap.text)}
                        className="font-mono text-[9px] px-2 py-1 border border-ui-alert/30 text-ui-alert/70 hover:border-ui-alert hover:text-ui-alert transition-colors bg-surface-base cursor-pointer"
                      >
                        {ap.label}
                      </button>
                    ))}
                  </div>
                  <span className="font-mono text-[9px] text-ui-muted tracking-wider mt-1">ASK:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map(qp => (
                      <button
                        key={qp.label}
                        onClick={() => sendMessage(qp.text)}
                        dir={qp.isArabic ? 'rtl' : 'ltr'}
                        className="font-mono text-[9px] px-2 py-1 border border-ui-border text-ui-muted hover:border-ui-alert hover:text-ui-alert transition-colors bg-surface-base cursor-pointer"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8px] text-ui-muted">{msg.time}</span>
                  <span className={`font-mono text-[8px] tracking-wider ${
                    msg.role === 'user' ? 'text-ui-muted' : msg.isAction ? 'text-ui-alert font-bold' : 'text-ui-alert'
                  }`}>
                    {msg.role === 'user' ? 'YOU' : msg.isAction ? '⚡ AEGIS-AI' : 'AEGIS-AI'}
                  </span>
                </div>
                <div
                  dir={msg.isArabic ? 'rtl' : 'ltr'}
                  className={`max-w-[330px] font-mono text-[11px] leading-relaxed px-3 py-2 whitespace-pre-wrap break-words ${
                    msg.role === 'user'
                      ? 'bg-surface-alt border border-ui-border text-ui-text'
                      : msg.isAction
                      ? 'bg-ui-alert/5 border border-ui-alert/40 border-l-2 border-l-ui-alert text-ui-text'
                      : 'bg-surface-base border border-ui-border/50 border-l-2 border-l-ui-alert/60 text-ui-text'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col gap-1 items-start">
                <span className="font-mono text-[8px] text-ui-alert">AEGIS-AI</span>
                <div className="bg-surface-base border border-ui-border/50 border-l-2 border-l-ui-alert/60 px-3 py-2 flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 bg-ui-alert rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.9, delay: i * 0.18, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-ui-border bg-surface-alt shrink-0 flex items-center">
            <span className="font-mono text-[10px] text-ui-alert px-3 shrink-0 select-none">›</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              dir={inputIsArabic ? 'rtl' : 'ltr'}
              placeholder={lang === 'AR' ? 'اكتب سؤالك هنا...' : 'Ask about attacks, JSD, compliance...'}
              disabled={isLoading}
              className="flex-1 bg-transparent font-mono text-xs text-ui-text placeholder-ui-muted/40 outline-none py-3 pr-3 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="font-mono text-[9px] text-ui-alert border-l border-ui-border px-3 py-3 hover:bg-ui-alert/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0 tracking-widest"
            >
              SEND
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};
