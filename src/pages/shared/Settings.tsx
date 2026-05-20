import React, { useState } from 'react';
import { User, Bell, CreditCard, Lock, Save, Camera } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const PLAN_FEATURES = [
  { label: 'Documents/month', basic: '3', pro: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Lawyer Reviews', basic: 'Paid per doc', pro: '5 included', enterprise: '20 included' },
  { label: 'Case Law Search', basic: '10/month', pro: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Risk Analysis', basic: '1/month', pro: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Price', basic: 'Free', pro: '₹2,499/mo', enterprise: '₹9,999/mo' },
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

  const inputCls = "w-full px-3 py-2.5 border border-border rounded-xl text-sm text-dark-text bg-white focus:outline-none focus:ring-2 focus:ring-blue-brand/30 focus:border-blue-brand transition-all";
  const labelCls = "block text-sm font-medium text-dark-text mb-1.5";

  const handleSave = () => addToast('Profile saved successfully!', 'success');

  const tabs = [
    { id: 'profile', icon: <User size={16} />, label: 'Profile' },
    { id: 'security', icon: <Lock size={16} />, label: 'Security' },
    { id: 'notifications', icon: <Bell size={16} />, label: 'Notifications' },
    { id: 'subscription', icon: <CreditCard size={16} />, label: 'Subscription' },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="font-serif text-2xl font-bold text-dark-text">Settings</h1>

      <div className="flex gap-1 bg-surface-gray rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id ? 'bg-white text-navy shadow-sm' : 'text-muted-text hover:text-dark-text'}`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card className="p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-navy flex items-center justify-center text-white text-2xl font-bold font-serif">
                {user?.name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-gold rounded-full flex items-center justify-center shadow-md hover:bg-amber-500 transition-colors">
                <Camera size={12} className="text-white" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-dark-text">{user?.name}</p>
              <p className="text-sm text-muted-text capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Full Name</label><input className={inputCls} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div><label className={labelCls}>Phone</label><input className={inputCls} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div><label className={labelCls}>CNIC</label><input className={inputCls} value={form.cnic} onChange={e => setForm(p => ({ ...p, cnic: e.target.value }))} /></div>
            <div><label className={labelCls}>City</label><input className={inputCls} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
            {user?.role === 'lawyer' && (
              <div><label className={labelCls}>Bar Council Number</label><input className={inputCls} value={form.barCouncil} onChange={e => setForm(p => ({ ...p, barCouncil: e.target.value }))} /></div>
            )}
          </div>

          <Button variant="primary" className="mt-6" onClick={handleSave}>
            <Save size={16} /> Save Changes
          </Button>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="p-6 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-dark-text mb-2">Change Password</h2>
          {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
            <div key={label}><label className={labelCls}>{label}</label><input type="password" className={inputCls} placeholder="••••••••" /></div>
          ))}
          <Button variant="primary" onClick={() => addToast('Password updated!', 'success')}>Update Password</Button>
          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold text-dark-text mb-2">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-text mb-3">Protect your account with an additional verification step.</p>
            <Button variant="outline">Enable 2FA</Button>
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="p-6">
          <h2 className="font-serif text-lg font-semibold text-dark-text mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { label: 'Document Status Updates', desc: 'When your document is reviewed or finalized' },
              { label: 'New Messages', desc: 'When a lawyer sends you a message or comment' },
              { label: 'Case Law Alerts', desc: 'When new relevant case law is published' },
              { label: 'Subscription Reminders', desc: 'Before your plan renews or expires' },
            ].map((n, i) => (
              <div key={n.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-dark-text">{n.label}</p>
                  <p className="text-xs text-muted-text">{n.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                  <div className="w-10 h-5 bg-border rounded-full peer peer-checked:bg-navy transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow" />
                </label>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'subscription' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg font-semibold text-dark-text">Current Plan</h2>
              <span className="text-sm text-muted-text">You are on the <strong>Basic (Free)</strong> plan</span>
            </div>
            <span className="px-3 py-1 bg-light-blue text-navy text-xs font-semibold rounded-full">Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-text uppercase">Feature</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-text uppercase bg-surface-gray rounded-tl-xl">Basic</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase bg-navy">Professional</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-text uppercase bg-surface-gray rounded-tr-xl">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map(f => (
                  <tr key={f.label} className="border-b border-border">
                    <td className="px-4 py-3 text-dark-text">{f.label}</td>
                    <td className="px-4 py-3 text-center text-muted-text bg-surface-gray">{f.basic}</td>
                    <td className="px-4 py-3 text-center text-dark-text bg-light-blue font-medium">{f.pro}</td>
                    <td className="px-4 py-3 text-center text-muted-text bg-surface-gray">{f.enterprise}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  <td className="px-4 py-3 text-center bg-surface-gray text-xs text-muted-text italic">Current plan</td>
                  <td className="px-4 py-3 text-center bg-light-blue">
                    <Button variant="gold" size="sm" onClick={() => addToast('Upgrade coming soon!', 'info')}>Upgrade</Button>
                  </td>
                  <td className="px-4 py-3 text-center bg-surface-gray">
                    <Button variant="outline" size="sm" onClick={() => addToast('Contact sales for Enterprise', 'info')}>Contact Sales</Button>
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
