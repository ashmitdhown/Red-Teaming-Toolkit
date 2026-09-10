import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../AppContext';

interface ReportData {
  executiveSummary: string;
  remediations: {
    attackId: string;
    fix: string;
  }[];
}

export const ComplianceReport = () => {
  const { isReportOpen, toggleReport, attacks, targetUrl, targetType } = useAppContext();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate Metrics
  const executedAttacks = attacks.filter(a => a.status === 'DONE');
  const crashes = executedAttacks.filter(a => a.expectedResult.includes('500') || a.expectedResult.includes('Network Error'));
  const crashRate = executedAttacks.length > 0 ? (crashes.length / executedAttacks.length) * 100 : 0;

  const validationAttacks = executedAttacks.filter(a => a.category === 'Boundary / Type' || a.category === 'Malformed');
  const bypasses = validationAttacks.filter(a => a.defendedStatus === 'NOT Defended');
  const bypassRate = validationAttacks.length > 0 ? (bypasses.length / validationAttacks.length) * 100 : 0;

  const adversarialAttacks = executedAttacks.filter(a => a.category === 'Adversarial perturbation' || a.category === 'Encoding tricks');
  const compromisedAdversarial = adversarialAttacks.filter(a => a.defendedStatus === 'NOT Defended');
  const confidenceDriftRate = adversarialAttacks.length > 0 ? (compromisedAdversarial.length / adversarialAttacks.length) * 100 : 0;

  const vulnerableAttacks = executedAttacks.filter(a => a.defendedStatus === 'NOT Defended');

  // Severity Distribution
  const critical = vulnerableAttacks.filter(a => a.category.includes('Encoding')).length + crashes.length;
  const high = vulnerableAttacks.filter(a => a.category.includes('Adversarial') || a.category.includes('Boundary')).length;
  const medium = vulnerableAttacks.filter(a => a.category.includes('Malformed')).length;

  useEffect(() => {
    if (!isReportOpen) return;
    if (reportData || isGenerating) return;

    const generateAIReport = async () => {
      setIsGenerating(true);
      setError(null);

      const apiKey = import.meta.env.VITE_GROQ_REPORT_API_KEY;
      if (!apiKey) {
        setError('VITE_GROQ_REPORT_API_KEY is missing from .env');
        setIsGenerating(false);
        return;
      }

      const prompt = `You are a Senior AI Red Team Lead at a top cybersecurity firm (like Mandiant).
You have just concluded an audit of an AI endpoint.
Here are the vulnerabilities found:
${vulnerableAttacks.map(a => `- [${a.category}] ${a.name}. Payload: ${a.payload.substring(0, 50)}... Status: ${a.expectedResult}`).join('\n')}

Metrics:
Crash Rate: ${crashRate.toFixed(1)}%
Validation Bypass Rate: ${bypassRate.toFixed(1)}%
Drift Rate: ${confidenceDriftRate.toFixed(1)}%

Respond ONLY with a raw JSON object with this exact structure:
{
  "executiveSummary": "A highly professional, 2-paragraph executive summary describing the overall risk posture and implications of these findings.",
  "remediations": [
    {
      "attackId": "string (the name of the attack)",
      "fix": "A 1-sentence concrete code remediation"
    }
  ]
}`;

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            response_format: { type: "json_object" }
          })
        });

        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        setReportData(JSON.parse(data.choices[0].message.content));
      } catch (err) {
        setError(String(err));
      } finally {
        setIsGenerating(false);
      }
    };

    if (vulnerableAttacks.length > 0) {
      generateAIReport();
    } else {
      setReportData({
        executiveSummary: "The endpoint was thoroughly tested against Boundary, Malformed, Encoding, and Adversarial vectors. No vulnerabilities were detected. The endpoint maintains a highly secure and robust posture.",
        remediations: []
      });
    }
  }, [isReportOpen, reportData, isGenerating, vulnerableAttacks, crashRate, bypassRate, confidenceDriftRate]);

  const handlePrint = () => {
    window.print();
  };

  if (!isReportOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden report-print-container"
      >
        <div className="h-14 border-b border-ui-border flex items-center px-8 justify-between bg-surface-panel shrink-0 print:hidden">
          <div className="flex items-center gap-4">
            <span className="font-mono font-bold text-ui-text text-lg">AEGIS-GHOST COMPLIANCE REPORT</span>
            <span className="text-[10px] uppercase font-mono text-ui-muted tracking-widest border border-ui-border px-2 py-0.5 rounded-sm">Confidential</span>
          </div>
          <div className="flex gap-4">
            <button onClick={handlePrint} className="text-[11px] font-mono tracking-widest text-ui-text hover:text-ui-accent transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              EXPORT PDF
            </button>
            <button onClick={toggleReport} className="text-[11px] font-mono tracking-widest text-ui-muted hover:text-ui-alert transition-colors">
              CLOSE [X]
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 md:p-16 lg:px-32 xl:px-64 bg-surface-base">
          <div className="max-w-5xl mx-auto flex flex-col gap-12 pb-24">
            
            {/* Header */}
            <div className="border-b-2 border-ui-text pb-8">
              <h1 className="text-4xl font-mono font-bold text-ui-text mb-4">RED TEAM AUDIT REPORT</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-ui-muted uppercase tracking-widest">
                <div>
                  <div className="mb-1 opacity-50">Target Endpoint</div>
                  <div className="text-ui-text">{targetUrl}</div>
                </div>
                <div>
                  <div className="mb-1 opacity-50">Target Type</div>
                  <div className="text-ui-text">{targetType === 'nlp' ? 'NLP Model' : 'Vision Model'}</div>
                </div>
                <div>
                  <div className="mb-1 opacity-50">Date of Audit</div>
                  <div className="text-ui-text">{new Date().toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="mb-1 opacity-50">Vectors Executed</div>
                  <div className="text-ui-text">{executedAttacks.length}</div>
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-ui-border bg-surface-panel p-4">
                <div className="text-[10px] font-mono text-ui-muted uppercase tracking-widest mb-2">Crash Rate</div>
                <div className={`text-3xl font-mono ${crashRate > 0 ? 'text-ui-alert' : 'text-ui-ok'}`}>{crashRate.toFixed(1)}%</div>
              </div>
              <div className="border border-ui-border bg-surface-panel p-4">
                <div className="text-[10px] font-mono text-ui-muted uppercase tracking-widest mb-2">Validation Gaps</div>
                <div className={`text-3xl font-mono ${bypassRate > 0 ? 'text-ui-alert' : 'text-ui-ok'}`}>{bypassRate.toFixed(1)}%</div>
              </div>
              <div className="border border-ui-border bg-surface-panel p-4">
                <div className="text-[10px] font-mono text-ui-muted uppercase tracking-widest mb-2">Confidence Drift</div>
                <div className={`text-3xl font-mono ${confidenceDriftRate > 0 ? 'text-ui-alert' : 'text-ui-ok'}`}>{confidenceDriftRate.toFixed(1)}%</div>
              </div>
              <div className="border border-ui-border bg-surface-panel p-4">
                <div className="text-[10px] font-mono text-ui-muted uppercase tracking-widest mb-2">Total Vulnerabilities</div>
                <div className={`text-3xl font-mono ${vulnerableAttacks.length > 0 ? 'text-ui-alert' : 'text-ui-ok'}`}>{vulnerableAttacks.length}</div>
              </div>
            </div>

            {/* Severity Distribution */}
            <div>
              <h2 className="text-sm font-mono font-bold text-ui-text mb-4 uppercase tracking-widest">Severity Distribution</h2>
              <div className="h-6 w-full flex rounded-sm overflow-hidden border border-ui-border">
                {critical > 0 && <div style={{ width: `${(critical/vulnerableAttacks.length)*100}%` }} className="bg-ui-alert h-full" title="CRITICAL"></div>}
                {high > 0 && <div style={{ width: `${(high/vulnerableAttacks.length)*100}%` }} className="bg-[#f59e0b] h-full" title="HIGH"></div>}
                {medium > 0 && <div style={{ width: `${(medium/vulnerableAttacks.length)*100}%` }} className="bg-[#3b82f6] h-full" title="MEDIUM"></div>}
                {vulnerableAttacks.length === 0 && <div className="w-full bg-ui-ok h-full"></div>}
              </div>
              <div className="flex gap-6 mt-3 font-mono text-[10px] text-ui-muted tracking-widest">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-ui-alert"></span> CRITICAL ({critical})</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> HIGH ({high})</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span> MEDIUM ({medium})</span>
              </div>
            </div>

            {/* AI Executive Summary */}
            <div>
              <h2 className="text-sm font-mono font-bold text-ui-text mb-4 uppercase tracking-widest flex items-center gap-2">
                Executive Summary
                <span className="text-[8px] bg-ui-accent/10 text-ui-accent px-1.5 py-0.5 rounded-sm border border-ui-accent/30 print:hidden">AI GENERATED</span>
              </h2>
              <div className="border border-ui-border bg-surface-panel p-6">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-8 text-ui-muted font-mono text-[11px] tracking-widest animate-pulse">
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    GENERATING ANALYSIS...
                  </div>
                ) : error ? (
                  <div className="text-ui-alert text-sm font-mono">{error}</div>
                ) : (
                  <div className="text-sm text-ui-text leading-relaxed font-sans whitespace-pre-wrap">
                    {reportData?.executiveSummary}
                  </div>
                )}
              </div>
            </div>

            {/* Findings & Remediation Ledger */}
            <div>
              <h2 className="text-sm font-mono font-bold text-ui-text mb-4 uppercase tracking-widest">Findings & Remediation Ledger</h2>
              <div className="border border-ui-border bg-surface-panel">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-ui-border bg-surface-alt text-ui-muted">
                      <th className="p-4 font-normal tracking-widest">VECTOR</th>
                      <th className="p-4 font-normal tracking-widest hidden md:table-cell">CATEGORY</th>
                      <th className="p-4 font-normal tracking-widest">IMPACT</th>
                      <th className="p-4 font-normal tracking-widest">REMEDIATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vulnerableAttacks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-ui-muted tracking-widest">NO VULNERABILITIES DETECTED</td>
                      </tr>
                    ) : (
                      vulnerableAttacks.map((attack, idx) => {
                        const rem = reportData?.remediations.find(r => r.attackId === attack.name)?.fix || 'Awaiting AI remediation...';
                        return (
                          <tr key={attack.id} className={idx !== vulnerableAttacks.length - 1 ? "border-b border-ui-border/50" : ""}>
                            <td className="p-4 text-ui-text font-bold align-top">{attack.name}</td>
                            <td className="p-4 text-ui-muted align-top hidden md:table-cell">{attack.category}</td>
                            <td className="p-4 text-ui-alert align-top">{attack.expectedResult}</td>
                            <td className="p-4 text-ui-text align-top leading-relaxed">{rem}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
