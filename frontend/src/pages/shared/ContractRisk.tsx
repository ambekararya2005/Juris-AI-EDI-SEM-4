import React, { useState } from 'react';
import { Upload, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import RiskGauge from '../../components/ui/RiskGauge';
import Skeleton from '../../components/ui/Skeleton';
import { RiskFlag } from '../../types';
import { useApp } from '../../context/AppContext';
import { analyzeRisk } from '../../lib/api';
import DisclaimerBanner from '../../components/DisclaimerBanner';

// 4-level severity style map
const severityColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  CRITICAL: {
    bg: 'bg-red-50/50 dark:bg-red-950/10',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-900/50',
    badge: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
  },
  HIGH: {
    bg: 'bg-orange-50/50 dark:bg-orange-950/10',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-900/50',
    badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800'
  },
  MEDIUM: {
    bg: 'bg-amber-50/50 dark:bg-amber-950/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-900/50',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
  },
  LOW: {
    bg: 'bg-green-50/50 dark:bg-green-950/10',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-900/50',
    badge: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
  },
};

const ContractRisk: React.FC = () => {
  const { addToast } = useApp();
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'done'>('idle');
  const [fileName, setFileName] = useState('');
  const [riskScore, setRiskScore] = useState(67);
  const [riskSummary, setRiskSummary] = useState('');
  const [apiFlags, setApiFlags] = useState<RiskFlag[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [openFlags, setOpenFlags] = useState<string[]>(['r1', 'r2']);
  const [openFixes, setOpenFixes] = useState<string[]>(['r1']);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  const runAnalysis = async (file: File) => {
    setFileName(file.name);
    setUploadState('uploading');
    setUploadProgress(0);
    let prog = 0;
    const progressTimer = setInterval(() => {
      prog += 15;
      setUploadProgress(Math.min(prog, 90));
    }, 100);

    try {
      setUploadState('analyzing');
      const data = await analyzeRisk(file);
      clearInterval(progressTimer);
      setUploadProgress(100);
      setRiskScore(data.risk_score ?? 50);
      setRiskSummary(data.summary ?? '');
      const normalizeSeverity = (raw: string): RiskFlag['severity'] => {
        const s = raw.toUpperCase()
        if (s === 'CRITICAL' || s === 'HIGH' || s === 'MEDIUM' || s === 'LOW') return s
        return 'MEDIUM'
      }
      const flags: RiskFlag[] = (data.flagged_clauses || []).map(
        (clause: Record<string, string>, i: number) => ({
          id: `r${i + 1}`,
          severity: normalizeSeverity(clause.severity || 'Medium'),
          clauseRef: clause.clause_type || 'Clause',
          title: clause.clause_type || 'Flagged clause',
          description: clause.explanation || '',
          originalText: clause.excerpt || '',
          suggestedRevision: clause.suggestion || '',
          applicable_law: clause.applicable_law || '',
        })
      );
      setApiFlags(flags.length ? flags : []);
      setUploadState('done');
      addToast('Contract analyzed successfully', 'success');
    } catch (err) {
      clearInterval(progressTimer);
      const msg = err instanceof Error ? err.message : 'Risk analysis failed'
      addToast(msg.length > 120 ? `${msg.slice(0, 120)}…` : msg, 'error');
      setUploadState('idle');
    }
  };

  const handleFileInput = (file: File | null) => {
    if (file) runAnalysis(file);
  };

  const toggleFlag = (id: string) =>
    setOpenFlags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleFix = (id: string) =>
    setOpenFixes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const processedFlags = apiFlags;

  // Calculations for donut chart
  const critCount = processedFlags.filter(f => f.severity === 'CRITICAL').length;
  const highCount = processedFlags.filter(f => f.severity === 'HIGH').length;
  const medCount = processedFlags.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = processedFlags.filter(f => f.severity === 'LOW').length;

  const pieData = [
    { name: 'Critical', value: critCount, color: '#DC2626' },
    { name: 'High Risk', value: highCount, color: '#EA580C' },
    { name: 'Medium Risk', value: medCount, color: '#D97706' },
    { name: 'Low Risk', value: lowCount, color: '#16A34A' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-dark-text dark:text-slate-100">Contract Risk Detection</h1>
          <p className="text-muted-text dark:text-slate-400 text-xs md:text-sm mt-1">AI-powered analysis of legal risks and unfavorable clauses</p>
        </div>
        {uploadState === 'done' && (
          <button
            onClick={() => setUploadState('idle')}
            className="text-xs md:text-sm text-gold hover:text-amber-500 font-medium underline self-start md:self-center"
          >
            Analyze different contract
          </button>
        )}
      </div>

      {/* Upload area (shown when idle) */}
      {uploadState === 'idle' && (
        <div className="max-w-lg mx-auto">
          <Card className="p-8">
            <div
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                handleFileInput(file || null);
              }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => document.getElementById('risk-file-input')?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                ${dragOver ? 'border-blue-brand bg-light-blue dark:bg-slate-800' : 'border-border dark:border-slate-700 hover:border-blue-brand dark:hover:border-gold hover:bg-surface-gray dark:hover:bg-slate-700/50'}`}
            >
              <Upload size={40} className="mx-auto text-muted-text mb-3" />
              <p className="font-medium text-dark-text dark:text-slate-200">Upload a contract to detect risk</p>
              <p className="text-xs text-muted-text mt-1">PDF, DOCX supported</p>
              <input
                id="risk-file-input"
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={e => handleFileInput(e.target.files?.[0] || null)}
              />
            </div>
          </Card>
        </div>
      )}

      {uploadState === 'uploading' && (
        <div className="max-w-lg mx-auto">
          <Card className="p-8 text-center space-y-4">
            <FileText size={40} className="mx-auto text-blue-brand" />
            <p className="font-medium text-dark-text dark:text-slate-200">Uploading contract...</p>
            <ProgressBar value={uploadProgress} />
          </Card>
        </div>
      )}

      {/* Skeleton loaders during analysis */}
      {uploadState === 'analyzing' && (
        <div className="space-y-6 animate-pulse">
          {/* Top Banner Skeleton */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
              <div className="flex-1 space-y-3 w-full">
                <Skeleton width="40%" height="1.25rem" />
                <Skeleton width="80%" height="1.5rem" />
                <div className="flex gap-2">
                  <Skeleton width="6rem" height="1.5rem" rounded="full" />
                  <Skeleton width="6rem" height="1.5rem" rounded="full" />
                  <Skeleton width="6rem" height="1.5rem" rounded="full" />
                </div>
              </div>
            </div>
          </Card>

          {/* Main Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: 3 Flagged Clauses Skeletons */}
            <div className="lg:col-span-3 space-y-4">
              <Skeleton width="8rem" height="1.25rem" className="mb-2" />
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton width="4rem" height="1.25rem" />
                    <div className="flex-1 space-y-1">
                      <Skeleton width="60%" height="1rem" />
                      <Skeleton width="30%" height="0.75rem" />
                    </div>
                    <Skeleton width="1.5rem" height="1.5rem" rounded="full" />
                  </div>
                  <Skeleton width="100%" height="2rem" className="mt-2" />
                  <Skeleton width="100%" height="3rem" />
                </Card>
              ))}
            </div>

            {/* Right: Chart & Recommendations Skeletons */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-5 space-y-4">
                <Skeleton width="10rem" height="1.25rem" />
                <div className="flex justify-center py-4">
                  <div className="w-36 h-36 rounded-full border-[12px] border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
              </Card>

              <Card className="p-5 space-y-3">
                <Skeleton width="8rem" height="1rem" />
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-2">
                    <Skeleton width="1.25rem" height="1.25rem" rounded="full" className="shrink-0" />
                    <Skeleton width="100%" height="1.25rem" />
                  </div>
                ))}
              </Card>

              <Skeleton width="100%" height="2.5rem" />
              <Skeleton width="100%" height="2.5rem" />
            </div>
          </div>
        </div>
      )}

      {uploadState === 'done' && (
        <div className="space-y-6">
          {/* Risk Score Banner */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <RiskGauge score={riskScore} />
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs text-muted-text dark:text-slate-400 mb-1">Analyzed Document</p>
                <h2 className="font-serif text-lg font-bold text-dark-text dark:text-slate-200 mb-3">
                  {fileName || 'Uploaded contract'}
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                    {critCount} Critical
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50">
                    {highCount} High
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                    {medCount} Medium
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900/50">
                    {lowCount} Low Risk
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Flagged Clauses */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-200">
                  Flagged Clauses ({processedFlags.length})
                </h3>
                {/* Comparison Mode Toggle */}
                <div className="flex items-center gap-2 bg-surface-gray dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-border dark:border-slate-700">
                  <span className="text-xs font-medium text-dark-text dark:text-slate-300">Compare with Standard</span>
                  <button
                    onClick={() => setCompareMode(!compareMode)}
                    className={`w-9 h-5 rounded-full relative transition-colors focus:outline-none ${compareMode ? 'bg-gold' : 'bg-gray-300 dark:bg-slate-600'}`}
                    aria-label="Toggle compare mode"
                  >
                    <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${compareMode ? 'left-[18px]' : 'left-0.75'}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {processedFlags.map(flag => {
                  const colors = severityColors[flag.severity];
                  const isOpen = openFlags.includes(flag.id);
                  const isFixOpen = openFixes.includes(flag.id);
                  const isAccepted = accepted.includes(flag.id);

                  return (
                    <div
                      key={flag.id}
                      className={`rounded-2xl border-2 overflow-hidden transition-all bg-white dark:bg-slate-800 ${isAccepted ? 'opacity-80 border-success dark:border-emerald-500' : colors.border}`}
                    >
                      {/* Flag Header */}
                      <button
                        onClick={() => toggleFlag(flag.id)}
                        className={`w-full flex items-center gap-3 p-4 text-left border-b border-border dark:border-slate-700/60 ${colors.bg}`}
                      >
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colors.badge}`}>
                          {flag.severity}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-dark-text dark:text-slate-100">{flag.title}</p>
                          <p className="text-xs text-muted-text dark:text-slate-400 mt-0.5">{flag.clauseRef}</p>
                        </div>
                        {isOpen ? <ChevronUp size={16} className="text-muted-text dark:text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-text dark:text-slate-400 flex-shrink-0" />}
                      </button>

                      {/* Flag Content Body */}
                      {isOpen && (
                        <div>
                          {compareMode ? (
                            /* Side-by-side comparison mode */
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Uploaded Clause</span>
                                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3 h-full">
                                    <p className="font-mono text-xs text-red-800 dark:text-red-300 leading-relaxed whitespace-pre-wrap">{flag.originalText}</p>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Standard Clause</span>
                                    <button
                                      onClick={() => {
                                        setAccepted(prev => isAccepted ? prev.filter(x => x !== flag.id) : [...prev, flag.id]);
                                        if (!isAccepted) addToast('Standard clause accepted!', 'success');
                                      }}
                                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors ${isAccepted ? 'bg-emerald-500 text-white border-emerald-500' : 'text-blue-brand border-blue-brand/30 hover:bg-light-blue dark:hover:bg-slate-700'}`}
                                    >
                                      {isAccepted ? '✓ Accepted' : 'Accept Standard'}
                                    </button>
                                  </div>
                                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-xl p-3 h-full">
                                    <p className="font-mono text-xs text-success dark:text-green-300 leading-relaxed whitespace-pre-wrap">{flag.suggestedRevision}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="pt-3 border-t border-border dark:border-slate-700/60">
                                <span className="text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wider">Explanation</span>
                                <p className="text-sm text-dark-text dark:text-slate-300 mt-1 leading-relaxed">{flag.description}</p>
                              </div>
                            </div>
                          ) : (
                            /* Standard Clause display */
                            <div className="p-4 space-y-4">
                              {/* Clause Text (Truncated) */}
                              <div>
                                <span className="text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wider">Original Clause</span>
                                <p className="font-mono text-xs text-dark-text dark:text-slate-300 bg-surface-gray dark:bg-slate-700/40 p-2.5 rounded-xl border border-border dark:border-slate-700 mt-1 line-clamp-2 hover:line-clamp-none transition-all cursor-pointer" title="Click to view full original text">
                                  {flag.originalText}
                                </p>
                              </div>

                              {/* Explanation */}
                              <div>
                                <span className="text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wider">Explanation</span>
                                <p className="text-sm text-dark-text dark:text-slate-300 mt-1 leading-relaxed">{flag.description}</p>
                              </div>

                              {/* Applicable Law */}
                              {(flag as any).applicable_law && (
                                <div>
                                  <span className="text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wider">Applicable Law</span>
                                  <p className="text-xs text-navy dark:text-blue-300 mt-1 font-mono bg-light-blue dark:bg-slate-700/50 px-2 py-1 rounded-lg inline-block">
                                    {(flag as any).applicable_law}
                                  </p>
                                </div>
                              )}

                              {/* Collapsible Suggested Fix */}
                              <div className="border-t border-border dark:border-slate-700/60 pt-3">
                                <button
                                  onClick={() => toggleFix(flag.id)}
                                  className="flex items-center gap-1.5 text-xs font-bold text-gold hover:text-amber-500 transition-colors uppercase tracking-wider"
                                >
                                  {isFixOpen ? 'Hide Suggested Fix' : 'Show Suggested Fix'}
                                  {isFixOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {isFixOpen && (
                                  <div className="mt-2.5 space-y-3 animate-fade-in">
                                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-xl p-3">
                                      <p className="text-xs font-semibold text-success dark:text-green-400 uppercase tracking-wider mb-1">AI Suggested Revision</p>
                                      <p className="font-mono text-xs text-success dark:text-green-300 leading-relaxed">{flag.suggestedRevision}</p>
                                    </div>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      className={isAccepted ? 'text-success border-success dark:text-green-400 dark:border-green-500' : ''}
                                      onClick={() => {
                                        setAccepted(prev => isAccepted ? prev.filter(x => x !== flag.id) : [...prev, flag.id]);
                                        if (!isAccepted) addToast('Suggestion accepted!', 'success');
                                      }}
                                    >
                                      {isAccepted ? '✓ Suggestion Accepted' : 'Accept Suggestion'}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Summary / Charts */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-5 dark:bg-slate-800">
                <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100 mb-4">Risk Distribution</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #C5D5EE' }} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-5 dark:bg-slate-800">
                <h3 className="font-serif text-sm font-semibold text-dark-text dark:text-slate-100 mb-3">Top Recommendations</h3>
                <div className="space-y-3">
                  {[
                    'Verify MahaRERA registration number of project before executing the developer contract',
                    'Negotiate possession date explicitly aligned with MahaRERA registry terms',
                    'Ensure structural defect warranty is covered for 5 years as per RERA Section 14(3)',
                  ].map((r, i) => (
                    <div key={i} className="flex gap-2.5 items-start text-sm">
                      <span className="w-5 h-5 rounded-full bg-navy dark:bg-slate-700 text-white dark:text-slate-200 text-xs flex items-center justify-center flex-shrink-0 font-bold">
                        {i + 1}
                      </span>
                      <span className="text-dark-text dark:text-slate-300 text-xs leading-relaxed">{r}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Button
                variant="ghost"
                size="md"
                className="w-full border border-border dark:border-slate-700 text-dark-text dark:text-slate-200"
                onClick={() => addToast('Downloading PDF risk report...', 'success')}
              >
                📥 Download Risk Report PDF
              </Button>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => addToast('Review request sent to lawyer!', 'success')}
              >
                Request Lawyer Review →
              </Button>

              <DisclaimerBanner />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractRisk;

