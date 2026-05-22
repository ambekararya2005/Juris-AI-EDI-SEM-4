import React, { useState, useCallback } from 'react';
import { Upload, FileText, ChevronDown, ChevronUp, Scale, Send, Download } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import Skeleton from '../../components/ui/Skeleton';
import { useApp } from '../../context/AppContext';
import { summarizeDocument, askDocumentQuestion, askDocumentQuestionInline } from '../../lib/api';
import DisclaimerBanner from '../../components/DisclaimerBanner';

const QA_RESPONSES: Record<string, string> = {
  default: 'Based on the document analysis, this agreement contains several standard commercial clauses with some risk areas you should be aware of. I recommend having a lawyer review Clauses 8.1 and 12.3 specifically.',
  delivery: 'According to Clause 4.2, TechNova Pvt. Ltd. (Supplier) is responsible for the delivery of goods to Zenith Traders\' designated warehouse within 14 business days of each confirmed purchase order.',
  payment: 'Clause 7.1 specifies a 2% monthly surcharge on all overdue amounts. Payment terms are net-30 from invoice date, with invoices issued upon dispatch of goods.',
  termination: 'Under Clause 14.4, either party may terminate the agreement with 5 business days written notice. For cause termination, no notice period is specified, which is a risk flag.',
  dispute: 'The agreement does not contain a dispute resolution clause, which is flagged as a HIGH risk item. This leaves parties without a structured process for resolving conflicts.',
  risk: 'The document has two HIGH risk flags: an unlimited liability clause (Clause 12.3) and the absence of a dispute resolution mechanism. There is also one MEDIUM risk regarding unilateral payment amendment rights (Clause 8.1).',
  parties: 'The two key parties are TechNova Pvt. Ltd. (Supplier), represented by Rajesh Mehta (CEO), and Zenith Traders (Buyer), represented by Priya Sharma (Proprietor).',
  section: 'Section 3 of the agreement covers the duration of the contract — a 12-month period commencing January 15, 2026, with an estimated contract value of ₹1,80,00,000.',
};

// Confidence scores per section
const SECTION_CONFIDENCE: Record<string, number> = {
  overview: 94,
  parties: 98,
  obligations: 91,
  dates: 88,
  risk: 87,
  unusual: 79,
};

