import React, { useState, useCallback } from 'react';
import { Upload, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import RiskGauge from '../../components/ui/RiskGauge';
import { mockRiskFlags } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  HIGH: { bg: 'bg-red-50', text: 'text-risk', border: 'border-red-200' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  LOW: { bg: 'bg-green-50', text: 'text-success', border: 'border-green-200' },
};

const PIE_COLORS = ['#C0392B', '#E8A020', '#1E7E5A'];

const ContractRisk: React.FC = () => {
  const { addToast } = useApp();
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'done'>('done');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [openFlags, setOpenFlags] = useState<string[]>(['r1', 'r2']);
  const [accepted, setAccepted] = useState<string[]>([]);

  const simulateUpload = () => {
    setUploadState('uploading');
    let prog = 0;
    const t = setInterval(() => {
      prog += 10;
      setUploadProgress(Math.min(prog, 100));
      if (prog >= 100) {
        clearInterval(t);
        setUploadState('analyzing');
        setTimeout(() => setUploadState('done'), 2000);
      }
    }, 120);
  };

  const toggleFlag = (id: string) =>
    setOpenFlags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const pieData = [
    { name: 'High Risk', value: 3 },
    { name: 'Medium Risk', value: 2 },
    { name: 'Low Risk', value: 2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-dark-text">Contract Risk Detection</h1>
        <p className="text-muted-text text-sm mt-1">AI-powered analysis of legal risks and unfavorable clauses</p>
      </div>

      {/* Upload area (shown when idle) */}
      {uploadState === 'idle' && (
        <div className="max-w-lg mx-auto">
          <Card className="p-8">
            <div
              onDrop={e => { e.preventDefault(); setDragOver(false); simulateUpload(); }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={simulateUpload}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                ${dragOver ? 'border-blue-brand bg-light-blue' : 'border-border hover:border-blue-brand hover:bg-surface-gray'}`}
            >
              <Upload size={40} className="mx-auto text-muted-text mb-3" />
              <p className="font-medium text-dark-text">Upload a contract to detect risk</p>
              <p className="text-xs text-muted-text mt-1">PDF, DOCX supported</p>
            </div>
          </Card>
        </div>
      )}

      {uploadState === 'uploading' && (
        <div className="max-w-lg mx-auto">
          <Card className="p-8 text-center space-y-4">
            <FileText size={40} className="mx-auto text-blue-brand" />
            <p className="font-medium text-dark-text">Uploading contract...</p>
            <ProgressBar value={uploadProgress} />
          </Card>
        </div>
      )}

      {uploadState === 'analyzing' && (
        <div className="max-w-lg mx-auto">
          <Card className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-light-blue flex items-center justify-center mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-t-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <FileText size={24} className="text-navy" />
            </div>
            <div>
              <p className="font-semibold text-dark-text">Analyzing contract...</p>
              <p className="text-xs text-muted-text mt-1">Detecting risk clauses and legal issues</p>
            </div>
          </Card>
        </div>
      )}

      {uploadState === 'done' && (
        <div>
          {/* Risk Score Banner */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <RiskGauge score={67} />
              <div className="flex-1">
                <p className="text-xs text-muted-text mb-1">Analyzed Document</p>
                <h2 className="font-serif text-lg font-bold text-dark-text mb-3">
                  Supplier Agreement — AlphaTech vs. Zara Traders.pdf
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-risk border border-red-200">
                    4 High Risk Clauses
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    3 Medium Risk
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-success border border-green-200">
                    2 Low Risk
                  </span>
                </div>
              </div>
              <button
                onClick={() => setUploadState('idle')}
                className="text-sm text-muted-text hover:text-navy underline"
              >
                Analyze different contract
              </button>
            </div>
          </Card>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Flagged Clauses */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="font-serif text-base font-semibold text-dark-text">Flagged Clauses</h3>
              {mockRiskFlags.map(flag => {
                const colors = severityColors[flag.severity];
                const isOpen = openFlags.includes(flag.id);
                const isAccepted = accepted.includes(flag.id);
                return (
                  <div
                    key={flag.id}
                    className={`rounded-2xl border-2 overflow-hidden transition-all ${isAccepted ? 'opacity-60 border-success' : colors.border}`}
                  >
                    <button
                      onClick={() => toggleFlag(flag.id)}
                      className={`w-full flex items-center gap-3 p-4 text-left ${colors.bg}`}
                    >
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${colors.text} ${colors.border} bg-white flex-shrink-0`}>
                        {flag.severity}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark-text">{flag.title}</p>
                        <p className="text-xs text-muted-text truncate">{flag.clauseRef}</p>
                      </div>
                      {isOpen ? <ChevronUp size={16} className="text-muted-text flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-text flex-shrink-0" />}
                    </button>

                    {isOpen && (
                      <div className="p-4 bg-white space-y-3">
                        <p className="text-sm text-dark-text">{flag.description}</p>
                        <div>
                          <p className="text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">Original Clause</p>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="font-mono text-xs text-risk leading-relaxed">{flag.originalText}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">AI Suggested Revision</p>
                          <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${isAccepted ? 'ring-2 ring-success' : ''}`}>
                            <p className="font-mono text-xs text-success leading-relaxed">{flag.suggestedRevision}</p>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className={isAccepted ? 'text-success border-success' : ''}
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
                );
              })}
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-5">
                <h3 className="font-serif text-base font-semibold text-dark-text mb-4">Risk Distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="font-serif text-sm font-semibold text-dark-text mb-3">Top 3 Recommendations</h3>
                <div className="space-y-3">
                  {['Add a mutual liability cap tied to contract value', 'Remove or renegotiate unilateral amendment rights', 'Add an arbitration clause for dispute resolution'].map((r, i) => (
                    <div key={i} className="flex gap-2 items-start text-sm">
                      <span className="w-5 h-5 rounded-full bg-navy text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                      <span className="text-dark-text">{r}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Button variant="ghost" size="sm" className="w-full border border-border">
                📥 Download Risk Report PDF
              </Button>
              <Button variant="primary" size="md" className="w-full">
                Request Lawyer Review →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractRisk;
