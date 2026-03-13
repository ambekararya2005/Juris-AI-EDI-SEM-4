import React, { useState, useCallback } from 'react';
import { Upload, FileText, ChevronDown, ChevronUp, Scale, Send } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';

const QA_RESPONSES: Record<string, string> = {
  default: 'Based on the document analysis, this agreement contains several standard commercial clauses with some risk areas you should be aware of. I recommend having a lawyer review Clauses 8.1 and 12.3 specifically.',
  delivery: 'According to Clause 4.2, AlphaTech (Supplier) is responsible for the delivery of goods to Zara Traders\' designated warehouse within 14 business days of each confirmed purchase order.',
  payment: 'Clause 7.1 specifies a 2% monthly surcharge on all overdue amounts. Payment terms are net-30 from invoice date, with invoices issued upon dispatch of goods.',
  termination: 'Under Clause 14.4, either party may terminate the agreement with 5 business days written notice. For cause termination, no notice period is specified, which is a risk flag.',
  dispute: 'The agreement does not contain a dispute resolution clause, which is flagged as a HIGH risk item. This leaves parties without a structured process for resolving conflicts.',
};

const SUMMARY_SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <p className="text-sm text-dark-text leading-relaxed">
        This is a commercial supply agreement between AlphaTech (Pvt) Ltd as Supplier and Zara Traders as Buyer, dated January 15, 2026. The agreement governs the supply of technology hardware components over a 12-month period with an estimated contract value of PKR 18,000,000. The agreement is governed by no specific jurisdiction and lacks a dispute resolution mechanism.
      </p>
    ),
  },
  {
    id: 'parties',
    title: 'Key Parties',
    content: (
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-surface-gray text-xs text-muted-text uppercase">
            <th className="px-3 py-2 text-left">Party Name</th>
            <th className="px-3 py-2 text-left">Role</th>
            <th className="px-3 py-2 text-left">Represented By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr><td className="px-3 py-2 font-medium">AlphaTech (Pvt) Ltd</td><td className="px-3 py-2">Supplier</td><td className="px-3 py-2">Kamran Malik, CEO</td></tr>
          <tr><td className="px-3 py-2 font-medium">Zara Traders</td><td className="px-3 py-2">Buyer</td><td className="px-3 py-2">Fatima Zara, Proprietor</td></tr>
        </tbody>
      </table>
    ),
  },
  {
    id: 'obligations',
    title: 'Key Obligations',
    content: (
      <ul className="text-sm space-y-2 text-dark-text">
        {['AlphaTech: Deliver goods within 14 business days of each purchase order', 'AlphaTech: Maintain product quality per ISO 9001 standards', 'Zara Traders: Make payment within 30 days of invoice', 'Zara Traders: Inspect and report defects within 7 days of delivery', 'Both parties: Maintain confidentiality of proprietary information'].map(o => (
          <li key={o} className="flex gap-2 items-start"><span className="text-blue-brand mt-0.5">•</span>{o}</li>
        ))}
      </ul>
    ),
  },
  {
    id: 'dates',
    title: 'Dates & Deadlines',
    content: (
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { date: '15 Jan 2026', label: 'Agreement Date' },
          { date: '15 Feb 2026', label: 'First Delivery' },
          { date: '30 Mar 2026', label: 'Q1 Payment Due' },
          { date: '15 Jan 2027', label: 'Contract Expiry' },
        ].map((d, i, arr) => (
          <React.Fragment key={d.date}>
            <div className="flex flex-col items-center min-w-fit">
              <div className="w-3 h-3 rounded-full bg-navy" />
              <div className="text-xs font-mono text-navy mt-1">{d.date}</div>
              <div className="text-xs text-muted-text">{d.label}</div>
            </div>
            {i < arr.length - 1 && <div className="flex-1 h-0.5 bg-border min-w-[40px]" />}
          </React.Fragment>
        ))}
      </div>
    ),
  },
  {
    id: 'risk',
    title: 'Risk Flags',
    content: (
      <div className="space-y-2">
        {[
          { sev: 'HIGH', text: 'Unlimited liability clause detected — Clause 12.3 imposes uncapped liability on Buyer' },
          { sev: 'HIGH', text: 'No dispute resolution mechanism found in the agreement' },
          { sev: 'MEDIUM', text: 'Unilateral payment amendment rights granted to Supplier (Clause 8.1)' },
        ].map(f => (
          <div key={f.text} className={`flex gap-2 p-2.5 rounded-lg text-sm ${f.sev === 'HIGH' ? 'bg-red-50 text-risk' : 'bg-amber-50 text-amber-700'}`}>
            <span className="font-bold text-xs mt-0.5 flex-shrink-0">[{f.sev}]</span>
            <span>{f.text}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'unusual',
    title: 'Unusual Clauses',
    content: (
      <div className="space-y-2">
        {[
          'Clause 15.1: Auto-renewal with only 5-day opt-out window (standard is 60 days)',
          'Clause 8.1: Supplier can amend payment terms unilaterally with 7 days notice',
        ].map(c => (
          <div key={c} className="flex gap-2 p-2.5 rounded-lg bg-amber-50 text-sm text-amber-800">
            <span>⚠️</span><span>{c}</span>
          </div>
        ))}
      </div>
    ),
  },
];

const PREFILLED_QA = [
  { q: 'Who is responsible for delivery?', a: 'According to Clause 4.2, AlphaTech (Supplier) is responsible for delivery of all goods to Zara Traders\' warehouse. Risk transfers upon delivery and signed acceptance note.' },
  { q: 'What is the penalty for late payment?', a: 'Clause 7.1 specifies a 2% monthly surcharge on all overdue amounts. Additionally, AlphaTech reserves the right to suspend future deliveries after 30 days of non-payment.' },
];

const DocumentSummary: React.FC = () => {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'ready'>('idle');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['overview', 'risk']);
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState(PREFILLED_QA);
  const [answerLoading, setAnswerLoading] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); simulateUpload();
  }, []);

  const simulateUpload = () => {
    setUploadState('uploading');
    let prog = 0;
    const t = setInterval(() => {
      prog += 8;
      setUploadProgress(Math.min(prog, 100));
      if (prog >= 100) { clearInterval(t); setUploadState('ready'); }
    }, 80);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 2000));
    setAnalyzing(false);
    setAnalyzed(true);
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion('');
    setAnswerLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const key = Object.keys(QA_RESPONSES).find(k => q.toLowerCase().includes(k)) || 'default';
    setQaHistory(prev => [...prev, { q, a: QA_RESPONSES[key] }]);
    setAnswerLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="font-serif text-2xl font-bold text-dark-text mb-1">Document Summarization</h1>
      <p className="text-muted-text text-sm mb-6">Upload a legal document for AI-powered intelligent analysis</p>

      <div className={`grid gap-6 ${analyzed ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto'}`}>
        {/* Upload Panel */}
        <Card className="p-6">
          <h2 className="font-serif text-base font-semibold text-dark-text mb-4">Upload Document</h2>

          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => uploadState === 'idle' && simulateUpload()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
              ${dragOver ? 'border-blue-brand bg-light-blue' : 'border-border hover:border-blue-brand hover:bg-surface-gray'}
              ${uploadState !== 'idle' ? 'pointer-events-none' : ''}`}
          >
            {uploadState === 'idle' && (
              <>
                <Upload size={36} className="mx-auto text-muted-text mb-3" />
                <p className="text-sm font-medium text-dark-text">Drop your legal document here</p>
                <p className="text-xs text-muted-text mt-1">or click to browse</p>
              </>
            )}
            {uploadState === 'uploading' && (
              <div className="space-y-3">
                <FileText size={36} className="mx-auto text-blue-brand" />
                <p className="text-sm text-dark-text">Uploading...</p>
                <ProgressBar value={uploadProgress} />
              </div>
            )}
            {uploadState === 'ready' && (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-success text-xl">✓</span>
                </div>
                <p className="text-sm font-medium text-dark-text">Supplier Agreement – AlphaTech vs. Zara Traders.pdf</p>
                <p className="text-xs text-muted-text">2.4 MB • PDF</p>
              </div>
            )}
          </div>

          {uploadState === 'ready' && !analyzed && (
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-4"
              loading={analyzing}
              onClick={handleAnalyze}
            >
              {analyzing ? 'Analyzing...' : 'Summarize Document →'}
            </Button>
          )}

          <p className="text-xs text-muted-text mt-3 text-center">Supported: PDF, DOCX, DOC, TXT</p>
        </Card>

        {/* Results Panel */}
        {analyzed && (
          <div className="space-y-4">
            <div className="bg-navy rounded-2xl p-4 text-white">
              <h2 className="font-serif text-sm font-semibold opacity-70 mb-0.5">Analyzed Document</h2>
              <p className="font-semibold">Supplier Agreement — AlphaTech vs. Zara Traders</p>
              <p className="text-xs opacity-60 mt-1">AI confidence: 94% • 18 clauses detected</p>
            </div>

            <div className="space-y-2">
              {SUMMARY_SECTIONS.map(section => (
                <Card key={section.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-gray/50 transition-colors"
                  >
                    <span className="font-semibold text-dark-text text-sm">{section.title}</span>
                    {openSections.includes(section.id) ? <ChevronUp size={16} className="text-muted-text" /> : <ChevronDown size={16} className="text-muted-text" />}
                  </button>
                  {openSections.includes(section.id) && (
                    <div className="px-4 pb-4 border-t border-border/50 pt-3">
                      {section.content}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Q&A */}
            <Card className="p-5">
              <h3 className="font-serif text-sm font-semibold text-dark-text mb-4 flex items-center gap-2">
                <Scale size={16} className="text-gold" /> Ask about this document
              </h3>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {qaHistory.map((qa, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex gap-2">
                      <span className="text-xs font-semibold text-blue-brand flex-shrink-0">You:</span>
                      <p className="text-xs text-dark-text">{qa.q}</p>
                    </div>
                    <div className="flex gap-2 bg-light-blue rounded-lg p-2.5">
                      <span className="text-xs font-semibold text-gold flex-shrink-0">AI:</span>
                      <p className="text-xs text-dark-text">{qa.a}</p>
                    </div>
                  </div>
                ))}
                {answerLoading && (
                  <div className="flex gap-2 bg-light-blue rounded-lg p-2.5">
                    <span className="text-xs font-semibold text-gold flex-shrink-0">AI:</span>
                    <p className="text-xs text-muted-text animate-pulse">Analyzing...</p>
                  </div>
                )}
              </div>
              <form onSubmit={handleQuestion} className="flex gap-2">
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Ask anything about this document..."
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
                />
                <button type="submit" className="p-2 bg-navy text-white rounded-xl hover:bg-blue-brand transition-colors">
                  <Send size={16} />
                </button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSummary;
