import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Scale } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 800));
    const success = login(email, password);
    if (success) {
      const user = email.includes('advocate') || email.includes('legal') ? 'lawyer' : 'client';
      navigate(user === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard');
    } else {
      setError('Invalid email or password. Try demo buttons below.');
    }
    setLoading(false);
  };

  const handleDemo = (role: 'client' | 'lawyer') => {
    loginAsDemo(role);
    navigate(role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Decorative Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-navy flex-col justify-center px-12 overflow-hidden">
        {/* Floating icons */}
        {[
          { icon: '⚖️', size: 80, top: '10%', left: '15%', delay: '0s' },
          { icon: '📜', size: 60, top: '65%', left: '70%', delay: '2s' },
          { icon: '🔨', size: 70, top: '80%', left: '10%', delay: '1s' },
          { icon: '🛡️', size: 55, top: '30%', left: '75%', delay: '3s' },
          { icon: '📋', size: 65, top: '50%', left: '40%', delay: '1.5s' },
        ].map((item, i) => (
          <div
            key={i}
            className="absolute float-icon"
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
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Scale size={28} className="text-navy" />
            <span className="font-serif text-2xl font-bold text-navy">
              Juris<span className="text-gold">AI</span>
            </span>
          </div>

          <h1 className="font-serif text-3xl font-bold text-dark-text mb-1">Welcome back</h1>
          <p className="text-muted-text text-sm mb-8">Sign in to your JurisAI account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
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

            {error && (
              <p className="text-sm text-risk bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-text">
            Don't have an account?{' '}
            <a href="#!" className="text-blue-brand hover:underline font-medium">Sign up</a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-text">or continue as demo</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Demo Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDemo('client')}
              className="flex flex-col items-center gap-2 p-4 border-2 border-border rounded-xl
                hover:border-navy hover:bg-light-blue transition-all duration-200 group"
            >
              <span className="text-2xl">👤</span>
              <span className="text-sm font-medium text-dark-text group-hover:text-navy">
                Demo as Client
              </span>
              <span className="text-xs text-muted-text">Priya Sharma</span>
            </button>
            <button
              onClick={() => handleDemo('lawyer')}
              className="flex flex-col items-center gap-2 p-4 border-2 border-border rounded-xl
                hover:border-gold hover:bg-amber-50 transition-all duration-200 group"
            >
              <span className="text-2xl">⚖️</span>
              <span className="text-sm font-medium text-dark-text group-hover:text-gold">
                Demo as Lawyer
              </span>
              <span className="text-xs text-muted-text">Adv. Rahul Patil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
