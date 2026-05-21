import React, { useState, useEffect, useRef } from 'react';
import {
  Bold, Italic, Underline, MessageSquare, Lightbulb, Search,
  BookMarked, CheckCircle, AlertTriangle, Info, Clock, History,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { BAIL_APPLICATION_CONTENT } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

// ─── Constants ──────────────────────────────────────────────────────────────

const AI_SUGGESTIONS = [
  {
    type: 'warning',
    icon: <AlertTriangle size={14} className="text-amber-500" />,
    text: 'The grounds of medical condition requires supporting documentation (medical certificate). Consider adding a clause referencing Exhibit-A.',
  },
  {
    type: 'info',
    icon: <Info size={14} className="text-blue-brand" />,
    text: 'Citing PLD 2021 SC 445 would strengthen the bail grounds for first-time offenders. This Supreme Court ruling is directly on point.',
  },
  {
    type: 'info',
    icon: <Info size={14} className="text-blue-brand" />,
    text: 'The prayer clause should explicitly mention Article 9 of the Constitution as a constitutional grounding for bail entitlement.',
  },
];

const PRECEDENTS = [
  { name: 'Akhtar v. State', citation: 'PLD 2021 SC 445', summary: 'Bail is the rule and jail is the exception. Denial of bail violates Article 10-A fair trial rights.' },
  { name: 'Re: Bail Conditions', citation: '2019 SCMR 1244', summary: 'Medical grounds are sufficient cause for bail where the accused suffers from ailment requiring specialized care.' },
  { name: 'Muhammad Ali v. State', citation: 'PLJ 2020 Lah 88', summary: 'Sole breadwinner status and no prior criminal record weighs heavily in favor of bail.' },
];

const THREADS = [
  { author: 'Adnan Raza (You)', text: 'Consider citing 2019 SCMR 1244 here to strengthen the medical grounds argument.', time: '2h ago' },
  { author: 'AI Suggestion', text: 'Surety details are incomplete — surety CNIC and relationship have not been provided in the petition.', time: '1h ago' },
];

const VERSION_HISTORY = [
  { v: 3, date: 'Today', label: 'Lawyer edits' },
  { v: 2, date: 'Yesterday', label: 'Client revised' },
  { v: 1, date: '3 days ago', label: 'AI generated' },
];

// ─── Word Count Helpers ───────────────────────────────────────────────────────

function calcWordCount(text: string) {
  return Math.round(text.length / 5);
}
function calcReadingTime(words: number) {
  return Math.max(1, Math.round(words / 200));
}

// ─── Inline Comment Popover ───────────────────────────────────────────────────

interface CommentPopoverProps {
  author: string;
  time: string;
  comment: string;
  onClose: () => void;
}

const CommentPopover: React.FC<CommentPopoverProps> = ({ author, time, comment, onClose }) => {
  const [reply, setReply] = useState('');
  const { addToast } = useApp();

  return (
    <div
      className="absolute z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-border dark:border-slate-700 p-3 w-64 top-full mt-1 left-0"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-navy dark:text-gold">{author}</span>
        <span className="text-[10px] text-muted-text dark:text-slate-400">{time}</span>
      </div>
      <p className="text-xs text-dark-text dark:text-slate-200 leading-relaxed mb-2">{comment}</p>
      <div className="flex gap-1">
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          rows={2}
          placeholder="Add a reply..."
          className="flex-1 px-2 py-1 text-xs border border-border dark:border-slate-700 bg-white dark:bg-slate-900 text-dark-text dark:text-slate-100 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-brand/30"
        />
        <button
          onClick={() => {
            addToast('Reply sent', 'success');
            setReply('');
            onClose();
          }}
          className="self-end px-2 py-1 bg-navy dark:bg-blue-brand text-white text-xs rounded-lg hover:bg-blue-brand dark:hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const DocumentEditor: React.FC = () => {
  const { addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'suggestions' | 'precedents' | 'comments'>('suggestions');
  const [finalizeModal, setFinalizeModal] = useState(false);
  const [revisionModal, setRevisionModal] = useState(false);
  const [savedCases, setSavedCases] = useState<string[]>([]);

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');

  // Popover state: null = closed, 'ipc' | 'medical'
  const [activePopover, setActivePopover] = useState<'ipc' | 'medical' | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // ── Auto-save interval ──────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setSaveStatus('saving');
      setTimeout(() => setSaveStatus('saved'), 3000);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  // ── Close popovers on outside click ────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const words = calcWordCount(BAIL_APPLICATION_CONTENT);
  const readingMin = calcReadingTime(words);

  return (
    <div 
      className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[calc(100vh-8rem)] overflow-y-auto lg:overflow-hidden" 
      ref={editorRef}
    >

      {/* ═══════════════════════════════════════════════════════════════════════
          Panel 1 — Document Info
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-56 flex-shrink-0 flex flex-col gap-3 lg:overflow-y-auto">
        <Card className="p-4">
          <Badge variant="info" pulse className="mb-3 text-xs">Under Review</Badge>
          <h2 className="font-serif text-sm font-bold text-dark-text dark:text-slate-100 leading-snug mb-3">
            Bail Application — Imran Siddiqui
          </h2>
          <div className="space-y-2 text-xs">
            {[
              ['Type', 'Bail Application'],
              ['Client', 'Imran Siddiqui'],
              ['Submitted', '10 Mar 2026'],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-muted-text dark:text-slate-400">{k}: </span>
                <span className="text-dark-text dark:text-slate-200 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 text-xs">
          <p className="font-semibold text-dark-text dark:text-slate-100 mb-2">Questionnaire</p>
          {[
            ['Accused', 'Imran Siddiqui'],
            ['FIR', '112/2026'],
            ['Station', 'Shivajinagar, Pune'],
            ['Charge', 'Section 302 IPC'],
            ['Grounds', 'First-time offender, Medical condition'],
          ].map(([k, v]) => (
            <div key={k} className="mb-1.5">
              <span className="text-muted-text dark:text-slate-400">{k}: </span>
              <span className="text-dark-text dark:text-slate-200">{v}</span>
            </div>
          ))}
        </Card>

        {/* Version History */}
        <Card className="p-4">
          <p className="font-semibold text-dark-text dark:text-slate-100 text-xs mb-3 flex items-center gap-1.5">
            <History size={13} className="text-muted-text dark:text-slate-400" /> Version History
          </p>
          <div className="space-y-2">
            {VERSION_HISTORY.map(({ v, date, label }) => (
              <div key={v} className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-bold bg-navy dark:bg-blue-900/60 text-white dark:text-blue-300 px-1.5 py-0.5 rounded-md shrink-0">
                  v{v}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-text dark:text-slate-400 truncate">{date}</p>
                  <p className="text-[10px] text-dark-text dark:text-slate-200 truncate">{label}</p>
                </div>
                <button
                  onClick={() => addToast(`Viewing v${v}`, 'info')}
                  className="text-[10px] text-blue-brand dark:text-blue-400 hover:underline shrink-0"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs justify-start dark:text-slate-300 dark:hover:bg-slate-700" 
            onClick={() => addToast('Request sent to client', 'success')}
          >
            💬 Request More Info
          </Button>
          <Button variant="primary" size="sm" className="w-full text-xs" onClick={() => setFinalizeModal(true)}>
            <CheckCircle size={13} /> Mark Finalized
          </Button>
          <Button variant="secondary" size="sm" className="w-full text-xs text-amber-700 dark:text-amber-500" onClick={() => setRevisionModal(true)}>
            Return for Revision
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          Panel 2 — Editor
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:flex-1 min-w-0 flex flex-col min-h-[500px] lg:h-auto">
        <Card className="flex-1 flex flex-col overflow-hidden border border-border dark:border-slate-700">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border dark:border-slate-700 flex-wrap">
            {[Bold, Italic, Underline].map((Icon, i) => (
              <button 
                key={i} 
                className="p-1.5 rounded hover:bg-surface-gray dark:hover:bg-slate-700 text-muted-text dark:text-slate-400 hover:text-dark-text dark:hover:text-slate-200 transition-colors"
              >
                <Icon size={15} />
              </button>
            ))}
            <div className="w-px h-5 bg-border dark:bg-slate-700 mx-1" />
            <button className="px-2 py-1 text-xs rounded hover:bg-surface-gray dark:hover:bg-slate-700 text-muted-text dark:text-slate-400 dark:hover:text-slate-200">Heading</button>
            <button className="px-2 py-1 text-xs rounded hover:bg-surface-gray dark:hover:bg-slate-700 text-muted-text dark:text-slate-400 dark:hover:text-slate-200">List</button>
            <button className="px-2 py-1 text-xs rounded hover:bg-surface-gray dark:hover:bg-slate-700 text-muted-text dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1">
              <MessageSquare size={12} /> Comment
            </button>

            {/* Auto-save indicator */}
            <div className="ml-auto flex items-center gap-1 text-xs">
              {saveStatus === 'saving' && (
                <span className="text-muted-text dark:text-slate-400 flex items-center gap-1">
                  <Clock size={11} className="animate-spin" /> Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">All changes saved ✓</span>
              )}
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-dark-text dark:text-slate-100 bg-white dark:bg-slate-900">
            {/* Document header */}
            <div className="text-center mb-6">
              <div className="text-xl font-bold text-navy dark:text-gold font-sans mb-1">सत्र न्यायालय, पुणे</div>
              <div className="text-sm font-bold tracking-wider text-dark-text dark:text-slate-200">IN THE COURT OF SESSIONS JUDGE PUNE</div>
              <div className="text-xs uppercase tracking-widest text-muted-text dark:text-slate-400 mt-1">APPLICATION FOR BAIL BEFORE ARREST</div>
              <div className="text-xs text-muted-text dark:text-slate-400">Case No. FIR 112/2026 Police Station Shivajinagar</div>
            </div>

            <div className="relative space-y-3">

              {/* IPC sections highlight */}
              <div className="relative inline">
                <span
                  className="bg-yellow-200 dark:bg-yellow-800/60 text-dark-text dark:text-slate-100 px-0.5 rounded cursor-pointer hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
                  onClick={e => { e.stopPropagation(); setActivePopover(activePopover === 'ipc' ? null : 'ipc'); }}
                >
                  Section 420 and 406
                </span>
                {activePopover === 'ipc' && (
                  <CommentPopover
                    author="Adv. Rahul Joshi"
                    time="2h ago"
                    comment="Verify IPC section references against FIR copy"
                    onClose={() => setActivePopover(null)}
                  />
                )}
              </div>

              {/* Medical condition highlight */}
              <div
                className="bg-amber-50 dark:bg-slate-800/40 border border-amber-200 dark:border-slate-700 rounded px-2 py-1 relative group"
                onClick={e => e.stopPropagation()}
              >
                <p className="font-mono text-xs text-dark-text dark:text-slate-200">
                  <strong>4.</strong> That the Applicant suffers from a serious medical condition, namely{' '}
                  <span
                    className="bg-yellow-200 dark:bg-yellow-800/60 px-0.5 rounded cursor-pointer hover:bg-yellow-300 dark:hover:bg-yellow-750 transition-colors relative"
                    onClick={e => { e.stopPropagation(); setActivePopover(activePopover === 'medical' ? null : 'medical'); }}
                  >
                    Type-II Diabetes Mellitus with associated cardiovascular complications, as evidenced by medical certificates and treatment records from KEM Hospital, Pune
                    {activePopover === 'medical' && (
                      <CommentPopover
                        author="Adv. Rahul Joshi"
                        time="1h ago"
                        comment="Please attach Exhibit-A from KEM Hospital"
                        onClose={() => setActivePopover(null)}
                      />
                    )}
                  </span>.
                </p>
                {/* Original comment bubble */}
                <div className="absolute right-2 top-1 bg-navy text-white text-[10px] rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity max-w-[200px] z-10 shadow-lg">
                  💬 Adnan Raza: Consider citing 2019 SCMR 1244 here
                </div>
              </div>

              <pre className="whitespace-pre-wrap font-mono text-xs text-dark-text dark:text-slate-300">{BAIL_APPLICATION_CONTENT}</pre>
            </div>
          </div>

          {/* Footer — word count + reading time */}
          <div className="px-4 py-2 border-t border-border dark:border-slate-700 bg-surface-gray/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-muted-text dark:text-slate-400">
            <span>Words: {words} | Reading time: ~{readingMin} min</span>
            <span>Last saved: 2 minutes ago</span>
          </div>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          Panel 3 — AI Assistant
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col min-h-[400px] lg:h-auto">
        <Card className="flex-1 flex flex-col overflow-hidden border border-border dark:border-slate-700">
          <div className="px-4 py-3 border-b border-border dark:border-slate-700">
            <h3 className="font-serif text-sm font-semibold text-dark-text dark:text-slate-100 flex items-center gap-2">
              <Lightbulb size={15} className="text-gold" /> AI Legal Assistant
            </h3>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border dark:border-slate-700">
            {(['suggestions', 'precedents', 'comments'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors
                  ${activeTab === tab 
                    ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold font-semibold' 
                    : 'text-muted-text dark:text-slate-400 hover:text-dark-text dark:hover:text-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-800">

            {/* Suggestions tab */}
            {activeTab === 'suggestions' && AI_SUGGESTIONS.map((s, i) => (
              <div key={i} className={`p-3 rounded-xl border text-xs leading-relaxed
                ${s.type === 'warning' 
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-dark-text dark:text-slate-300' 
                  : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 text-dark-text dark:text-slate-300'}`}>
                <div className="flex items-start gap-2 mb-2">{s.icon}<span>{s.text}</span></div>
                <button
                  onClick={() => addToast('Suggestion inserted into document', 'success')}
                  className="text-xs text-blue-brand dark:text-blue-400 hover:underline font-medium"
                >
                  Insert into doc
                </button>
              </div>
            ))}

            {/* Precedents tab */}
            {activeTab === 'precedents' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input 
                    placeholder="Search precedents..." 
                    className="flex-1 px-2 py-1.5 text-xs border border-border dark:border-slate-700 bg-white dark:bg-slate-900 text-dark-text dark:text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-brand" 
                  />
                  <button 
                    onClick={() => addToast('Precedent search completed', 'success')}
                    className="p-1.5 bg-navy dark:bg-blue-brand text-white rounded-lg hover:opacity-90"
                  >
                    <Search size={12} />
                  </button>
                </div>
                {PRECEDENTS.map(p => (
                  <div key={p.citation} className="p-3 bg-surface-gray dark:bg-slate-900/40 rounded-xl border border-border/50 dark:border-slate-700/50">
                    <p className="font-semibold text-xs text-dark-text dark:text-slate-200">{p.name}</p>
                    <p className="font-mono text-xs text-gold font-semibold mb-1">{p.citation}</p>
                    <p className="text-xs text-muted-text dark:text-slate-400 leading-snug mb-2">{p.summary}</p>
                    <button
                      onClick={() => setSavedCases(prev => prev.includes(p.citation) ? prev.filter(x => x !== p.citation) : [...prev, p.citation])}
                      className={`text-xs flex items-center gap-1 ${savedCases.includes(p.citation) ? 'text-gold' : 'text-muted-text dark:text-slate-400 hover:text-navy dark:hover:text-slate-200'}`}
                    >
                      <BookMarked size={11} />
                      {savedCases.includes(p.citation) ? 'Saved' : 'Save to Library'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Comments tab */}
            {activeTab === 'comments' && THREADS.map((t, i) => (
              <div key={i} className="p-3 bg-surface-gray dark:bg-slate-900/40 rounded-xl border border-border/50 dark:border-slate-700/50">
                <p className="text-xs font-semibold text-navy dark:text-gold mb-1">{t.author}</p>
                <p className="text-xs text-dark-text dark:text-slate-300 leading-snug mb-1">{t.text}</p>
                <p className="text-[10px] text-muted-text dark:text-slate-500">{t.time}</p>
                <div className="flex gap-1 mt-2">
                  <input 
                    placeholder="Reply..." 
                    className="flex-grow px-2 py-1 text-xs border border-border dark:border-slate-700 bg-white dark:bg-slate-900 text-dark-text dark:text-slate-200 rounded-lg focus:outline-none" 
                  />
                  <button 
                    onClick={() => addToast('Reply added', 'success')}
                    className="px-2 py-1 text-[10px] bg-navy dark:bg-blue-brand text-white rounded hover:opacity-90"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Finalize Modal */}
      <Modal isOpen={finalizeModal} onClose={() => setFinalizeModal(false)} title="Mark as Finalized" size="sm">
        <p className="text-sm text-dark-text dark:text-slate-300 mb-4">Are you sure you want to finalize this document? The client will be notified.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setFinalizeModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => { setFinalizeModal(false); addToast('Document finalized successfully!', 'success'); }}>Confirm Finalize</Button>
        </div>
      </Modal>

      {/* Revision Modal */}
      <Modal isOpen={revisionModal} onClose={() => setRevisionModal(false)} title="Return for Revision" size="sm">
        <textarea 
          rows={3} 
          placeholder="Add revision notes for the client..." 
          className="w-full px-3 py-2 border border-border dark:border-slate-700 bg-white dark:bg-slate-900 text-dark-text dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-brand/30 mb-4" 
        />
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setRevisionModal(false)}>Cancel</Button>
          <Button variant="secondary" onClick={() => { setRevisionModal(false); addToast('Revision request sent to client', 'info'); }}>Send Revision Request</Button>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentEditor;
