import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, FileText, Shield, Search, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: <FileText size={28} className="text-navy" />,
    title: 'AI Document Drafting',
    desc: 'Generate court-ready Bail Applications, Vakalatnamas, Affidavits, RTI Applications and more — tailored to Maharashtra courts in seconds.',
    bg: 'bg-light-blue',
  },
  {
    icon: <Shield size={28} className="text-amber-600" />,
    title: 'Contract Risk Analysis',
    desc: 'Upload any contract and receive an instant 0–100 risk score with flagged clauses, applicable law citations, and suggested rewording.',
    bg: 'bg-amber-50',
  },
  {
    icon: <Search size={28} className="text-emerald-600" />,
    title: 'Case Law Search',
    desc: 'Semantic search across Supreme Court, Bombay High Court, and Maharashtra Sessions Court judgments with relevance-ranked results.',
    bg: 'bg-emerald-50',
  },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setDemoError(null);
    const { error } = await signIn('demo@jurisai.in', 'Demo@1234');
    if (error) {
      setDemoError('Demo account unavailable. Please sign in or register.');
    }
    setDemoLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Nav ──────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Scale size={26} className="text-gold" />
          <span className="font-serif text-xl font-bold text-navy">
            Juris<span className="text-gold">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-navy hover:text-blue-brand transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            onClick={() => {}}
            className="px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-blue-brand transition-colors"
          >
            Register
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16">
        <span className="inline-flex items-center gap-1.5 bg-light-blue text-navy text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-navy/10">
          <Zap size={12} /> Maharashtra's first AI Legal Assistant
        </span>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-dark-text max-w-3xl leading-tight mb-5">
          AI-Powered Legal Assistance{' '}
          <span className="text-navy">for Indian Law</span>
        </h1>

        <p className="text-muted-text text-base md:text-lg max-w-xl mb-8 leading-relaxed">
          Draft legal documents, analyse contract risk, and search case law — all
          guided by AI trained on Maharashtra jurisdiction, Bombay High Court
          practice, and Indian statutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gold text-white text-sm font-semibold rounded-xl hover:bg-amber-500 transition-colors shadow-lg disabled:opacity-60"
          >
            {demoLoading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            Try Demo — No sign-up needed
          </button>

          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3 border-2 border-navy text-navy text-sm font-semibold rounded-xl hover:bg-light-blue transition-colors"
          >
            Sign In <ArrowRight size={15} />
          </Link>
        </div>

        {demoError && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{demoError}</p>
        )}

        <p className="mt-4 text-xs text-muted-text">
          Demo credentials: <span className="font-mono">demo@jurisai.in</span> / <span className="font-mono">Demo@1234</span>
        </p>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────────── */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-serif text-base font-bold text-dark-text mb-2">{f.title}</h3>
              <p className="text-sm text-muted-text leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Jurisdiction badge ─────────────────────────────────────── */}
      <footer className="mt-auto border-t border-border px-6 py-5 text-center text-xs text-muted-text">
        Covers Indian law, Maharashtra state laws, Bombay High Court rules, IPC/BNS, CrPC/BNSS, and
        Indian Contract Act 1872.{' '}
        <span className="text-amber-600 font-medium">
          AI-generated documents must be reviewed by a qualified advocate before use in legal proceedings.
        </span>
      </footer>
    </div>
  );
};

export default Landing;
