import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Scale, FileText, Gavel, BookOpen, Briefcase, Home } from 'lucide-react';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';
import { BAIL_APPLICATION_CONTENT } from '../../data/mockData';

const DOC_TYPES = [
  { id: 'Wakalatnama', icon: <Scale size={28} />, desc: 'Power of attorney for your legal representative', label: 'Wakalatnama' },
  { id: 'Petition', icon: <FileText size={28} />, desc: 'Formal written application to a court', label: 'Petition' },
  { id: 'Affidavit', icon: <BookOpen size={28} />, desc: 'Written statement confirmed under oath', label: 'Affidavit' },
  { id: 'Bail Application', icon: <Gavel size={28} />, desc: 'Application for release from custody pending trial', label: 'Bail Application' },
  { id: 'Business Agreement', icon: <Briefcase size={28} />, desc: 'Formal contracts for business transactions', label: 'Business Agreement' },
  { id: 'Rental Agreement', icon: <Home size={28} />, desc: 'Lease agreement for residential or commercial property', label: 'Rental Agreement' },
];

const DISTRICTS = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Aurangabad', 'Kolhapur', 'Solapur', 'Thane'];
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

const DocumentWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [form, setForm] = useState<FormData>({
    docType: '',
    fullName: '', cnic: '', firNumber: '', policeStation: '',
    district: 'Pune', arrestDate: '', charges: '',
    grounds: ['First-time offender', 'Medical condition'],
    suretyName: '', suretyCnic: '', suretyRelationship: 'Brother',
    additionalFacts: 'The accused has been falsely implicated and was not present at the alleged scene of the crime.',
  });

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
    await new Promise(r => setTimeout(r, 2500));
    setGenerating(false);
    setGenerated(true);
  };

  const labelCls = "block text-sm font-medium text-dark-text mb-1.5";
  const inputCls = "w-full px-3 py-2.5 border border-border rounded-xl text-sm text-dark-text bg-white focus:outline-none focus:ring-2 focus:ring-blue-brand/30 focus:border-blue-brand transition-all";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-dark-text">New Document</h1>
        <p className="text-muted-text text-sm mt-1">AI-powered legal document drafting in minutes</p>
      </div>

      <Stepper
        steps={['Document Type', 'Basic Info', 'Details', 'Review & Generate']}
        currentStep={step}
      />

      {/* Step 0: Choose Type */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-semibold text-dark-text">What document do you need?</h2>
          <div className="grid grid-cols-2 gap-3">
            {DOC_TYPES.map(dt => (
              <button
                key={dt.id}
                onClick={() => updateForm('docType', dt.id)}
                className={`relative flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition-all duration-200
                  hover:-translate-y-0.5 hover:shadow-card-hover
                  ${form.docType === dt.id
                    ? 'border-navy bg-light-blue shadow-card'
                    : 'border-border bg-white hover:border-blue-brand/40'}`}
              >
                {form.docType === dt.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                <div className={`${form.docType === dt.id ? 'text-navy' : 'text-muted-text'}`}>
                  {dt.icon}
                </div>
                <div>
                  <div className="font-semibold text-dark-text text-sm">{dt.label}</div>
                  <div className="text-xs text-muted-text mt-0.5 leading-relaxed">{dt.desc}</div>
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
        <div className="bg-white rounded-2xl shadow-card border border-border/50 p-6 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-dark-text mb-2">Basic Information</h2>
          <p className="text-xs text-muted-text bg-light-blue rounded-lg px-3 py-2 mb-4">
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
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
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
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setStep(0)}>← Back</Button>
            <Button onClick={() => setStep(2)}>Next →</Button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-card border border-border/50 p-6 space-y-5">
          <h2 className="font-serif text-lg font-semibold text-dark-text">Bail Application Details</h2>

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
                  <span className="text-sm text-dark-text group-hover:text-navy transition-colors">{g}</span>
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
        <div className="bg-white rounded-2xl shadow-card border border-border/50 p-6">
          {generating ? (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-light-blue flex items-center justify-center">
                  <Scale size={32} className="text-navy animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-t-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-dark-text text-lg">JurisAI is drafting your document...</p>
                <p className="text-sm text-muted-text mt-1">Applying legal templates and Maharashtra court formatting</p>
              </div>
              <div className="w-64 h-1.5 bg-light-blue rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full animate-progress-fill" style={{ width: '60%', transition: 'width 2.5s ease-out' }} />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-center py-6 mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Check size={28} className="text-success" />
                </div>
                <h2 className="font-serif text-xl font-bold text-dark-text">Your {form.docType} has been drafted!</h2>
                <p className="text-sm text-muted-text mt-1">Review below and take action</p>
              </div>

              {/* Legal Document Preview */}
              <div className="bg-surface-gray rounded-xl p-6 font-mono text-xs leading-relaxed text-dark-text mb-6 max-h-96 overflow-y-auto border border-border">
                <div className="text-center mb-4">
                  <div className="text-base font-bold text-navy font-sans">सत्र न्यायालय, पुणे</div>
                  <div className="text-sm font-bold tracking-wider mt-1">IN THE COURT OF SESSIONS JUDGE PUNE</div>
                  <div className="mt-2 text-xs uppercase tracking-widest text-muted-text">
                    APPLICATION FOR BAIL BEFORE ARREST
                  </div>
                  <div className="mt-1 text-xs text-muted-text">
                    Case No.: FIR {form.firNumber || '112/2026'} | Police Station: {form.policeStation || 'Shivajinagar'}
                  </div>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs">{BAIL_APPLICATION_CONTENT}</pre>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={() => {}}>
                  📄 Download PDF
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
