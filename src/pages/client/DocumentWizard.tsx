import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Scale, FileText, Gavel, BookOpen, Briefcase, Home, X, Download } from 'lucide-react';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';
import { BAIL_APPLICATION_CONTENT, mockDistricts, mockIPCSections } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const DOC_TYPES = [
  { id: 'Wakalatnama', icon: <Scale size={28} />, desc: 'Power of attorney for your legal representative', label: 'Wakalatnama' },
  { id: 'Petition', icon: <FileText size={28} />, desc: 'Formal written application to a court', label: 'Petition' },
  { id: 'Affidavit', icon: <BookOpen size={28} />, desc: 'Written statement confirmed under oath', label: 'Affidavit' },
  { id: 'Bail Application', icon: <Gavel size={28} />, desc: 'Application for release from custody pending trial', label: 'Bail Application' },
  { id: 'Business Agreement', icon: <Briefcase size={28} />, desc: 'Formal contracts for business transactions', label: 'Business Agreement' },
  { id: 'Rental Agreement', icon: <Home size={28} />, desc: 'Lease agreement for residential or commercial property', label: 'Rental Agreement' },
];

const BAIL_GROUNDS = ['First-time offender', 'Medical condition', 'Sole breadwinner', 'Completed investigation', 'Insufficient evidence', 'Bailable offence'];

interface FormData {
  docType: string;
  fullName: string;
  cnic: string;
  firNumber: string;
  policeStation: string;
  district: string;
  arrestDate: string;
  charges: string;
  grounds: string[];
  suretyName: string;
  suretyCnic: string;
  suretyRelationship: string;
  additionalFacts: string;
}

interface SelectedSection {
  section: string;
  title: string;
}

const DocumentWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useApp();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState<FormData>({
    docType: '',
    fullName: '', cnic: '', firNumber: '', policeStation: '',
    district: 'Pune', arrestDate: '', charges: '',
    grounds: ['First-time offender', 'Medical condition'],
    suretyName: '', suretyCnic: '', suretyRelationship: 'Brother',
    additionalFacts: 'The accused has been falsely implicated and was not present at the alleged scene of the crime.',
  });

  // IPC/BNS section search state
  const [ipcQuery, setIpcQuery] = useState('');
  const [ipcDropdownOpen, setIpcDropdownOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<SelectedSection[]>([]);
  const ipcInputRef = useRef<HTMLInputElement>(null);

  const filteredIPCSections = ipcQuery.trim()
    ? mockIPCSections.filter(s =>
        s.section.toLowerCase().includes(ipcQuery.toLowerCase()) ||
        s.title.toLowerCase().includes(ipcQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ipcInputRef.current && !ipcInputRef.current.closest('.ipc-dropdown-wrapper')?.contains(e.target as Node)) {
        setIpcDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSection = (section: SelectedSection) => {
    if (!selectedSections.find(s => s.section === section.section)) {
      setSelectedSections(prev => [...prev, section]);
    }
    setIpcQuery('');
    setIpcDropdownOpen(false);
  };

  const removeSection = (sectionCode: string) => {
    setSelectedSections(prev => prev.filter(s => s.section !== sectionCode));
  };

  const updateForm = (key: keyof FormData, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleGround = (g: string) =>
    setForm(prev => ({
      ...prev,
      grounds: prev.grounds.includes(g)
        ? prev.grounds.filter(x => x !== g)
        : [...prev.grounds, g],
    }));

  const handleGenerate = async () => {
    setStep(3);
    setGenerating(true);

    const { error } = await supabase
      .from('documents')
      .insert([
        {
          title: `${form.docType} - ${form.fullName || 'Draft'}`,
          type: form.docType,
          status: 'draft',
          content: BAIL_APPLICATION_CONTENT,
          client_id: user?.id,
        }
      ]);

    await new Promise(r => setTimeout(r, 2000));

    if (error) {
      addToast('Failed to save generated draft in database.', 'error');
    } else {
      addToast('Document generated and saved to your dashboard.', 'success');
    }

    setGenerating(false);
  };

  const labelCls = "block text-sm font-medium text-dark-text dark:text-slate-200 mb-1.5";
  const inputCls = "w-full px-3 py-2.5 border border-border dark:border-slate-600 rounded-xl text-sm text-dark-text dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-brand/30 focus:border-blue-brand transition-all";

  // Approximate word count of bail application content
  const wordCount = BAIL_APPLICATION_CONTENT.split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-dark-text dark:text-slate-100">New Document</h1>
        <p className="text-muted-text dark:text-slate-400 text-sm mt-1">AI-powered legal document drafting in minutes</p>
      </div>

      <Stepper
        steps={['Document Type', 'Basic Info', 'Details', 'Review & Generate']}
        currentStep={step}
      />

      {/* Step 0: Choose Type */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-semibold text-dark-text dark:text-slate-100">What document do you need?</h2>
          <div className="grid grid-cols-2 gap-3">
            {DOC_TYPES.map(dt => (
              <button
                key={dt.id}
                onClick={() => updateForm('docType', dt.id)}
                className={`relative flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition-all duration-200
                  hover:-translate-y-0.5 hover:shadow-card-hover
                  ${form.docType === dt.id
                    ? 'border-navy bg-light-blue dark:bg-slate-700 shadow-card'
                    : 'border-border dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-brand/40'}`}
              >
                {form.docType === dt.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                <div className={`${form.docType === dt.id ? 'text-navy dark:text-blue-400' : 'text-muted-text dark:text-slate-400'}`}>
                  {dt.icon}
                </div>
                <div>
                  <div className="font-semibold text-dark-text dark:text-slate-100 text-sm">{dt.label}</div>
                  <div className="text-xs text-muted-text dark:text-slate-400 mt-0.5 leading-relaxed">{dt.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setStep(1)} disabled={!form.docType}>
              Next <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-border/50 dark:border-slate-700 p-6 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-dark-text dark:text-slate-100 mb-2">Basic Information</h2>
          <p className="text-xs text-muted-text dark:text-slate-400 bg-light-blue dark:bg-slate-700 rounded-lg px-3 py-2 mb-4">
            Completing a <strong>{form.docType}</strong>. Fill in the details below.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Full Name of Accused</label>
              <input className={inputCls} value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} placeholder="Rajesh Kumar Patil" />
            </div>
            <div>
              <label className={labelCls}>Aadhaar Number</label>
              <input className={inputCls} value={form.cnic} onChange={e => updateForm('cnic', e.target.value)} placeholder="1234-5678-9012" />
            </div>
            <div>
              <label className={labelCls}>FIR Number</label>
              <input className={inputCls} value={form.firNumber} onChange={e => updateForm('firNumber', e.target.value)} placeholder="112/2026" />
            </div>
            <div>
              <label className={labelCls}>Police Station</label>
              <input className={inputCls} value={form.policeStation} onChange={e => updateForm('policeStation', e.target.value)} placeholder="Shivajinagar, Pune" />
            </div>
            <div>
              <label className={labelCls}>District</label>
              <select className={inputCls} value={form.district} onChange={e => updateForm('district', e.target.value)}>
                {mockDistricts.map(d => (
                  <option key={d.district} value={d.district}>{d.district}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date of Arrest</label>
              <input type="date" className={inputCls} value={form.arrestDate} onChange={e => updateForm('arrestDate', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Charge(s) Filed</label>
              <textarea rows={3} className={inputCls} value={form.charges} onChange={e => updateForm('charges', e.target.value)} placeholder="Section 302 IPC (Murder)" />
            </div>

            {/* IPC/BNS Sections field */}
            <div className="col-span-2">
              <label className={labelCls}>IPC/BNS Sections</label>
              <div className="ipc-dropdown-wrapper relative">
                <input
                  ref={ipcInputRef}
                  className={inputCls}
                  value={ipcQuery}
                  onChange={e => { setIpcQuery(e.target.value); setIpcDropdownOpen(true); }}
                  onFocus={() => ipcQuery.trim() && setIpcDropdownOpen(true)}
                  placeholder="Search section number or title (e.g. IPC 302, Murder)..."
                  autoComplete="off"
                />
                {ipcDropdownOpen && filteredIPCSections.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-border dark:border-slate-600 rounded-xl shadow-lg overflow-hidden">
                    {filteredIPCSections.map(s => (
                      <button
                        key={s.section}
                        type="button"
                        onMouseDown={e => { e.preventDefault(); addSection({ section: s.section, title: s.title }); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-light-blue dark:hover:bg-slate-700 text-dark-text dark:text-slate-100 transition-colors border-b border-border/40 dark:border-slate-700 last:border-b-0"
                      >
                        <span className="font-semibold text-navy dark:text-blue-400">{s.section}</span>
                        <span className="text-muted-text dark:text-slate-400"> — {s.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Selected section chips */}
              {selectedSections.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSections.map(s => (
                    <span
                      key={s.section}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy/10 dark:bg-blue-900/40 text-navy dark:text-blue-300 text-xs font-medium"
                    >
                      {s.section}
                      <button
                        type="button"
                        onClick={() => removeSection(s.section)}
                        className="hover:text-risk transition-colors"
                        aria-label={`Remove ${s.section}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setStep(0)}>← Back</Button>
            <Button onClick={() => setStep(2)}>Next →</Button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-border/50 dark:border-slate-700 p-6 space-y-5">
          <h2 className="font-serif text-lg font-semibold text-dark-text dark:text-slate-100">Bail Application Details</h2>

          <div>
            <label className={labelCls}>Grounds for Bail</label>
            <div className="space-y-2">
              {BAIL_GROUNDS.map(g => (
                <label key={g} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.grounds.includes(g)}
                    onChange={() => toggleGround(g)}
                    className="w-4 h-4 accent-navy rounded"
                  />
                  <span className="text-sm text-dark-text dark:text-slate-200 group-hover:text-navy dark:group-hover:text-blue-400 transition-colors">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Surety Name</label>
              <input className={inputCls} value={form.suretyName} onChange={e => updateForm('suretyName', e.target.value)} placeholder="Suresh Patil" />
            </div>
            <div>
              <label className={labelCls}>Surety Relationship</label>
              <select className={inputCls} value={form.suretyRelationship} onChange={e => updateForm('suretyRelationship', e.target.value)}>
                {['Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Friend', 'Colleague'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Surety CNIC</label>
              <input className={inputCls} value={form.suretyCnic} onChange={e => updateForm('suretyCnic', e.target.value)} placeholder="9876-5432-1098" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Additional Facts</label>
              <textarea rows={4} className={inputCls} value={form.additionalFacts} onChange={e => updateForm('additionalFacts', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
            <Button variant="gold" onClick={handleGenerate}>Generate Draft →</Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Generate */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-border/50 dark:border-slate-700 p-6">
          {generating ? (
            /* Generation animation */
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-light-blue dark:bg-slate-700 flex items-center justify-center">
                  <Scale size={36} className="text-navy dark:text-blue-400 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-t-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-dark-text dark:text-slate-100 text-lg">Generating your bail application...</p>
                <p className="text-sm text-muted-text dark:text-slate-400">Applying legal templates and Maharashtra court formatting</p>
              </div>
              <div className="w-72 h-1.5 bg-light-blue dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full"
                  style={{ width: '70%', transition: 'width 2.5s ease-out' }}
                />
              </div>
            </div>
          ) : (
            /* 2-column preview + summary */
            <div>
              {/* Success header */}
              <div className="flex flex-col items-center py-5 mb-6">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-3">
                  <Check size={24} className="text-success" />
                </div>
                <h2 className="font-serif text-xl font-bold text-dark-text dark:text-slate-100">Your {form.docType} has been drafted!</h2>
                <p className="text-sm text-muted-text dark:text-slate-400 mt-1">Review below and take action</p>
              </div>

              {/* 2-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
                {/* Left: Document preview */}
                <div className="lg:col-span-3 bg-surface-gray dark:bg-slate-900 rounded-xl p-5 font-mono text-xs leading-relaxed text-dark-text dark:text-slate-200 max-h-96 overflow-y-auto border border-border dark:border-slate-700">
                  <div className="text-center mb-4">
                    <div className="text-base font-bold text-navy dark:text-blue-400 font-sans">सत्र न्यायालय, पुणे</div>
                    <div className="text-sm font-bold tracking-wider mt-1">IN THE COURT OF SESSIONS JUDGE PUNE</div>
                    <div className="mt-2 text-xs uppercase tracking-widest text-muted-text dark:text-slate-400">
                      APPLICATION FOR BAIL BEFORE ARREST
                    </div>
                    <div className="mt-1 text-xs text-muted-text dark:text-slate-400">
                      Case No.: FIR {form.firNumber || '112/2026'} | Police Station: {form.policeStation || 'Shivajinagar'}
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-xs">{BAIL_APPLICATION_CONTENT}</pre>
                </div>

                {/* Right: Summary panel */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-navy dark:bg-slate-900 rounded-xl p-4 text-white">
                    <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-3">Document Summary</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-white/50">Document Type</p>
                        <p className="text-sm font-semibold">{form.docType || 'Bail Application'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Client Name</p>
                        <p className="text-sm font-semibold">{form.fullName || 'Ravi Ramesh Patil'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">District</p>
                        <p className="text-sm font-semibold">{form.district}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Word Count</p>
                        <p className="text-sm font-semibold">{wordCount} words</p>
                      </div>
                    </div>
                  </div>

                  {/* IPC Sections */}
                  <div className="bg-light-blue dark:bg-slate-700/50 rounded-xl p-4">
                    <p className="text-xs text-muted-text dark:text-slate-400 uppercase tracking-widest font-semibold mb-2">IPC/BNS Sections</p>
                    {selectedSections.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSections.map(s => (
                          <span
                            key={s.section}
                            className="inline-block px-2 py-0.5 rounded-full bg-navy/10 dark:bg-blue-900/50 text-navy dark:text-blue-300 text-xs font-medium"
                          >
                            {s.section}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-text dark:text-slate-500 italic">No sections added</p>
                    )}
                  </div>

                  {/* Bail Grounds */}
                  <div className="bg-surface-gray dark:bg-slate-700/30 rounded-xl p-4">
                    <p className="text-xs text-muted-text dark:text-slate-400 uppercase tracking-widest font-semibold mb-2">Bail Grounds</p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.grounds.map(g => (
                        <span key={g} className="inline-block px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-medium">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <Download size={14} /> Download PDF
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/client/documents')}>
                  Request Lawyer Review →
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {}}>
                  ✏️ Edit Draft
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentWizard;
