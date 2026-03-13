import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, FilePlus, Shield, Clock, CheckCircle, AlertTriangle, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../components/ui/Card';
import Badge, { getStatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { mockDocuments, mockActivityData, mockNotifications } from '../../data/mockData';

const StatCard: React.FC<{
  label: string; value: number | string; icon: React.ReactNode;
  borderColor: string; trend?: string; loading: boolean;
}> = ({ label, value, icon, borderColor, trend, loading }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (loading || typeof value !== 'number') return;
    let start = 0;
    const step = value / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 25);
    return () => clearInterval(timer);
  }, [value, loading]);

  return (
    <Card className={`p-5 border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl bg-light-blue`}>{icon}</div>
        {trend && <span className="text-xs text-success font-medium flex items-center gap-1"><TrendingUp size={12} />{trend}</span>}
      </div>
      <div className="text-3xl font-bold text-dark-text font-serif mb-0.5 stat-number">
        {typeof value === 'number' ? display : value}
      </div>
      <div className="text-sm text-muted-text">{label}</div>
    </Card>
  );
};

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const recentDocs = mockDocuments.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Documents Created" value={7} icon={<FileText size={18} className="text-blue-brand" />} borderColor="border-blue-brand" trend="+2 this month" loading={loading} />
        <StatCard label="Under Review" value={2} icon={<Clock size={18} className="text-amber-500" />} borderColor="border-amber-400" loading={loading} />
        <StatCard label="Finalized" value={4} icon={<CheckCircle size={18} className="text-success" />} borderColor="border-success" loading={loading} />
        <StatCard label="Pending Action" value={1} icon={<AlertTriangle size={18} className="text-risk" />} borderColor="border-risk" loading={loading} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents Table */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-dark-text">Recent Documents</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/client/documents')}>
                View all
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-gray text-xs text-muted-text uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Document</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-left">Lawyer</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-surface-gray/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-dark-text max-w-[160px] truncate">
                        {doc.title}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-text">{doc.type}</td>
                      <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                      <td className="px-4 py-3 text-xs text-muted-text">{doc.createdAt}</td>
                      <td className="px-4 py-3 text-xs text-muted-text">
                        {doc.lawyerName || <span className="italic text-muted-text/60">Not Assigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => navigate(`/client/documents/${doc.id}`)}
                          className="text-blue-brand hover:bg-light-blue"
                        >
                          {doc.status === 'Draft' ? 'Continue' : <><Eye size={14} /> View</>}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Panels */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="p-5">
            <h3 className="font-serif text-base font-semibold text-dark-text mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: <FilePlus size={20} className="text-navy" />, label: 'Draft New Document', path: '/client/documents/new', bg: 'bg-light-blue' },
                { icon: <FileText size={20} className="text-blue-brand" />, label: 'Summarize a Doc', path: '/client/summarize', bg: 'bg-light-blue' },
                { icon: <Shield size={20} className="text-risk" />, label: 'Check Contract Risk', path: '/client/risk', bg: 'bg-red-50' },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl ${action.bg}
                    hover:opacity-80 transition-opacity text-left group`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-dark-text">{action.label}</span>
                  <ArrowRight size={14} className="ml-auto text-muted-text group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-5">
            <h3 className="font-serif text-base font-semibold text-dark-text mb-4">Notifications</h3>
            <div className="space-y-3">
              {mockNotifications.slice(0, 4).map(notif => (
                <div key={notif.id} className="flex gap-3 items-start">
                  <span className="text-base flex-shrink-0 mt-0.5">{notif.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-dark-text leading-snug">{notif.text}</p>
                    <p className="text-xs text-muted-text mt-0.5">{notif.timestamp}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-brand flex-shrink-0 mt-1" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Activity Chart */}
      <Card className="p-5">
        <h3 className="font-serif text-base font-semibold text-dark-text mb-4">Document Activity — Last 6 Months</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockActivityData}>
              <defs>
                <linearGradient id="docGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E5DA6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2E5DA6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBF1FA" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7A99' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7A99' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #C5D5EE', fontSize: 12 }} />
              <Area type="monotone" dataKey="documents" name="Documents" stroke="#1B3A6B" strokeWidth={2.5} fill="url(#docGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default ClientDashboard;
