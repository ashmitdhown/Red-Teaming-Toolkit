import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../AppContext';

interface FindingDetail {
  attackId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'DEFENDED';
  impact: string;
  rootCause: string;
  remediation: string;
}

interface ReportData {
  executiveSummary: string;
  findings: FindingDetail[];
}

const SEV_WEIGHT = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, DEFENDED: 0 };

const SEV_STYLE: Record<string, { bg: string; text: string; bar: string }> = {
  CRITICAL: { bg: 'bg-[#dc2626]', text: 'text-white', bar: '#dc2626' },
  HIGH:     { bg: 'bg-[#ea580c]', text: 'text-white', bar: '#ea580c' },
  MEDIUM:   { bg: 'bg-[#ca8a04]', text: 'text-white', bar: '#ca8a04' },
  LOW:      { bg: 'bg-[#2563eb]', text: 'text-white', bar: '#2563eb' },
  DEFENDED: { bg: 'bg-[#16a34a]', text: 'text-white', bar: '#16a34a' },
};

// Simple inline bar chart for print compatibility
const MiniBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <div className="flex items-center gap-2 w-full">
    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, backgroundColor: color }}
      />
    </div>
    <span className="text-xs font-mono w-6 text-right">{value}</span>
  </div>
);

export const ComplianceReport = () => {
  const { isReportOpen, toggleReport, attacks, targetUrl, targetType, appState, metrics } = useAppContext();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generatedForRef = useRef<string>('');

  // ── Derived metrics (100% live from attack results) ──────────────────────────
  const executedAttacks = attacks.filter(a => a.status === 'DONE');
  const attackedOnly = executedAttacks.filter(a => a.category !== 'Control');

  const crashes = executedAttacks.filter(a => /HTTP 50[0-9]/.test(a.expectedResult));
  const crashRate = executedAttacks.length > 0 ? (crashes.length / executedAttacks.length) * 100 : 0;

  const networkErrors = executedAttacks.filter(a => a.expectedResult === 'Network Error');
  const errorHandlingGapRate = executedAttacks.length > 0 ? (networkErrors.length / executedAttacks.length) * 100 : 0;

  const adversarialAttacks = attackedOnly.filter(a =>
    a.category === 'Adversarial perturbation' || a.category === 'Encoding tricks'
  );
  const adversarialCompromised = adversarialAttacks.filter(a => a.defendedStatus === 'NOT Defended');
  const avgJsd = adversarialAttacks.length > 0
    ? adversarialAttacks.reduce((s, a) => s + a.jsd, 0) / adversarialAttacks.length
    : 0;
  const confidenceDriftRate = adversarialAttacks.length > 0
    ? (adversarialCompromised.length / adversarialAttacks.length) * 100
    : 0;

  const validationAttacks = attackedOnly.filter(a =>
    a.category === 'Boundary / Type' || a.category === 'Malformed'
  );
  const validationBypasses = validationAttacks.filter(a => a.defendedStatus === 'NOT Defended');
  const inputValidationWeaknessRate = validationAttacks.length > 0
    ? (validationBypasses.length / validationAttacks.length) * 100
    : 0;

  const totalVulnerable = attackedOnly.filter(a => a.defendedStatus === 'NOT Defended').length;
  const totalDefended = attackedOnly.filter(a => a.defendedStatus === 'Defended').length;
  const avgLatency = executedAttacks.length > 0
    ? Math.round(executedAttacks.reduce((s, a) => s + a.latencyMs, 0) / executedAttacks.length)
    : 0;

  // Category breakdown for infographic
  const catBreakdown = [
    { label: 'Boundary / Type', count: attackedOnly.filter(a => a.category === 'Boundary / Type').length },
    { label: 'Malformed', count: attackedOnly.filter(a => a.category === 'Malformed').length },
    { label: 'Adversarial', count: attackedOnly.filter(a => a.category === 'Adversarial perturbation').length },
    { label: 'Encoding tricks', count: attackedOnly.filter(a => a.category === 'Encoding tricks').length },
  ].filter(c => c.count > 0);
  const maxCatCount = Math.max(...catBreakdown.map(c => c.count), 1);

  // ── Background AI Generation (fires right when sequence finishes) ────────────
  useEffect(() => {
    if (appState === 'ATTACKING') return;
    if (executedAttacks.length === 0) return;

    // Fingerprint the current batch to avoid re-running unnecessarily
    const fingerprint = executedAttacks.map(a => `${a.id}:${a.expectedResult}:${a.defendedStatus}`).join('|');
    if (fingerprint === generatedForRef.current) return;
    if (isGenerating) return;

    const run = async () => {
      setIsGenerating(true);
      setError(null);

      const apiKey = import.meta.env.VITE_GROQ_REPORT_API_KEY;
      if (!apiKey) { setError('VITE_GROQ_REPORT_API_KEY missing'); setIsGenerating(false); return; }

      const prompt = `You are a Senior AI Security Auditor at a penetration testing firm.
You have just completed an automated adversarial attack suite against an AI inference endpoint.

Below are ALL vectors executed. For EACH one, provide a brief but technically precise analysis.

ATTACKS:
${executedAttacks.map(a =>
  `ID:${a.id} | [${a.category}] ${a.name}
   Payload: ${a.payload.substring(0, 80)}...
   Status: ${a.defendedStatus} | Response: ${a.expectedResult} | JSD: ${a.jsd.toFixed(4)} | Latency: ${a.latencyMs}ms`
).join('\n\n')}

ENDPOINT METRICS:
- Crash Rate: ${crashRate.toFixed(1)}%
- Error-Handling Gaps: ${errorHandlingGapRate.toFixed(1)}%
- Confidence Drift Rate: ${confidenceDriftRate.toFixed(1)}%
- Avg JSD Under Perturbation: ${avgJsd.toFixed(4)}
- Input-Validation Weakness Rate: ${inputValidationWeaknessRate.toFixed(1)}%
- Total Compromised: ${totalVulnerable} / ${attackedOnly.length}

Return ONLY valid JSON (no markdown) with this EXACT structure:
{
  "executiveSummary": "2-paragraph professional executive summary analyzing the overall risk posture from these specific metrics and findings.",
  "findings": [
    {
      "attackId": "<exact ID string from above, e.g. '1'>",
      "severity": "<CRITICAL|HIGH|MEDIUM|LOW|DEFENDED>",
      "impact": "<1-2 sentence technical impact explanation>",
      "rootCause": "<1-2 sentence root cause>",
      "remediation": "<1-2 sentence concrete fix or 'Defenses nominal' if DEFENDED>"
    }
  ]
}`;

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 4096,
            response_format: { type: 'json_object' },
          }),
        });
        if (!res.ok) throw new Error(`Groq API ${res.status}`);
        const data = await res.json();
        const parsed: ReportData = JSON.parse(data.choices[0].message.content);
        setReportData(parsed);
        generatedForRef.current = fingerprint;
      } catch (err) {
        setError(String(err));
      } finally {
        setIsGenerating(false);
      }
    };

    run();
  }, [appState, executedAttacks.length, isGenerating]);

  // ── Build sorted findings (all executed attacks) ─────────────────────────────
  const detailedFindings = executedAttacks.map(attack => {
    const ai = reportData?.findings.find(f => f.attackId === attack.id);
    const fallbackSev = attack.defendedStatus === 'NOT Defended'
      ? (attack.category === 'Encoding tricks' ? 'CRITICAL' : attack.category === 'Adversarial perturbation' ? 'HIGH' : 'MEDIUM')
      : attack.defendedStatus === 'Defended' ? 'DEFENDED'
      : 'LOW';
    return {
      attack,
      severity: (ai?.severity ?? (isGenerating ? 'LOW' : fallbackSev)) as keyof typeof SEV_WEIGHT,
      impact: ai?.impact ?? (isGenerating ? 'Analysis in progress...' : `This vector received a ${attack.defendedStatus} classification with response: ${attack.expectedResult}`),
      rootCause: ai?.rootCause ?? (isGenerating ? 'Analysis in progress...' : `JSD score: ${(attack.jsd || 0).toFixed(4)}. Response latency: ${attack.latencyMs}ms.`),
      remediation: ai?.remediation ?? (isGenerating ? 'Analysis in progress...' : attack.defendedStatus === 'Defended' ? 'Defenses nominal for this vector.' : 'Refer to remediation documentation for this attack category.'),
    };
  }).sort((a, b) => (SEV_WEIGHT[b.severity] || 0) - (SEV_WEIGHT[a.severity] || 0));

  if (!isReportOpen) return null;

  const auditDate = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        id="aegis-report"
        className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-hidden print:static print:z-auto print:inset-auto print:w-full print:h-auto print:overflow-visible print:bg-white"
        style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
      >
        {/* ── Screen toolbar (hidden when printing) */}
        <div className="bg-gray-900 border-b border-gray-700 h-12 flex items-center px-6 justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-white font-mono text-sm font-semibold">AEGIS-GHOST // RED TEAM AUDIT REPORT</span>
            {isGenerating && (
              <span className="text-xs text-yellow-400 font-mono animate-pulse ml-4">● GENERATING AI ANALYSIS...</span>
            )}
            {!isGenerating && reportData && (
              <span className="text-xs text-green-400 font-mono ml-4">✓ REPORT READY</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="bg-white text-gray-900 text-xs font-semibold px-4 py-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export PDF
            </button>
            <button onClick={toggleReport} className="text-gray-400 hover:text-white text-xs font-mono transition-colors">
              ✕ Close
            </button>
          </div>
        </div>

        {/* ── Main report scroll area */}
        <div className="flex-1 overflow-auto print:block print:flex-none print:overflow-visible print:h-auto">
          {/* ═══════════════════════════════════════════════════════════════════
               PAGE 1: COVER + METRICS
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="max-w-4xl mx-auto bg-white shadow-lg my-6 print:shadow-none print:my-0 print:max-w-none print:rounded-none">

            {/* Cover band */}
            <div className="bg-gray-900 px-10 pt-10 pb-8 print:pt-8 print:pb-6" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono text-red-400 uppercase tracking-[0.3em] mb-3">CONFIDENTIAL — RESTRICTED</div>
                  <h1 className="text-4xl font-bold text-white leading-tight mb-2">Red Team Audit Report</h1>
                  <div className="text-gray-400 text-sm font-mono">AI Inference Endpoint Adversarial Assessment</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1 font-mono uppercase tracking-widest">Report ID</div>
                  <div className="text-white font-mono text-sm">AEGIS-{Date.now().toString(36).toUpperCase().slice(-6)}</div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-4 gap-6 border-t border-gray-700 pt-8">
                <div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Target Endpoint</div>
                  <div className="text-white text-xs font-mono break-all">{targetUrl || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Model Type</div>
                  <div className="text-white text-xs font-mono">{targetType === 'nlp' ? 'NLP Sentiment Classifier' : 'Image Classifier'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Audit Date</div>
                  <div className="text-white text-xs font-mono">{auditDate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Classification</div>
                  <div className="text-red-400 text-xs font-mono font-bold">CONFIDENTIAL</div>
                </div>
              </div>
            </div>

            <div className="px-10 py-6 print:py-4">

              {/* ── Overall Risk Score ───────────────────────────────────────── */}
              <div className="mb-8">
                <h2 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-gray-200">
                  1. OVERALL QUANTITATIVE METRICS
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Crash Rate', sublabel: 'HTTP 500 crashes', value: crashRate, color: '#dc2626', desc: `${crashes.length}/${executedAttacks.length} attacks` },
                    { label: 'Error-Handling Gaps', sublabel: 'Network / timeout failures', value: errorHandlingGapRate, color: '#ea580c', desc: `${networkErrors.length}/${executedAttacks.length} attacks` },
                    { label: 'Confidence Drift', sublabel: 'Under adversarial perturbation', value: confidenceDriftRate, color: '#7c3aed', desc: `Avg JSD: ${avgJsd.toFixed(3)}` },
                    { label: 'Input-Validation Weaknesses', sublabel: 'Schema bypass rate', value: inputValidationWeaknessRate, color: '#2563eb', desc: `${validationBypasses.length}/${validationAttacks.length} bypassed` },
                  ].map(m => (
                    <div key={m.label} className="border border-gray-200 p-4">
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">{m.label}</div>
                      <div className="text-3xl font-bold mb-1" style={{ color: m.value > 0 ? m.color : '#16a34a' }}>
                        {m.value.toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-gray-400 mb-2">{m.desc}</div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(m.value, 100)}%`, backgroundColor: m.value > 0 ? m.color : '#16a34a' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Attack Summary Infographic ──────────────────────────────── */}
              <div className="mb-8">
                <h2 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-gray-200">
                  2. ATTACK SUITE SUMMARY
                </h2>
                <div className="grid grid-cols-3 gap-6">
                  {/* Outcome donut (CSS-based) */}
                  <div className="border border-gray-200 p-5">
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">Attack Outcomes</div>
                    <div className="flex flex-col gap-3">
                      {[
                        { label: 'Compromised',  count: totalVulnerable, color: '#dc2626' },
                        { label: 'Defended',      count: totalDefended,   color: '#16a34a' },
                        { label: 'Inconclusive',  count: attackedOnly.filter(a => a.defendedStatus === 'Inconclusive').length, color: '#ca8a04' },
                      ].map(row => (
                        <div key={row.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">{row.label}</span>
                            <span className="font-mono font-bold" style={{ color: row.color }}>{row.count}</span>
                          </div>
                          <MiniBar value={row.count} max={attackedOnly.length} color={row.color} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category breakdown */}
                  <div className="border border-gray-200 p-5">
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">By Category</div>
                    <div className="flex flex-col gap-3">
                      {catBreakdown.map(c => (
                        <div key={c.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 truncate">{c.label}</span>
                            <span className="font-mono font-bold text-gray-700 ml-2">{c.count}</span>
                          </div>
                          <MiniBar value={c.count} max={maxCatCount} color="#6366f1" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key stats */}
                  <div className="border border-gray-200 p-5">
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">Performance Stats</div>
                    <div className="flex flex-col gap-4">
                      {[
                        { label: 'Total Vectors Fired', value: executedAttacks.length },
                        { label: 'Avg Response Latency', value: `${avgLatency}ms` },
                        { label: 'Peak JSD Recorded', value: Math.max(...executedAttacks.map(a => a.jsd), 0).toFixed(4) },
                        { label: 'Final Integrity Score', value: metrics.integrity },
                      ].map(s => (
                        <div key={s.label} className="flex justify-between items-baseline">
                          <span className="text-xs text-gray-500">{s.label}</span>
                          <span className="font-mono text-sm font-bold text-gray-800">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Executive Summary ───────────────────────────────────────── */}
              <div className="mb-8 print:break-inside-avoid">
                <h2 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-gray-200">
                  3. EXECUTIVE SUMMARY
                </h2>
                <div className="bg-gray-50 border border-gray-200 p-6 text-sm text-gray-700 leading-relaxed mb-6">
                  {isGenerating ? (
                    <div className="flex items-center gap-3 text-gray-500 font-mono text-xs animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 animate-ping" />
                      Generating AI analysis in background — will appear here when ready.
                    </div>
                  ) : error ? (
                    <div className="text-red-600 text-xs font-mono">Error: {error}</div>
                  ) : (
                    <p className="whitespace-pre-wrap">{reportData?.executiveSummary || 'No attacks executed yet.'}</p>
                  )}
                </div>

                {/* ── Remediation Roadmap (Fills out Page 2) ── */}
                <h3 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">
                  Strategic Remediation Roadmap
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-red-200 bg-red-50 p-4">
                    <div className="text-red-700 font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" /> Immediate (0-7 Days)
                    </div>
                    <ul className="text-xs text-red-900 space-y-2 list-disc pl-3">
                      {detailedFindings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').slice(0, 3).map(f => (
                        <li key={`imm-${f.attack.id}`}>{f.remediation}</li>
                      ))}
                      {detailedFindings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').length === 0 && (
                        <li>No critical or high severity issues found.</li>
                      )}
                    </ul>
                  </div>
                  <div className="border border-orange-200 bg-orange-50 p-4">
                    <div className="text-orange-700 font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" /> Short Term (14-30 Days)
                    </div>
                    <ul className="text-xs text-orange-900 space-y-2 list-disc pl-3">
                      {detailedFindings.filter(f => f.severity === 'MEDIUM').slice(0, 3).map(f => (
                        <li key={`short-${f.attack.id}`}>{f.remediation}</li>
                      ))}
                      {detailedFindings.filter(f => f.severity === 'MEDIUM').length === 0 && (
                        <li>Continuous monitoring of defended vectors.</li>
                      )}
                    </ul>
                  </div>
                  <div className="border border-blue-200 bg-blue-50 p-4">
                    <div className="text-blue-700 font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" /> Long Term Strategy
                    </div>
                    <ul className="text-xs text-blue-900 space-y-2 list-disc pl-3">
                      <li>Implement strict schema validation across all inputs</li>
                      <li>Deploy adversarial training for confidence calibration</li>
                      <li>Establish continuous Red Team telemetry monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════════
               PAGE 2+: DETAILED FINDINGS
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="max-w-4xl mx-auto bg-white shadow-lg mb-10 print:shadow-none print:mb-0 print:max-w-none print:break-before-page">
            <div className="px-10 py-6 print:py-4">
              <h2 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2 pb-2 border-b border-gray-200">
                4. DETAILED FINDINGS — RANKED BY SEVERITY
              </h2>
              <p className="text-xs text-gray-400 font-mono mb-8">All {executedAttacks.length} executed attack vectors. Sorted: CRITICAL → HIGH → MEDIUM → LOW → DEFENDED.</p>

              <div className="flex flex-col gap-4">
                {detailedFindings.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 font-mono text-sm">No attacks executed.</div>
                ) : detailedFindings.map(({ attack, severity, impact, rootCause, remediation }, idx) => {
                  const sev = SEV_STYLE[severity] || SEV_STYLE.DEFENDED;
                  return (
                    <div key={attack.id} className="border border-gray-200 print:break-inside-avoid">
                      {/* Finding header */}
                      <div className="flex items-stretch">
                        <div
                          className="w-1.5 shrink-0"
                          style={{ backgroundColor: sev.bar, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties}
                        />
                        <div className="flex-1 flex items-center justify-between px-5 py-3 bg-gray-50">
                          <div>
                            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{attack.category} · Finding #{String(idx + 1).padStart(2, '0')}</div>
                            <div className="font-semibold text-gray-900 mt-0.5">{attack.name}</div>
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-sm ${sev.bg} ${sev.text} tracking-widest uppercase`}
                            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties}
                          >
                            {severity}
                          </span>
                        </div>
                      </div>

                      {/* Finding body */}
                      <div className="px-6 py-5 grid grid-cols-1 gap-5">
                        {/* Payload */}
                        <div>
                          <div className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Payload Injected</div>
                          <pre className="bg-gray-900 text-green-400 text-[11px] font-mono p-3 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed"
                            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties}>
                            {attack.payload}
                          </pre>
                        </div>

                        {/* Response */}
                        <div className="flex gap-8 text-xs font-mono">
                          <div>
                            <span className="text-gray-400 uppercase tracking-widest">Endpoint Response: </span>
                            <span className={`font-bold ${attack.defendedStatus === 'NOT Defended' ? 'text-red-600' : 'text-green-700'}`}>
                              {attack.expectedResult || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 uppercase tracking-widest">JSD Score: </span>
                            <span className="font-bold text-gray-800">{(attack.jsd || 0).toFixed(4)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 uppercase tracking-widest">Latency: </span>
                            <span className="font-bold text-gray-800">{attack.latencyMs}ms</span>
                          </div>
                          <div>
                            <span className="text-gray-400 uppercase tracking-widest">Defense: </span>
                            <span className={`font-bold ${attack.defendedStatus === 'NOT Defended' ? 'text-red-600' : 'text-green-700'}`}>
                              {attack.defendedStatus}
                            </span>
                          </div>
                        </div>

                        {/* Analysis grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest mb-1.5 border-b border-gray-200 pb-1">Impact Analysis</div>
                            <p className="text-gray-700 leading-relaxed">{impact}</p>
                          </div>
                          <div>
                            <div className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest mb-1.5 border-b border-gray-200 pb-1">Root Cause</div>
                            <p className="text-gray-700 leading-relaxed">{rootCause}</p>
                          </div>
                          <div>
                            <div className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest mb-1.5 border-b border-gray-200 pb-1">
                              {severity === 'DEFENDED' ? 'Defense Assessment' : 'Remediation'}
                            </div>
                            <p className={`leading-relaxed font-medium ${severity === 'DEFENDED' ? 'text-green-700' : 'text-red-700'}`}>{remediation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                <span>AEGIS-GHOST RED TEAM TOOLKIT — CONFIDENTIAL</span>
                <span>{auditDate}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