const SUMMARY_SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <p className="text-sm text-dark-text dark:text-slate-200 leading-relaxed">
        This is a commercial supply agreement between TechNova Pvt. Ltd. as Supplier and Zenith Traders as Buyer, dated January 15, 2026. The agreement governs the supply of technology hardware components over a 12-month period with an estimated contract value of ₹1,80,00,000. The agreement is governed by no specific jurisdiction and lacks a dispute resolution mechanism.
      </p>
    ),
  },
  {
    id: 'parties',
    title: 'Key Parties',
    content: (
      <table className="w-full text-sm border border-border dark:border-slate-700 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-surface-gray dark:bg-slate-700 text-xs text-muted-text dark:text-slate-400 uppercase">
            <th className="px-3 py-2 text-left">Party Name</th>
            <th className="px-3 py-2 text-left">Role</th>
            <th className="px-3 py-2 text-left">Represented By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-slate-700">
          <tr><td className="px-3 py-2 font-medium dark:text-slate-100">TechNova Pvt. Ltd.</td><td className="px-3 py-2 dark:text-slate-300">Supplier</td><td className="px-3 py-2 dark:text-slate-300">Rajesh Mehta, CEO</td></tr>
          <tr><td className="px-3 py-2 font-medium dark:text-slate-100">Zenith Traders</td><td className="px-3 py-2 dark:text-slate-300">Buyer</td><td className="px-3 py-2 dark:text-slate-300">Priya Sharma, Proprietor</td></tr>
        </tbody>
      </table>
    ),
  },
  {
    id: 'obligations',
    title: 'Key Obligations',
    content: (
      <ul className="text-sm space-y-2 text-dark-text dark:text-slate-200">
        {['TechNova Pvt. Ltd.: Deliver goods within 14 business days of each purchase order', 'TechNova Pvt. Ltd.: Maintain product quality per ISO 9001 standards', 'Zenith Traders: Make payment within 30 days of invoice', 'Zenith Traders: Inspect and report defects within 7 days of delivery', 'Both parties: Maintain confidentiality of proprietary information'].map(o => (
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
              <div className="w-3 h-3 rounded-full bg-navy dark:bg-blue-400" />
              <div className="text-xs font-mono text-navy dark:text-blue-400 mt-1">{d.date}</div>
              <div className="text-xs text-muted-text dark:text-slate-400">{d.label}</div>
            </div>
            {i < arr.length - 1 && <div className="flex-1 h-0.5 bg-border dark:bg-slate-600 min-w-[40px]" />}
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
          <div key={f.text} className={`flex gap-2 p-2.5 rounded-lg text-sm ${f.sev === 'HIGH' ? 'bg-red-50 dark:bg-red-900/20 text-risk' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
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
          <div key={c} className="flex gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-300">
            <span>⚠️</span><span>{c}</span>
          </div>
        ))}
      </div>
    ),
  },
];

const PREFILLED_QA = [
  { q: 'Who is responsible for delivery?', a: 'According to Clause 4.2, TechNova Pvt. Ltd. (Supplier) is responsible for delivery of all goods to Zenith Traders\' warehouse. Risk transfers upon delivery and signed acceptance note.' },
  { q: 'What is the penalty for late payment?', a: 'Clause 7.1 specifies a 2% monthly surcharge on all overdue amounts. Additionally, TechNova Pvt. Ltd. reserves the right to suspend future deliveries after 30 days of non-payment.' },
];

// Suggested question chips
const SUGGESTED_QUESTIONS = [
  'What are the key risks?',
  'Who are the parties?',
  'Summarize Section 3',
  'What is the payment term?',
];

// Map suggested chip questions to QA_RESPONSES keys
const CHIP_KEY_MAP: Record<string, string> = {
  'What are the key risks?': 'risk',
  'Who are the parties?': 'parties',
  'Summarize Section 3': 'section',
  'What is the payment term?': 'payment',
};

/** Thin confidence bar shown next to section title */
const ConfidenceBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="flex items-center gap-2 ml-auto flex-shrink-0">
    <div className="w-20 h-1.5 bg-border dark:bg-slate-600 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
    <span className="text-xs text-muted-text dark:text-slate-400 w-8 text-right">{pct}%</span>
  </div>
);

const DocumentSummary: React.FC = () => {
  const { addToast } = useApp();
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'ready'>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [summaryData, setSummaryData] = useState<Record<string, unknown> | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['overview', 'risk']);
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState(PREFILLED_QA);
  const [answerLoading, setAnswerLoading] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file);
    setUploadState('uploading');
    setAnalyzed(false);
    setSummaryData(null);
    let prog = 0;
    const t = setInterval(() => {
      prog += 20;
      setUploadProgress(Math.min(prog, 100));
      if (prog >= 100) {
        clearInterval(t);
        setUploadState('ready');
      }
    }, 60);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    setAnalyzing(true);
    setSkeletonLoading(true);
    try {
      const data = await summarizeDocument(uploadedFile);
      setSummaryData(data);
      setDocumentId(data.document_id ? String(data.document_id) : null);
      setExtractedText(String(data.extracted_text || ''));
      setAnalyzed(true);
      addToast('Document summarized successfully', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Summarization failed'
      addToast(msg.length > 120 ? `${msg.slice(0, 120)}…` : msg, 'error');
    } finally {
      setAnalyzing(false);
      setSkeletonLoading(false);
    }
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const submitQuestion = async (q: string) => {
    if (!q.trim()) return;
    setQuestion('');
    setAnswerLoading(true);
    try {
      if (extractedText) {
        const { answer } = await askDocumentQuestionInline(extractedText, q, []);
        setQaHistory(prev => [...prev, { q, a: answer }]);
      } else if (documentId) {
        const { answer } = await askDocumentQuestion(documentId, q, []);
        setQaHistory(prev => [...prev, { q, a: answer }]);
      } else {
        const key = Object.keys(QA_RESPONSES).find(k => q.toLowerCase().includes(k)) || 'default';
        setQaHistory(prev => [...prev, { q, a: QA_RESPONSES[key] }]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not get an answer.'
      addToast(msg, 'error');
    } finally {
      setAnswerLoading(false);
    }
  };

  const handleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitQuestion(question.trim());
  };

  const handleChipClick = async (chip: string) => {
    setQuestion(chip);
    const key = CHIP_KEY_MAP[chip] || 'default';
    setAnswerLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setQaHistory(prev => [...prev, { q: chip, a: QA_RESPONSES[key] }]);
    setAnswerLoading(false);
    setQuestion('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="font-serif text-2xl font-bold text-dark-text dark:text-slate-100 mb-1">Document Summarization</h1>
      <p className="text-muted-text dark:text-slate-400 text-sm mb-6">Upload a legal document for AI-powered intelligent analysis</p>

      <div className={`grid gap-6 ${analyzed ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto'}`}>
        {/* Upload Panel */}
        <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100 mb-4">Upload Document</h2>

          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => uploadState === 'idle' && document.getElementById('summary-file-input')?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
              ${dragOver ? 'border-blue-brand bg-light-blue dark:bg-slate-700' : 'border-border dark:border-slate-600 hover:border-blue-brand hover:bg-surface-gray dark:hover:bg-slate-700'}
              ${uploadState !== 'idle' ? 'pointer-events-none' : ''}`}
          >
            {uploadState === 'idle' && (
              <>
                <Upload size={36} className="mx-auto text-muted-text dark:text-slate-400 mb-3" />
                <p className="text-sm font-medium text-dark-text dark:text-slate-200">Drop your legal document here</p>
                <p className="text-xs text-muted-text dark:text-slate-400 mt-1">or click to browse</p>
              </>
            )}
            {uploadState === 'uploading' && (
              <div className="space-y-3">
                <FileText size={36} className="mx-auto text-blue-brand" />
                <p className="text-sm text-dark-text dark:text-slate-200">Uploading...</p>
                <ProgressBar value={uploadProgress} />
              </div>
            )}
            {uploadState === 'ready' && (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-success text-xl">✓</span>
                </div>
                <p className="text-sm font-medium text-dark-text dark:text-slate-100">{uploadedFile?.name}</p>
                <p className="text-xs text-muted-text dark:text-slate-400">
                  {uploadedFile
                    ? uploadedFile.size < 1024
                      ? `${uploadedFile.size} bytes`
                      : `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
                    : ''}
                </p>
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

          <p className="text-xs text-muted-text dark:text-slate-400 mt-3 text-center">Supported: PDF, DOCX</p>
          <input
            id="summary-file-input"
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
        </Card>

        {/* Results Panel */}
        {analyzed ? (
          <div className="space-y-4">
            <>
            {/* Document header + Export PDF button */}
            <div className="bg-navy dark:bg-slate-900 rounded-2xl p-4 text-white flex items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-sm font-semibold opacity-70 mb-0.5">Analyzed Document</h2>
                <p className="font-semibold">{uploadedFile?.name || 'Analyzed document'}</p>
                <p className="text-xs opacity-60 mt-1">
                  {summaryData?.jurisdiction ? String(summaryData.jurisdiction) : 'AI summary ready'}
                </p>
              </div>
              <button
                onClick={() => addToast('Summary exported as PDF', 'success')}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                title="Export PDF"
              >
                <Download size={13} />
                Export PDF
              </button>
            </div>

            {summaryData?.overview && (
              <Card className="p-4 dark:bg-slate-800">
                <h3 className="font-semibold text-sm mb-2">Overview</h3>
                <p className="text-sm text-dark-text dark:text-slate-200">{String(summaryData.overview)}</p>
              </Card>
            )}

            <div className="space-y-2">
              {SUMMARY_SECTIONS.map(section => (
                <Card key={section.id} className="overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-gray/50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="font-semibold text-dark-text dark:text-slate-100 text-sm">{section.title}</span>
                    {/* Confidence bar */}
                    <ConfidenceBar pct={SECTION_CONFIDENCE[section.id] ?? 90} />
                    {openSections.includes(section.id)
                      ? <ChevronUp size={16} className="text-muted-text dark:text-slate-400 ml-2 flex-shrink-0" />
                      : <ChevronDown size={16} className="text-muted-text dark:text-slate-400 ml-2 flex-shrink-0" />}
                  </button>
                  {openSections.includes(section.id) && (
                    <div className="px-4 pb-4 border-t border-border/50 dark:border-slate-700 pt-3">
                      {skeletonLoading ? (
                        <div className="space-y-2">
                          <Skeleton height="0.75rem" count={3} className="mb-2" />
                        </div>
                      ) : (
                        section.content
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <DisclaimerBanner />

            {/* Q&A */}
            <Card className="p-5 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="font-serif text-sm font-semibold text-dark-text dark:text-slate-100 mb-4 flex items-center gap-2">
                <Scale size={16} className="text-gold" /> Ask about this document
              </h3>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {qaHistory.map((qa, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex gap-2">
                      <span className="text-xs font-semibold text-blue-brand flex-shrink-0">You:</span>
                      <p className="text-xs text-dark-text dark:text-slate-200">{qa.q}</p>
                    </div>
                    <div className="flex gap-2 bg-light-blue dark:bg-slate-700 rounded-lg p-2.5">
                      <span className="text-xs font-semibold text-gold flex-shrink-0">AI:</span>
                      <p className="text-xs text-dark-text dark:text-slate-200">{qa.a}</p>
                    </div>
                  </div>
                ))}
                {answerLoading && (
                  <div className="flex gap-2 bg-light-blue dark:bg-slate-700 rounded-lg p-2.5">
                    <span className="text-xs font-semibold text-gold flex-shrink-0">AI:</span>
                    <p className="text-xs text-muted-text dark:text-slate-400 animate-pulse">Analyzing...</p>
                  </div>
                )}
              </div>

              {/* Suggested question chips */}
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_QUESTIONS.map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    disabled={answerLoading}
                    className="px-2.5 py-1 text-xs rounded-full border border-blue-brand/30 dark:border-blue-500/30 text-blue-brand dark:text-blue-400 bg-light-blue dark:bg-slate-700 hover:bg-blue-brand/10 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <form onSubmit={handleQuestion} className="flex gap-2">
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Ask anything about this document..."
                  className="flex-1 px-3 py-2 text-sm border border-border dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-brand/30 bg-white dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                />
                <button type="submit" className="p-2 bg-navy dark:bg-blue-700 text-white rounded-xl hover:bg-blue-brand transition-colors">
                  <Send size={16} />
                </button>
              </form>
            </Card>
            </>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DocumentSummary;
