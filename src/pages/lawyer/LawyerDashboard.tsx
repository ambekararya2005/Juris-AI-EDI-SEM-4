import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Clock, CheckCircle, TrendingUp,
  AlertTriangle, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  IS_MOCK_MODE,
  getMockLawyerQueue,
  getMockLawyerStats,
  getMockLawyerClients,
  getMockWeeklyReviews,
} from '../../data/mockService';

const useLawyerDashboardData = (lawyerId: string) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0, urgent: 0, reviewedToday: 0, avgTurnaround: '—'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      // ── MOCK MODE ───────────────────────────────────────────────────────────
      if (IS_MOCK_MODE) {
        const [q, s, c] = await Promise.all([
          getMockLawyerQueue(),
          getMockLawyerStats(),
          getMockLawyerClients(),
        ]);
        setQueue(q);
        setStats(s);
        setClients(c);
        setLoading(false);
        return;
      }
      // ── END MOCK MODE ─────────────────────────────────────────────────────

      const [queueRes, allDocsRes] = await Promise.all([
        // Pending review queue — documents assigned to this lawyer
        supabase
          .from('documents')
          .select(`
            *,
            client:profiles!documents_client_id_fkey (
              id, full_name, avatar_initials, email
            )
          `)
          .eq('lawyer_id', lawyerId)
          .in('status', ['under_review', 'draft'])
          .order('created_at', { ascending: false })
          .limit(10),

        // All docs for stats
        supabase
          .from('documents')
          .select('id, status, created_at, updated_at')
          .eq('lawyer_id', lawyerId),
      ]);

      const docs = allDocsRes.data ?? [];
      const today = new Date().toISOString().split('T')[0];

      setQueue(queueRes.data ?? []);
      setStats({
        total: docs.filter(d =>
          d.status === 'under_review' || d.status === 'draft'
        ).length,
        urgent: docs.filter(d => {
          const created = new Date(d.created_at);
          const hoursOld = (Date.now() - created.getTime()) / 36e5;
          return d.status === 'under_review' && hoursOld < 24;
        }).length,
        reviewedToday: docs.filter(d =>
          d.updated_at?.startsWith(today) && d.status === 'finalized'
        ).length,
        avgTurnaround: '1.8d'
      });

      // Get unique clients from queue
      const uniqueClients = Object.values(
        (queueRes.data ?? []).reduce((acc: any, doc: any) => {
          if (doc.client && !acc[doc.client.id]) {
            acc[doc.client.id] = { ...doc.client, docCount: 0 };
          }
          if (doc.client) acc[doc.client.id].docCount++;
          return acc;
        }, {})
      );
      setClients(uniqueClients.slice(0, 5));

      setLoading(false);
    };

    if (lawyerId) fetchAll();
  }, [lawyerId]);

  // Real-time: new document assigned to lawyer (skip in mock mode)
  useEffect(() => {
    if (IS_MOCK_MODE) return;
    const channel = supabase
      .channel('lawyer-queue')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents',
          filter: `lawyer_id=eq.${lawyerId}`,
        },
        (payload) => {
          setQueue(prev => [payload.new, ...prev]);
          setStats(prev => ({ ...prev, total: prev.total + 1 }));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [lawyerId]);

  return { queue, clients, stats, loading };
};

// Weekly bar chart data — last 7 days (or mock data in mock mode)
const getWeeklyData = (docs: any[]) => {
  if (IS_MOCK_MODE) return getMockWeeklyReviews();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    return {
      day,
      reviews: docs.filter(d => d.updated_at?.startsWith(dateStr)).length
    };
  });
};

const LawyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { queue, clients, stats, loading } = useLawyerDashboardData(user!.id);

  const statCards = [
    {
      label: 'In Queue',
      value: stats.total,
      icon: <FileText size={18} className="text-blue-brand" />,
      border: 'border-blue-brand',
      trend: null
    },
    {
      label: 'Urgent',
      value: stats.urgent,
      icon: <AlertTriangle size={18} className="text-risk" />,
      border: 'border-risk',
      trend: null
    },
    {
      label: 'Reviewed Today',
      value: stats.reviewedToday,
      icon: <CheckCircle size={18} className="text-success" />,
      border: 'border-success',
      trend: null
    },
    {
      label: 'Avg. Turnaround',
      value: stats.avgTurnaround,
      icon: <Clock size={18} className="text-amber-500" />,
      border: 'border-amber-400',
      trend: '↓ 0.3d faster'
    },
  ];

  const priorityOf = (doc: any) => {
    const hoursOld =
      (Date.now() - new Date(doc.created_at).getTime()) / 36e5;
    if (hoursOld < 12) return 'urgent';
    if (hoursOld < 48) return 'normal';
    return 'low';
  };

  const priorityBadge = (p: string) => {
    const map: Record<string, string> = {
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    };
    return (
      <span className={`text-xs font-bold font-sans px-2 py-0.5 rounded-full ${map[p]}`}>
        {p.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Card key={s.label} className={`p-5 border-l-4 ${s.border} dark:bg-slate-800`}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-light-blue dark:bg-slate-700">{s.icon}</div>
              {s.trend && (
                <span className="text-xs text-success font-semibold font-sans flex items-center gap-1">
                  <TrendingUp size={12} />{s.trend}
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-dark-text dark:text-slate-100 font-serif">{s.value}</div>
            <div className="text-sm text-muted-text dark:text-slate-400 font-sans">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review Queue Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden dark:bg-slate-800">
            <div className="p-5 border-b border-border dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-serif text-lg font-semibold text-dark-text dark:text-slate-100">
                Pending Review Queue
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/lawyer/queue')}>
                View all →
              </Button>
            </div>
            <div className="divide-y divide-border/50 dark:divide-slate-700">
              {queue.slice(0, 4).map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface-gray/50 dark:hover:bg-slate-700/50
                    transition-colors cursor-pointer group"
                  onClick={() => navigate(`/lawyer/review/${doc.id}`)}
                >
                  {/* Client avatar */}
                  <div className="w-9 h-9 rounded-full bg-gold flex items-center
                    justify-center text-white text-sm font-bold flex-shrink-0">
                    {doc.client?.avatar_initials ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark-text dark:text-slate-100 truncate">
                      {doc.title}
                    </p>
                    <p className="text-xs text-muted-text dark:text-slate-400 font-sans mt-0.5">
                      {doc.client?.full_name} • {doc.type} •{' '}
                      {new Date(doc.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {priorityBadge(priorityOf(doc))}
                    <ArrowRight
                      size={14}
                      className="text-muted-text dark:text-slate-400 opacity-0 group-hover:opacity-100
                        transition-opacity"
                    />
                  </div>
                </div>
              ))}
              {queue.length === 0 && (
                <div className="text-center py-10 text-muted-text dark:text-slate-400 font-sans text-sm">
                  🎉 Queue is clear — no pending documents
                </div>
              )}
            </div>
          </Card>

          {/* Weekly Bar Chart */}
          <Card className="p-5 dark:bg-slate-800">
            <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100 mb-4">
              Weekly Review Activity
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getWeeklyData(queue)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBF1FA" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#6B7A99' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6B7A99' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #C5D5EE',
                      fontSize: 12
                    }}
                  />
                  <Bar dataKey="reviews" name="Reviews" fill="#1B3A6B" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Performance */}
          <Card className="p-5 dark:bg-slate-800">
            <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100 mb-4">
              Performance
            </h3>
            {[
              ['Response Time', 82],
              ['Client Satisfaction', 91],
              ['Docs This Month', 74],
              ['Accuracy Score', 88],
            ].map(([label, pct]) => (
              <div key={label as string} className="mb-3">
                <div className="flex justify-between text-xs font-sans mb-1.5">
                  <span className="font-semibold text-dark-text dark:text-slate-200">{label}</span>
                  <span className="text-muted-text dark:text-slate-400">{pct}%</span>
                </div>
                <div className="h-2 bg-light-blue dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>

          {/* Client List */}
          <Card className="p-5 dark:bg-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100">
                Active Clients
              </h3>
              <span className="text-xs text-muted-text dark:text-slate-400 font-sans">
                {clients.length} total
              </span>
            </div>
            <div className="space-y-3">
              {clients.map((c: any) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-light-blue dark:bg-slate-700 flex items-center
                    justify-center text-xs font-bold text-navy dark:text-blue-300 flex-shrink-0">
                    {c.avatar_initials ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-dark-text dark:text-slate-200 truncate font-sans">
                      {c.full_name}
                    </p>
                    <p className="text-xs text-muted-text dark:text-slate-400 font-sans">
                      {c.docCount} document{c.docCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
              {clients.length === 0 && (
                <p className="text-xs text-muted-text dark:text-slate-400 font-sans text-center py-4">
                  No clients yet
                </p>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-5 dark:bg-slate-800">
            <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100 mb-3">
              Quick Actions
            </h3>
            {[
              { icon: '🔎', label: 'Case Law Search', path: '/lawyer/search' },
              { icon: '📚', label: 'Case Library', path: '/lawyer/library' },
              { icon: '🛡️', label: 'Contract Risk', path: '/lawyer/risk' },
            ].map(a => (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-light-blue dark:bg-slate-700
                  hover:opacity-80 transition-opacity text-left mb-2"
              >
                <span className="text-lg">{a.icon}</span>
                <span className="text-sm font-semibold text-dark-text dark:text-slate-200 font-sans">
                  {a.label}
                </span>
                <ArrowRight size={13} className="ml-auto text-muted-text dark:text-slate-400" />
              </button>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
