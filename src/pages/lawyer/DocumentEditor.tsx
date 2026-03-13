import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bold, Italic, Underline, MessageSquare, Lightbulb, Search, BookMarked, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { BAIL_APPLICATION_CONTENT } from '../../data/mockData';

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

const DocumentEditor: React.FC = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'suggestions' | 'precedents' | 'comments'>('suggestions');
  const [finalizeModal, setFinalizeModal] = useState(false);
  const [revisionModal, setRevisionModal] = useState(false);
  const [savedCases, setSavedCases] = useState<string[]>([]);

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)] overflow-hidden">
      {/* Panel 1: Document Info */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
        <Card className="p-4">
          <Badge variant="info" pulse className="mb-3 text-xs">Under Review</Badge>
          <h2 className="font-serif text-sm font-bold text-dark-text leading-snug mb-3">
            Bail Application — Imran Siddiqui
          </h2>
          <div className="space-y-2 text-xs">
            {[
              ['Type', 'Bail Application'],
              ['Client', 'Imran Siddiqui'],
              ['Submitted', '10 Mar 2026'],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-muted-text">{k}: </span>
                <span className="text-dark-text font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 text-xs">
          <p className="font-semibold text-dark-text mb-2">Questionnaire</p>
          {[
            ['Accused', 'Imran Siddiqui'],
            ['FIR', '112/2026'],
            ['Station', 'Gulberg, Lahore'],
            ['Charge', 'Section 302 PPC'],
            ['Grounds', 'First-time offender, Medical condition'],
          ].map(([k, v]) => (
            <div key={k} className="mb-1.5">
              <span className="text-muted-text">{k}: </span>
              <span className="text-dark-text">{v}</span>
            </div>
          ))}
        </Card>

        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full text-xs justify-start" onClick={() => { }}>
            💬 Request More Info
          </Button>
          <Button variant="primary" size="sm" className="w-full text-xs" onClick={() => setFinalizeModal(true)}>
            <CheckCircle size={13} /> Mark Finalized
          </Button>
          <Button variant="secondary" size="sm" className="w-full text-xs text-amber-700" onClick={() => setRevisionModal(true)}>
            Return for Revision
          </Button>
        </div>
      </div>

      {/* Panel 2: Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border flex-wrap">
            {[Bold, Italic, Underline].map((Icon, i) => (
              <button key={i} className="p-1.5 rounded hover:bg-surface-gray text-muted-text hover:text-dark-text transition-colors">
                <Icon size={15} />
              </button>
            ))}
            <div className="w-px h-5 bg-border mx-1" />
            <button className="px-2 py-1 text-xs rounded hover:bg-surface-gray text-muted-text">Heading</button>
            <button className="px-2 py-1 text-xs rounded hover:bg-surface-gray text-muted-text">List</button>
            <button className="px-2 py-1 text-xs rounded hover:bg-surface-gray text-muted-text flex items-center gap-1">
              <MessageSquare size={12} /> Comment
            </button>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-dark-text relative">
            <div className="text-center mb-6">
              <div className="text-xl font-bold text-navy font-sans mb-1">عدالت سیشن جج لاہور</div>
              <div className="text-sm font-bold tracking-wider">IN THE COURT OF SESSIONS JUDGE LAHORE</div>
              <div className="text-xs uppercase tracking-widest text-muted-text mt-1">APPLICATION FOR BAIL BEFORE ARREST</div>
              <div className="text-xs text-muted-text">Case No. FIR 112/2026 Police Station Gulberg</div>
            </div>

            <div className="relative">
              {/* Highlighted section */}
              <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-3 relative group">
                <p className="font-mono text-xs">
                  <strong>4.</strong> That the Applicant suffers from a serious medical condition, namely Type-II Diabetes Mellitus with associated cardiovascular complications, as evidenced by medical certificates and treatment records from Services Hospital, Lahore.
                </p>
                {/* Comment bubble */}
                <div className="absolute right-2 top-1 bg-navy text-white text-[10px] rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity max-w-[200px] z-10">
                  💬 Adnan Raza: Consider citing 2019 SCMR 1244 here
                </div>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs">{BAIL_APPLICATION_CONTENT}</pre>
            </div>
          </div>

          <div className="px-4 py-2 border-t border-border bg-surface-gray/50 flex items-center justify-between text-xs text-muted-text">
            <span>Word count: ~620</span>
            <span>Last saved: 2 minutes ago</span>
          </div>
        </Card>
      </div>

      {/* Panel 3: AI Assistant */}
      <div className="w-72 flex-shrink-0 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-serif text-sm font-semibold text-dark-text flex items-center gap-2">
              <Lightbulb size={15} className="text-gold" /> AI Legal Assistant
            </h3>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {(['suggestions', 'precedents', 'comments'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors
                  ${activeTab === tab ? 'text-navy border-b-2 border-navy' : 'text-muted-text hover:text-dark-text'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === 'suggestions' && AI_SUGGESTIONS.map((s, i) => (
              <div key={i} className={`p-3 rounded-xl border text-xs leading-relaxed
                ${s.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start gap-2 mb-2">{s.icon}<span>{s.text}</span></div>
                <button className="text-xs text-blue-brand hover:underline font-medium">Apply suggestion</button>
              </div>
            ))}

            {activeTab === 'precedents' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input placeholder="Search precedents..." className="flex-1 px-2 py-1.5 text-xs border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-brand" />
                  <button className="p-1.5 bg-navy rounded-lg text-white"><Search size={12} /></button>
                </div>
                {PRECEDENTS.map(p => (
                  <div key={p.citation} className="p-3 bg-surface-gray rounded-xl border border-border/50">
                    <p className="font-semibold text-xs text-dark-text">{p.name}</p>
                    <p className="font-mono text-xs text-gold font-semibold mb-1">{p.citation}</p>
                    <p className="text-xs text-muted-text leading-snug mb-2">{p.summary}</p>
                    <button
                      onClick={() => setSavedCases(prev => prev.includes(p.citation) ? prev.filter(x => x !== p.citation) : [...prev, p.citation])}
                      className={`text-xs flex items-center gap-1 ${savedCases.includes(p.citation) ? 'text-gold' : 'text-muted-text hover:text-navy'}`}
                    >
                      <BookMarked size={11} />
                      {savedCases.includes(p.citation) ? 'Saved' : 'Save to Library'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'comments' && THREADS.map((t, i) => (
              <div key={i} className="p-3 bg-surface-gray rounded-xl border border-border/50">
                <p className="text-xs font-semibold text-navy mb-1">{t.author}</p>
                <p className="text-xs text-dark-text leading-snug mb-1">{t.text}</p>
                <p className="text-[10px] text-muted-text">{t.time}</p>
                <input placeholder="Reply..." className="w-full mt-2 px-2 py-1 text-xs border border-border rounded-lg focus:outline-none" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Finalize Modal */}
      <Modal isOpen={finalizeModal} onClose={() => setFinalizeModal(false)} title="Mark as Finalized" size="sm">
        <p className="text-sm text-dark-text mb-4">Are you sure you want to finalize this document? The client will be notified.</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setFinalizeModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setFinalizeModal(false)}>Confirm Finalize</Button>
        </div>
      </Modal>

      {/* Revision Modal */}
      <Modal isOpen={revisionModal} onClose={() => setRevisionModal(false)} title="Return for Revision" size="sm">
        <textarea rows={3} placeholder="Add revision notes for the client..." className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-brand/30 mb-4" />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setRevisionModal(false)}>Cancel</Button>
          <Button variant="secondary" onClick={() => setRevisionModal(false)}>Send Revision Request</Button>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentEditor;
