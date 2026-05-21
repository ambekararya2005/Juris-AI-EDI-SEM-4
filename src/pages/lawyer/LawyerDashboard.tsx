import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, BookOpen, Star, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getPriorityBadge } from '../../components/ui/Badge';
import {
  mockReviewQueue,
  mockActivityData,
  mockWeeklyReviews,
  mockRecentSearches,
  mockActiveCases,
  mockClients,
  mockLawyerProfile,
} from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { OnboardingModal } from '../../components/OnboardingModal';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; borderColor: string }> = ({
  label, value, icon, borderColor,
}) => (
  <Card className={`p-4 border-l-4 ${borderColor} dark:bg-slate-800`}>
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 rounded-xl bg-light-blue dark:bg-slate-700">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-dark-text dark:text-slate-100 font-serif">{value}</div>
    <div className="text-xs text-muted-text dark:text-slate-400 mt-0.5">{label}</div>
  </Card>
);

// ─── Priority icon map ────────────────────────────────────────────────────────
const priorityIcon: Record<string, string> = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢' };

// ─── Urgency dot helper ───────────────────────────────────────────────────────
function getUrgencyDot(nextHearing: string): string {
  const today = new Date();
  const hearing = new Date(nextHearing);
  const diffDays = Math.ceil((hearing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return 'bg-red-500';
  if (diffDays <= 14) return 'bg-amber-400';
  return 'bg-green-500';
}

// ─── Workload heatmap pseudo-random seed ─────────────────────────────────────
function heatLevel(col: number, row: number): 0 | 1 | 2 | 3 {
  const seed = ((col * 7 + row * 13) * 31 + 17) % 10;
  if (seed === 0) return 0;
  if (seed <= 3) return 1;
  if (seed <= 6) return 2;
  return 3;
}
const heatColors: Record<number, string> = {
  0: 'bg-gray-100 dark:bg-slate-700',
  1: 'bg-blue-100 dark:bg-blue-900/40',
  2: 'bg-blue-300 dark:bg-blue-700',
  3: 'bg-navy dark:bg-blue-500',
};

// ─── Main Component ───────────────────────────────────────────────────────────
const LawyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-6">
      <OnboardingModal />
      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Pending Reviews" value={5} icon={<Clock size={18} className="text-risk" />} borderColor="border-risk" />
        <StatCard label="Completed This Month" value={12} icon={<CheckCircle size={18} className="text-success" />} borderColor="border-success" />
        <StatCard label="Cases Researched" value={34} icon={<BookOpen size={18} className="text-blue-brand" />} borderColor="border-blue-brand" />
        <StatCard label="Avg. Review Time" value="1.4h" icon={<TrendingUp size={18} className="text-amber-500" />} borderColor="border-amber-400" />
        <StatCard label="Client Rating" value="4.8 ★" icon={<Star size={18} className="text-gold" />} borderColor="border-gold" />
      </div>

      {/* ── 3-column layout ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Review Queue */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden dark:bg-slate-800">
            <div className="p-5 border-b border-border dark:border-slate-700 flex items-center justify-between">
              <h2 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100">Review Queue</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/lawyer/queue')}>View All →</Button>
            </div>
            <div className="divide-y divide-border/50 dark:divide-slate-700">
              {mockReviewQueue.map(item => (
                <div key={item.id} className="p-4 hover:bg-surface-gray/50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3">
                  <span className="text-lg flex-shrink-0">{priorityIcon[item.priority]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-text dark:text-slate-100 truncate">{item.documentTitle}</p>
                    <p className="text-xs text-muted-text dark:text-slate-400">{item.clientName} · {item.receivedAt}</p>
                  </div>
                  {getPriorityBadge(item.priority)}
                  <Button
                    variant="outline" size="sm"
                    onClick={() => navigate(`/lawyer/review/${item.documentId}`)}
                    className="flex-shrink-0 text-xs"
                  >
                    Review →
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Case Searches */}
        <Card className="p-5 dark:bg-slate-800">
          <h2 className="font-serif text-sm font-semibold text-dark-text dark:text-slate-100 mb-4">Recent Case Searches</h2>
          <div className="space-y-3">
            {mockRecentSearches.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs text-blue-brand mt-0.5">🔍</span>
                <div>
                  <p className="text-xs font-medium text-dark-text dark:text-slate-200 leading-snug">{s.query}</p>
                  <p className="text-xs text-muted-text dark:text-slate-400">{s.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-3 text-blue-brand w-full" onClick={() => navigate('/lawyer/search')}>
            Open Case Search →
          </Button>
        </Card>

        {/* Performance */}
        <Card className="p-5 dark:bg-slate-800">
          <h2 className="font-serif text-sm font-semibold text-dark-text dark:text-slate-100 mb-4">Performance</h2>

          {/* Circular gauge */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" stroke="#EBF1FA" strokeWidth="10" fill="none" className="dark:stroke-slate-700" />
                <circle cx="50" cy="50" r="40" stroke="#1B3A6B" strokeWidth="10" fill="none"
                  strokeDasharray={`${(12 / 15) * 251.3} 251.3`} strokeLinecap="round" className="dark:stroke-blue-400" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-bold text-lg text-dark-text dark:text-slate-100 leading-none">12</span>
                <span className="text-xs text-muted-text dark:text-slate-400">/15</span>
              </div>
            </div>
            <p className="text-xs text-muted-text dark:text-slate-400 mt-1">Monthly review target</p>
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-0.5 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} fill={i < 4.8 ? '#E8A020' : 'none'} className="text-gold" />
            ))}
          </div>
          <p className="text-center text-sm font-semibold text-dark-text dark:text-slate-100">4.8 / 5.0</p>

          {/* Weekly Bar */}
          <div className="mt-4 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWeeklyReviews}>
                <Bar dataKey="reviews" fill="#2E5DA6" radius={[3, 3, 0, 0]} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6B7A99' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── New Row: Deadline Tracker + Workload Heatmap ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Deadline Tracker Widget */}
        <Card className="p-5 dark:bg-slate-800">
          <h2 className="font-serif text-sm font-semibold text-dark-text dark:text-slate-100 mb-4">Upcoming Deadlines</h2>
          <div className="space-y-3">
            {mockActiveCases.slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getUrgencyDot(c.nextHearing)}`}
                  title={c.nextHearing}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-dark-text dark:text-slate-200 truncate">{c.caseNumber}</p>
                  <p className="text-xs text-muted-text dark:text-slate-400">Next Hearing</p>
                </div>
                <span className="text-xs text-dark-text dark:text-slate-300 font-medium whitespace-nowrap">
                  {new Date(c.nextHearing).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Earnings Summary Card */}
        <Card className="p-5 dark:bg-slate-800">
          <h2 className="font-serif text-sm font-semibold text-dark-text dark:text-slate-100 mb-1">Monthly Earnings</h2>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-3xl font-bold text-dark-text dark:text-slate-100 font-serif">₹58,000</span>
          </div>
          <div className="flex items-center gap-1 mb-4">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">+17.3% from last month</span>
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockLawyerProfile.earnings} barSize={18}>
                <Bar dataKey="amount" fill="#2E5DA6" radius={[4, 4, 0, 0]} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7A99' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Workload Heatmap */}
        <Card className="p-5 dark:bg-slate-800">
          <h2 className="font-serif text-sm font-semibold text-dark-text dark:text-slate-100 mb-3">
            Workload Heatmap — This Month
          </h2>
          <div className="flex flex-col gap-1.5">
            {/* Column headers */}
            <div className="flex items-center gap-1.5">
              <span className="w-10 text-xs text-muted-text dark:text-slate-500" />
              {days.map((d, ci) => (
                <span key={ci} className="w-6 text-center text-xs text-muted-text dark:text-slate-400 font-medium">{d}</span>
              ))}
            </div>
            {/* Rows */}
            {Array.from({ length: 4 }).map((_, ri) => (
              <div key={ri} className="flex items-center gap-1.5">
                <span className="w-10 text-xs text-muted-text dark:text-slate-400 whitespace-nowrap">Wk {ri + 1}</span>
                {days.map((_, ci) => (
                  <span
                    key={ci}
                    className={`w-6 h-6 rounded ${heatColors[heatLevel(ci, ri)]} transition-opacity hover:opacity-80`}
                    title={`Week ${ri + 1}, ${days[ci]}: ${['None', 'Low', 'Medium', 'High'][heatLevel(ci, ri)]} activity`}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-text dark:text-slate-400">Less</span>
            {[0, 1, 2, 3].map(l => (
              <span key={l} className={`w-4 h-4 rounded-sm ${heatColors[l]}`} />
            ))}
            <span className="text-xs text-muted-text dark:text-slate-400">More</span>
          </div>
        </Card>
      </div>

      {/* ── Client List Panel ─────────────────────────────────────────────── */}
      <Card className="overflow-hidden dark:bg-slate-800">
        <div className="p-5 border-b border-border dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100">Client List</h2>
          <span className="text-xs text-muted-text dark:text-slate-400">{mockClients.length} clients</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-slate-700 bg-surface-gray/50 dark:bg-slate-700/30">
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wide">Client</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wide">Cases</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wide">Joined</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 dark:divide-slate-700">
              {mockClients.slice(0, 5).map(client => (
                <tr key={client.id} className="hover:bg-surface-gray/30 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-navy dark:bg-blue-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {client.initials}
                      </span>
                      <span className="font-medium text-dark-text dark:text-slate-200 text-sm">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {client.caseCount} cases
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-text dark:text-slate-400">
                    {new Date(client.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addToast('Client profile coming soon', 'info')}
                      className="text-xs"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Line Chart ────────────────────────────────────────────────────── */}
      <Card className="p-5 dark:bg-slate-800">
        <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100 mb-4">Review Activity — Last 6 Months</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBF1FA" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7A99' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7A99' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #C5D5EE', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="reviews" name="Reviews" stroke="#1B3A6B" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="cases" name="Case Searches" stroke="#E8A020" strokeWidth={2.5} dot={false} strokeDasharray="6 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default LawyerDashboard;
