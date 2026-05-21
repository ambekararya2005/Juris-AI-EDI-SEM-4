import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Scale, AlertCircle, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'client' | 'lawyer'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (isSignUp) {
      const { error: signUpError } = await signUp(email, password, role, fullName);
      if (signUpError) {
        setError(signUpError);
        setLoading(false);
      } else {
        setSuccessMsg('Account created successfully! If email confirmation is enabled, please verify your email; otherwise, you can sign in.');
        setIsSignUp(false);
        setPassword('');
        setLoading(false);
      }
    } else {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Decorative Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-navy flex-col justify-center px-12 overflow-hidden">
        {/* Floating elements */}
        {[
          { icon: '⚖️', size: 80, top: '10%', left: '15%', delay: '0s' },
          { icon: '📜', size: 60, top: '65%', left: '70%', delay: '2s' },
          { icon: '🔨', size: 70, top: '80%', left: '10%', delay: '1s' },
          { icon: '🛡️', size: 55, top: '30%', left: '75%', delay: '3s' },
          { icon: '📋', size: 65, top: '50%', left: '40%', delay: '1.5s' },
        ].map((item, i) => (
          <div
            key={i}
            className="absolute float-icon select-none"
            style={{
              fontSize: item.size,
              top: item.top,
              left: item.left,
              animation: `float ${6 + i}s ease-in-out infinite`,
              animationDelay: item.delay,
            }}
          >
            {item.icon}
          </div>
        ))}

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Scale size={36} className="text-gold" />
            <span className="font-serif text-4xl font-bold text-white">
              Juris<span className="text-gold">AI</span>
            </span>
          </div>
          <h2 className="text-white text-2xl font-serif font-semibold mb-3 leading-tight">
            Legal intelligence,<br />reimagined.
          </h2>
          <p className="text-white/60 text-sm mb-10 leading-relaxed">
            Maharashtra's first AI-powered legal platform for document drafting,
            case research, and contract risk analysis.
          </p>

          <div className="space-y-3">
            {[
              { emoji: '⚖️', label: 'AI Document Drafting' },
              { emoji: '🔍', label: 'Case Law Research' },
              { emoji: '🛡️', label: 'Contract Risk Analysis' },
            ].map(feat => (
              <div key={feat.label}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <span className="text-xl">{feat.emoji}</span>
                <span className="text-white font-medium text-sm">{feat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-grow flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Scale size={28} className="text-navy" />
            <span className="font-serif text-2xl font-bold text-navy">
              Juris<span className="text-gold">AI</span>
            </span>
          </div>

          <h1 className="font-serif text-3xl font-bold text-dark-text mb-1">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-muted-text text-sm mb-8">
            {isSignUp ? 'Get started with your digital legal workspace' : 'Sign in to your JurisAI account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-dark-text mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm text-dark-text
                      placeholder:text-muted-text/60 focus:outline-none focus:ring-2 focus:ring-blue-brand/30
                      focus:border-blue-brand transition-all bg-surface-gray"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-text mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm text-dark-text
                    placeholder:text-muted-text/60 focus:outline-none focus:ring-2 focus:ring-blue-brand/30
                    focus:border-blue-brand transition-all bg-surface-gray"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm text-dark-text
                    placeholder:text-muted-text/60 focus:outline-none focus:ring-2 focus:ring-blue-brand/30
                    focus:border-blue-brand transition-all bg-surface-gray"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-dark-text"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-dark-text mb-3">Join as</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all duration-200
                      ${role === 'client' 
                        ? 'border-navy bg-light-blue dark:bg-blue-950/20' 
                        : 'border-border hover:border-navy/50 bg-transparent'
                      }`}
                  >
                    <span className="text-2xl">👤</span>
                    <span className={`text-sm font-semibold ${role === 'client' ? 'text-navy font-bold' : 'text-dark-text'}`}>
                      Client
                    </span>
                    <span className="text-[10px] text-muted-text text-center">Seek legal drafting & review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('lawyer')}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all duration-200
                      ${role === 'lawyer' 
                        ? 'border-gold bg-amber-50 dark:bg-amber-950/20' 
                        : 'border-border hover:border-gold/50 bg-transparent'
                      }`}
                  >
                    <span className="text-2xl">⚖️</span>
                    <span className={`text-sm font-semibold ${role === 'lawyer' ? 'text-gold font-bold' : 'text-dark-text'}`}>
                      Advocate / Lawyer
                    </span>
                    <span className="text-[10px] text-muted-text text-center">Review documents & pre-screen cases</span>
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-sans">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-sans">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                {successMsg}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle link */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-sm text-blue-brand hover:underline font-semibold"
            >
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
