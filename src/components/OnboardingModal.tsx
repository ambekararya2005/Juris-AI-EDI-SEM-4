import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  Check, ArrowRight, User as UserIcon, Sparkles, ShieldCheck, 
  FileText, Search, Edit3, Briefcase, MapPin, Mail, Award
} from 'lucide-react';
import Button from './ui/Button';

export const OnboardingModal: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useApp();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);
  
  // Prefilled profile form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    city: '',
    barCouncilNumber: '',
  });

  useEffect(() => {
    const onboarded = localStorage.getItem('jurisai_onboarded');
    if (!onboarded && user) {
      setShow(true);
      setForm({
        name: user.name || '',
        email: user.email || '',
        city: user.city || 'Pune',
        barCouncilNumber: user.barCouncilNumber || 'MH/4521/2017',
      });
    }
  }, [user]);

  if (!show || !user) return null;

  const isLawyer = user.role === 'lawyer';

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('jurisai_onboarded', 'true');
    setShow(false);
    addToast('Onboarding skipped. You can update your profile in Settings.', 'info');
  };

  const handleComplete = () => {
    localStorage.setItem('jurisai_onboarded', 'true');
    setShow(false);
    addToast('Welcome to Juris AI! Your profile details have been saved.', 'success');
  };

  // Highlights for Step 1
  const clientHighlights = [
    {
      icon: <Sparkles className="text-gold" size={24} />,
      title: "AI Drafting Wizard",
      desc: "Instantly draft legal petitions, agreements, and applications through a guided wizard."
    },
    {
      icon: <ShieldCheck className="text-blue-brand" size={24} />,
      title: "Contract Risk Analyzer",
      desc: "Upload contracts and agreements to spot risks, review explanations, and apply suggested fixes."
    },
    {
      icon: <FileText className="text-green-500" size={24} />,
      title: "Integrated Legal Network",
      desc: "Share your drafts directly with your assigned lawyer, receive reviews, and collaborate in real-time."
    }
  ];

  const lawyerHighlights = [
    {
      icon: <Briefcase className="text-gold" size={24} />,
      title: "Smart Review Queue",
      desc: "Streamline client document reviews with intelligent prioritization and urgency alerts."
    },
    {
      icon: <Search className="text-blue-brand" size={24} />,
      title: "Robust Precedent Search",
      desc: "Find and extract relevant case laws and judicial citations using natural language AI query search."
    },
    {
      icon: <Edit3 className="text-green-500" size={24} />,
      title: "Interactive Document Editor",
      desc: "View client information, check version histories, and suggest edits side-by-side with AI assistance."
    }
  ];

  const highlights = isLawyer ? lawyerHighlights : clientHighlights;

  // Checklist for Step 3
  const clientChecklist = [
    { label: "Complete your user profile", done: true },
    { label: "Draft a mock bail application using the wizard", done: false },
    { label: "Scan a business agreement in Contract Risk Analyser", done: false },
    { label: "Connect with Adv. Rahul Vijay Joshi via messages", done: false }
  ];

  const lawyerChecklist = [
    { label: "Verify your Bar Council credentials", done: true },
    { label: "Conduct your first case law search query", done: false },
    { label: "Review a pending petition in the review queue", done: false },
    { label: "Set up monthly workload heatmap tracker", done: false }
  ];

  const checklist = isLawyer ? lawyerChecklist : clientChecklist;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-navy/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={handleSkip}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-border dark:border-slate-700 overflow-hidden transform transition-all duration-300 flex flex-col max-h-[90vh]">
        {/* Top Accent line */}
        <div className="h-2 bg-gradient-to-r from-navy via-gold to-blue-brand w-full flex-shrink-0" />
        
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-navy dark:text-gold tracking-tight text-xl">JURIS</span>
            <span className="bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">AI</span>
          </div>
          {step < 3 && (
            <button 
              onClick={handleSkip} 
              className="text-xs font-semibold text-muted-text hover:text-navy dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Skip Tour
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* STEP 1: Welcome & Highlights */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold text-dark-text dark:text-slate-100 leading-tight">
                  Welcome to Juris AI, {isLawyer ? 'Advocate' : 'Client'}!
                </h2>
                <p className="text-sm text-muted-text dark:text-slate-400">
                  Let's take a quick 1-minute tour of your digital legal workspace.
                </p>
              </div>

              <div className="space-y-4">
                {highlights.map((h, i) => (
                  <div 
                    key={i} 
                    className="flex gap-4 p-3 rounded-2xl bg-surface-gray dark:bg-slate-900/40 border border-border dark:border-slate-700/60"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-border dark:border-slate-700 flex items-center justify-center shadow-sm flex-shrink-0">
                      {h.icon}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-dark-text dark:text-slate-200">{h.title}</h4>
                      <p className="text-xs text-muted-text dark:text-slate-400 leading-relaxed">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Profile prefill form */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold text-dark-text dark:text-slate-100 leading-tight">
                  Complete Your Profile
                </h2>
                <p className="text-sm text-muted-text dark:text-slate-400">
                  Verify or fill in your details to customize your experience.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 text-muted-text dark:text-slate-500" size={16} />
                    <input 
                      type="text" 
                      value={form.name} 
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-brand/20 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-muted-text dark:text-slate-500" size={16} />
                    <input 
                      type="email" 
                      value={form.email} 
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-brand/20 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-muted-text dark:text-slate-500" size={16} />
                      <input 
                        type="text" 
                        value={form.city} 
                        onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-brand/20 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {isLawyer && (
                    <div>
                      <label className="block text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Bar Council Number
                      </label>
                      <div className="relative">
                        <Award className="absolute left-3 top-3 text-muted-text dark:text-slate-500" size={16} />
                        <input 
                          type="text" 
                          value={form.barCouncilNumber} 
                          onChange={e => setForm(p => ({ ...p, barCouncilNumber: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-brand/20 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Checklist */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold text-dark-text dark:text-slate-100 leading-tight">
                  You're all set!
                </h2>
                <p className="text-sm text-muted-text dark:text-slate-400">
                  Here is your onboarding checklist to get started. Let's make things happen.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {checklist.map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-gray dark:bg-slate-900/30 border border-border dark:border-slate-700/60"
                  >
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2
                        ${item.done 
                          ? 'bg-success border-success text-white' 
                          : 'border-slate-300 dark:border-slate-600 bg-transparent text-transparent'
                        }`}
                    >
                      <Check size={12} className="stroke-[3px]" />
                    </div>
                    <span 
                      className={`text-sm font-medium
                        ${item.done 
                          ? 'text-muted-text dark:text-slate-500 line-through' 
                          : 'text-dark-text dark:text-slate-200'
                        }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-6 py-5 border-t border-border dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-gray/50 dark:bg-slate-900/20 flex-shrink-0">
          {/* Step dots */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(i => (
              <span 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300
                  ${step === i ? 'w-6 bg-gold' : 'w-2 bg-slate-300 dark:bg-slate-600'}`}
              />
            ))}
          </div>

          {/* Button actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {step > 1 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStep(prev => prev - 1)}
                className="flex-1 sm:flex-initial h-11 px-4"
              >
                Back
              </Button>
            )}
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleNext}
              className="flex-grow sm:flex-grow-0 h-11 px-5 flex items-center justify-center gap-1.5 font-bold"
            >
              {step === 3 ? 'Get Started' : 'Next'} <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
