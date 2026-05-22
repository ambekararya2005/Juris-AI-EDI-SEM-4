import React, { useState } from 'react';
import { User, Bell, CreditCard, Lock, Save, Camera, Check, X, ShieldCheck } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface PlanFeatureRow {
  label: string;
  basic: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

const PLAN_FEATURES: PlanFeatureRow[] = [
  { label: 'Documents/month', basic: '3', pro: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Lawyer Reviews', basic: 'Paid per doc', pro: '5 included', enterprise: '20 included' },
  { label: 'Case Law Search', basic: '10/month', pro: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Risk Analysis', basic: '1/month', pro: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'AI Summarizer', basic: true, pro: true, enterprise: true },
  { label: 'API Access', basic: false, pro: false, enterprise: true },
  { label: 'Custom Templates', basic: false, pro: true, enterprise: true },
];

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'subscription'>('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cnic: user?.cnic || '',
    city: user?.city || '',
    barCouncil: user?.barCouncilNumber || '',
  });

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [otpInput, setOtpInput] = useState('847291');
  const [otpVerified, setOtpVerified] = useState(false);

  // Language selector state
  const [language, setLanguage] = useState('en');

  // Input styles
  const inputCls = "w-full px-3 py-2.5 border border-border dark:border-slate-700 rounded-xl text-sm text-dark-text dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-brand/30 focus:border-blue-brand transition-all";
  const labelCls = "block text-sm font-medium text-dark-text dark:text-slate-300 mb-1.5";

  // Real-time completeness calculation
  const totalFields = user?.role === 'lawyer' ? 6 : 5;
  const filledFields = [
    form.name,
    form.email,
    form.phone,
    form.cnic,
    form.city,
    ...(user?.role === 'lawyer' ? [form.barCouncil] : [])
  ].filter(Boolean).length;
  const completenessPercent = Math.round((filledFields / totalFields) * 100);

  const handleProfileSave = () => {
    addToast('Profile settings saved successfully!', 'success');
  };

  const handleSecuritySave = () => {
    addToast('Security credentials updated!', 'success');
  };

  const handleNotificationSave = () => {
    addToast('Notification preferences saved!', 'success');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    addToast('Language preference saved (UI translation coming soon)', 'info');
  };

  const handle2FAVerify = () => {
    if (otpInput === '847291') {
      setOtpVerified(true);
      addToast('Two-factor authentication verified and enabled!', 'success');
    } else {
      addToast('Invalid verification code, please try again.', 'error');
    }
  };

  const handle2FAToggle = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    if (!checked) {
      setOtpVerified(false);
      addToast('Two-factor authentication disabled.', 'info');
    }
  };

  const tabs = [
    { id: 'profile', icon: <User size={16} />, label: 'Profile' },
    { id: 'security', icon: <Lock size={16} />, label: 'Security' },
    { id: 'notifications', icon: <Bell size={16} />, label: 'Notifications' },
    { id: 'subscription', icon: <CreditCard size={16} />, label: 'Subscription' },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-dark-text dark:text-slate-100 font-serif">Settings</h1>
        
        {/* Language Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="lang-selector" className="text-xs font-semibold text-muted-text dark:text-slate-400">Language:</label>
          <select
            id="lang-selector"
            value={language}
            onChange={handleLanguageChange}
            className="px-3 py-1.5 border border-border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium text-dark-text dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="en">English</option>
            <option value="mr">मराठी</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>
      </div>

      <div className="flex gap-1 bg-surface-gray dark:bg-slate-800 rounded-xl p-1 w-fit overflow-x-auto max-w-full">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0
              ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-navy dark:text-slate-100 shadow-sm' : 'text-muted-text hover:text-dark-text dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card className="p-6 dark:bg-slate-800 border border-border dark:border-slate-700 space-y-6">
          {/* Completeness Meter */}
          <div className="bg-surface-gray dark:bg-slate-900/60 p-4 rounded-2xl border border-border dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-dark-text dark:text-slate-200 uppercase tracking-wider">
              <span>Profile Completeness</span>
              <span className="text-gold">{completenessPercent}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                style={{ width: `${completenessPercent}%` }} 
                className="h-full bg-gold transition-all duration-300"
              />
            </div>
          </div>

          {/* Avatar Details */}
          <div className="flex items-center gap-4 pb-6 border-b border-border dark:border-slate-700">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-navy dark:bg-blue-700 flex items-center justify-center text-white text-2xl font-bold font-serif shadow-inner">
                {user?.name.charAt(0)}
              </div>
              <button 
                onClick={() => addToast('Avatar update feature coming soon', 'info')}
                className="absolute bottom-0 right-0 w-7 h-7 bg-gold hover:bg-amber-500 rounded-full flex items-center justify-center shadow-md transition-colors"
                aria-label="Upload photo"
              >
                <Camera size={12} className="text-white" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-dark-text dark:text-slate-100">{user?.name}</p>
              <p className="text-sm text-muted-text dark:text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>

          {/* Profile Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input className={inputCls} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>CNIC</label>
              <input className={inputCls} value={form.cnic} onChange={e => setForm(p => ({ ...p, cnic: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input className={inputCls} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
            </div>
            {user?.role === 'lawyer' && (
              <div>
                <label className={labelCls}>Bar Council Number</label>
                <input className={inputCls} value={form.barCouncil} onChange={e => setForm(p => ({ ...p, barCouncil: e.target.value }))} />
              </div>
            )}
          </div>

          <Button variant="primary" className="mt-2 h-11 w-full md:w-auto" onClick={handleProfileSave}>
            <Save size={16} /> Save Changes
          </Button>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="p-6 space-y-6 dark:bg-slate-800 border border-border dark:border-slate-700">
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-semibold text-dark-text dark:text-slate-100">Change Password</h2>
            {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
              <div key={label}>
                <label className={labelCls}>{label}</label>
                <input type="password" className={inputCls} placeholder="••••••••" />
              </div>
            ))}
            <Button variant="primary" className="h-11 w-full md:w-auto" onClick={handleSecuritySave}>
              Update Password
            </Button>
          </div>

          {/* 2FA Section */}
          <div className="pt-6 border-t border-border dark:border-slate-700 space-y-4">
            <div>
              <h3 className="font-semibold text-dark-text dark:text-slate-100">Two-Factor Authentication (2FA)</h3>
              <p className="text-xs text-muted-text dark:text-slate-400 mt-1">Protect your account details with OTP code verification on login.</p>
            </div>

            <div className="flex items-center justify-between bg-surface-gray dark:bg-slate-900/40 p-4 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-dark-text dark:text-slate-200">Enable 2FA Verification</p>
                <p className="text-xs text-muted-text dark:text-slate-400 mt-0.5">Toggle to configure mock OTP code verification</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={twoFactorEnabled} 
                  onChange={e => handle2FAToggle(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-10 h-5 bg-border dark:bg-slate-700 rounded-full peer peer-checked:bg-gold transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow" />
              </label>
            </div>

            {/* 2FA OTP Setup screen */}
            {twoFactorEnabled && (
              <div className="bg-light-blue dark:bg-slate-900/60 p-4 rounded-xl border border-blue-100 dark:border-slate-800 space-y-3 animate-fade-in">
                {!otpVerified ? (
                  <>
                    <p className="text-xs text-navy dark:text-slate-300 font-semibold uppercase tracking-wider">Verification Required</p>
                    <p className="text-xs text-muted-text dark:text-slate-400">Please enter the security verification code sent to your registered contact.</p>
                    <div className="flex gap-2 max-w-xs">
                      <input
                        type="text"
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="flex-1 px-3 py-2 border border-border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-center font-mono font-bold tracking-widest text-dark-text dark:text-slate-200 focus:outline-none"
                      />
                      <Button variant="gold" size="sm" onClick={handle2FAVerify} className="h-10">
                        Verify
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-text dark:text-slate-500 italic">Mock Code: Use <strong className="font-sans font-bold">847291</strong> to verify.</p>
                  </>
                ) : (
                  <div className="flex items-center gap-3 py-1">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 text-success dark:text-green-300 flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark-text dark:text-slate-200">2FA Verified & Active</p>
                      <p className="text-xs text-muted-text dark:text-slate-400">Account login is protected with two-factor authorization.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="p-6 dark:bg-slate-800 border border-border dark:border-slate-700">
          <h2 className="font-serif text-lg font-semibold text-dark-text dark:text-slate-100 mb-4 font-serif">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { label: 'Document Status Updates', desc: 'When your document is reviewed or finalized' },
              { label: 'New Messages', desc: 'When a lawyer sends you a message or comment' },
              { label: 'Case Law Alerts', desc: 'When new relevant case law is published' },
              { label: 'Subscription Reminders', desc: 'Before your plan renews or expires' },
            ].map((n, i) => (
              <div key={n.label} className="flex items-center justify-between py-3 border-b border-border dark:border-slate-700 last:border-0">
                <div className="pr-4">
                  <p className="text-sm font-semibold text-dark-text dark:text-slate-200">{n.label}</p>
                  <p className="text-xs text-muted-text dark:text-slate-400 mt-0.5">{n.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                  <div className="w-10 h-5 bg-border dark:bg-slate-700 rounded-full peer peer-checked:bg-navy dark:peer-checked:bg-blue-600 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow" />
                </label>
              </div>
            ))}
          </div>
          <Button variant="primary" className="mt-6 h-11 w-full md:w-auto" onClick={handleNotificationSave}>
            <Save size={16} /> Save Preferences
          </Button>
        </Card>
      )}

      {activeTab === 'subscription' && (
        <Card className="p-6 dark:bg-slate-800 border border-border dark:border-slate-700 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-dark-text dark:text-slate-100 font-serif">Current Plan</h2>
              <span className="text-sm text-muted-text dark:text-slate-400">You are on the <strong>Basic (Free)</strong> plan</span>
            </div>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-950/40 text-success dark:text-green-300 text-xs font-semibold rounded-full border border-green-200 dark:border-green-800">
              Active
            </span>
          </div>

          <div className="overflow-x-auto border border-border dark:border-slate-700 rounded-2xl">
            <table className="w-full text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-surface-gray dark:bg-slate-900 border-b border-border dark:border-slate-700">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wider">Feature</th>
                  
                  {/* Basic column header: current, highlight with gold border */}
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-navy dark:text-gold uppercase tracking-wider relative border-2 border-gold rounded-t-xl bg-gold/5">
                    Basic
                    <span className="block text-[10px] text-muted-text dark:text-slate-400 font-normal normal-case mt-0.5">Free</span>
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gold text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase scale-90">Current</span>
                  </th>
                  
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-dark-text dark:text-slate-200 uppercase tracking-wider">
                    Professional
                    <span className="block text-[10px] text-muted-text dark:text-slate-400 font-normal normal-case mt-0.5">₹999/mo</span>
                  </th>
                  
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-dark-text dark:text-slate-200 uppercase tracking-wider">
                    Enterprise
                    <span className="block text-[10px] text-muted-text dark:text-slate-400 font-normal normal-case mt-0.5">₹2999/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map((f, index) => (
                  <tr key={index} className="border-b border-border dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="px-4 py-3.5 font-medium text-dark-text dark:text-slate-300">{f.label}</td>
                    
                    {/* Basic column cell: current, highlighted gold background highlight */}
                    <td className="px-4 py-3.5 text-center bg-gold/5 border-x-2 border-gold text-muted-text dark:text-slate-400">
                      {typeof f.basic === 'boolean' ? (
                        f.basic ? <Check size={16} className="mx-auto text-success dark:text-green-400" /> : <X size={16} className="mx-auto text-risk dark:text-red-400" />
                      ) : f.basic}
                    </td>

                    <td className="px-4 py-3.5 text-center text-dark-text dark:text-slate-200">
                      {typeof f.pro === 'boolean' ? (
                        f.pro ? <Check size={16} className="mx-auto text-success dark:text-green-400" /> : <X size={16} className="mx-auto text-risk dark:text-red-400" />
                      ) : f.pro}
                    </td>

                    <td className="px-4 py-3.5 text-center text-muted-text dark:text-slate-400">
                      {typeof f.enterprise === 'boolean' ? (
                        f.enterprise ? <Check size={16} className="mx-auto text-success dark:text-green-400" /> : <X size={16} className="mx-auto text-risk dark:text-red-400" />
                      ) : f.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-gray/30 dark:bg-slate-900/10">
                  <td className="px-4 py-3.5" />
                  
                  {/* Basic footer cell: highlighted gold border */}
                  <td className="px-4 py-3.5 text-center bg-gold/5 border-x-2 border-b-2 border-gold rounded-b-xl text-xs text-muted-text dark:text-slate-400 italic">
                    Active Plan
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <Button variant="gold" size="sm" onClick={() => addToast('Payment gateway coming soon!', 'info')} className="h-9">
                      Upgrade
                    </Button>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <Button variant="outline" size="sm" onClick={() => addToast('Contacting sales...', 'info')} className="h-9">
                      Contact Sales
                    </Button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Settings;

