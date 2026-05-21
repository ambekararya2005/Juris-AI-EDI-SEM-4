import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, FilePlus, Shield, Clock, CheckCircle, AlertTriangle,
  TrendingUp, Eye, ArrowRight, Bell, MessageSquare, Star,
  FileCheck, FileEdit, Layers,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../components/ui/Card';
import { getStatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { mockActivityData } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { OnboardingModal } from '../../components/OnboardingModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const statusDbToUI: Record<string, string> = {
  draft: 'Draft',
  under_review: 'Under Review',
  finalized: 'Finalized',
  revision_needed: 'Revision Needed',
  'Draft': 'Draft',
  'Under Review': 'Under Review',
  'Finalized': 'Finalized',
  'Revision Needed': 'Revision Needed',
};

const notifIcons: Record<string, string> = {
  success: '✅',
  info: 'ℹ️',
  warning: '⚠️',
  error: '🚨',
};

// ─── Animated Stat Card ───────────────────────────────────────────────────────
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
    <Card className={`p-5 border-l-4 ${borderColor} dark:bg-slate-800 dark:border-opacity-80`}>
      {loading ? (
        <Skeleton height="5rem" rounded="xl" />
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-light-blue dark:bg-slate-700">{icon}</div>
            {trend && (
              <span className="text-xs text-success font-medium flex items-center gap-1">
                <TrendingUp size={12} />{trend}
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-dark-text dark:text-slate-100 font-serif mb-0.5 stat-number">
            {typeof value === 'number' ? display : value}
          </div>
          <div className="text-sm text-muted-text dark:text-slate-400">{label}</div>
        </>
      )}
    </Card>
  );
};

// ─── Case Timeline Widget ─────────────────────────────────────────────────────
const CASE_STAGES = ['Filed', 'Under Review', 'Hearing Scheduled', 'Judgment Pending', 'Resolved'] as const;
type CaseStage = typeof CASE_STAGES[number];

const CaseTimeline: React.FC<{ activeCase: any; loading: boolean }> = ({ activeCase, loading }) => {
  if (!activeCase && !loading) return null;

  const currentIdx = activeCase && activeCase.stage ? CASE_STAGES.indexOf(activeCase.stage as CaseStage) : 0;

  return (
    <Card className="p-5 dark:bg-slate-800">
      <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100 mb-4">
        Case Timeline
      </h3>
      {loading ? (
        <div className="space-y-3">
          <Skeleton height="2rem" rounded="xl" />
          <Skeleton height="1rem" width="60%" />
        </div>
      ) : (
        <>
          {/* Stepper */}
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {CASE_STAGES.map((stage, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const isFuture = idx > currentIdx;
              return (
                <React.Fragment key={stage}>
                  <div className="flex flex-col items-center gap-1 min-w-[70px]">
                    {/* Circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                        ${isCurrent ? 'bg-gold border-gold text-white shadow-lg shadow-amber-200' : ''}
                        ${isPast ? 'bg-navy border-navy text-white' : ''}
                        ${isFuture ? 'bg-transparent border-slate-300 dark:border-slate-600 text-slate-300 dark:text-slate-600' : ''}
                      `}
                    >
                      {isPast ? '✓' : idx + 1}
                    </div>
                    {/* Label */}
                    <span
                      className={`text-[9px] font-medium text-center leading-tight max-w-[64px]
                        ${isCurrent ? 'text-gold font-semibold' : ''}
                        ${isPast ? 'text-navy dark:text-blue-400' : ''}
                        ${isFuture ? 'text-slate-400 dark:text-slate-500' : ''}
                      `}
                    >
                      {stage}
                    </span>
                  </div>
                  {/* Connector line */}
                  {idx < CASE_STAGES.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 min-w-[12px] mx-0.5 rounded-full
                        ${idx < currentIdx ? 'bg-navy dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'}
                      `}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Case details */}
          <div className="mt-4 pt-3 border-t border-border dark:border-slate-700 grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-muted-text dark:text-slate-400 mb-0.5">Case No.</p>
              <p className="font-semibold text-dark-text dark:text-slate-200">{activeCase.caseNumber}</p>
            </div>
            <div>
              <p className="text-muted-text dark:text-slate-400 mb-0.5">Court</p>
              <p className="font-semibold text-dark-text dark:text-slate-200">{activeCase.court}</p>
            </div>
            <div>
              <p className="text-muted-text dark:text-slate-400 mb-0.5">Next Hearing</p>
              <p className="font-semibold text-gold">{activeCase.nextHearing}</p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

// ─── Upcoming Hearings Widget ─────────────────────────────────────────────────
const UpcomingHearings: React.FC<{ hearings: any[]; loading: boolean }> = ({ hearings, loading }) => {
  const { addToast } = useApp();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return { month: '—', day: '—' };
    const d = new Date(dateStr);
    const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = d.getDate();
    return { month, day };
  };

  return (
    <Card className="p-5 dark:bg-slate-800">
      <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100 mb-4 flex items-center gap-2">
        <Bell size={15} className="text-navy dark:text-blue-400" /> Upcoming Hearings
      </h3>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} height="3.5rem" rounded="xl" />)}
        </div>
      ) : hearings.length === 0 ? (
        <p className="text-xs text-muted-text dark:text-slate-400 py-2 italic text-center">No upcoming hearings scheduled.</p>
      ) : (
        <div className="space-y-3">
          {hearings.map(hearing => {
            const { month, day } = formatDate(hearing.date);
            return (
              <div
                key={hearing.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-gray dark:bg-slate-700/60 hover:bg-light-blue dark:hover:bg-slate-700 transition-colors"
              >
                {/* Date chip */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-navy dark:bg-blue-700 flex flex-col items-center justify-center text-white">
                  <span className="text-[9px] font-bold tracking-widest">{month}</span>
                  <span className="text-lg font-bold leading-none">{day}</span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-dark-text dark:text-slate-200 truncate">{hearing.caseTitle}</p>
                  <p className="text-[10px] text-muted-text dark:text-slate-400 truncate">{hearing.court}</p>
                </div>
                {/* Reminder button */}
                <button
                  onClick={() => addToast(`Reminder set for ${hearing.date}`, 'success')}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-navy/10 dark:hover:bg-blue-500/20 text-muted-text hover:text-navy dark:hover:text-blue-400 transition-colors"
                  title="Set Reminder"
                >
                  <Bell size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

// ─── Assigned Lawyer Card ─────────────────────────────────────────────────────
const AssignedLawyerCard: React.FC<{ loading: boolean }> = ({ loading }) => {
  const { addToast } = useApp();

  return (
    <Card className="p-5 dark:bg-slate-800">
      <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100 mb-4">
        Assigned Lawyer
      </h3>
      {loading ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton height="3rem" width="3rem" rounded="full" />
            <div className="flex-1">
              <Skeleton height="1rem" width="80%" />
              <Skeleton height="0.75rem" width="60%" className="mt-1" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
              RJ
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-dark-text dark:text-slate-100 text-sm">Adv. Rahul Vijay Joshi</p>
              <p className="text-xs text-muted-text dark:text-slate-400">Bar No. MH/4521/2017</p>
              <p className="text-xs text-gold font-semibold mt-0.5 flex items-center gap-1">
                <Star size={11} className="fill-gold text-gold" /> 4.8 ★
              </p>
            </div>
          </div>

          {/* Specializations */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['Criminal Law', 'Property Law', 'Civil Litigation'].map(spec => (
              <span
                key={spec}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-light-blue dark:bg-slate-700 text-navy dark:text-blue-300 border border-blue-200 dark:border-slate-600"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* Message button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full dark:border-slate-500 dark:text-slate-300"
            onClick={() => addToast('Messaging coming soon', 'info')}
          >
            <MessageSquare size={13} /> Message
          </Button>
        </>
      )}
    </Card>
  );
};

// ─── Document Status Summary ──────────────────────────────────────────────────
const DocStatusSummary: React.FC<{ stats: any; loading: boolean }> = ({ stats, loading }) => {
  const displayStats = [
    { label: 'Total', value: stats.total, icon: <Layers size={16} className="text-blue-brand" />, border: 'border-blue-brand', bg: 'bg-light-blue dark:bg-slate-700' },
    { label: 'Under Review', value: stats.underReview, icon: <Clock size={16} className="text-amber-500" />, border: 'border-amber-400', bg: 'bg-amber-50 dark:bg-slate-700' },
    { label: 'Finalized', value: stats.finalized, icon: <FileCheck size={16} className="text-success" />, border: 'border-success', bg: 'bg-green-50 dark:bg-slate-700' },
    { label: 'Draft', value: stats.draft, icon: <FileEdit size={16} className="text-muted-text" />, border: 'border-slate-300 dark:border-slate-500', bg: 'bg-surface-gray dark:bg-slate-700' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {displayStats.map(s => (
        <div
          key={s.label}
          className={`p-4 rounded-xl border-l-4 ${s.border} ${s.bg} flex flex-col gap-1`}
        >
          {loading ? (
            <Skeleton height="2.5rem" rounded="lg" />
          ) : (
            <>
              <div className="flex items-center gap-2">{s.icon}<span className="text-xs text-muted-text dark:text-slate-400">{s.label}</span></div>
              <span className="text-2xl font-bold font-serif text-dark-text dark:text-slate-100">{s.value}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Live Data Fetching Hook ──────────────────────────────────────────────────
const useClientDashboardData = (userId: string) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeCase, setActiveCase] = useState<any>(null);
  const [hearings, setHearings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      const [docsRes, notifsRes, caseRes] = await Promise.all([
        supabase
          .from('documents')
          .select('*')
          .eq('client_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),

        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(6),

        supabase
          .from('cases')
          .select('*')
          .eq('client_id', userId)
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

      // Map documents
      const docs = (docsRes.data ?? []).map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        status: statusDbToUI[doc.status] || doc.status,
        createdAt: doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '',
        lawyerName: doc.lawyer_name || '',
      }));
      setDocuments(docs);

      // Map notifications
      const notifs = (notifsRes.data ?? []).map((n: any) => ({
        id: n.id,
        text: n.text || n.message || '',
        type: n.type || 'info',
        timestamp: n.created_at ? new Date(n.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '',
        read: n.read ?? false,
        icon: notifIcons[n.type] || 'ℹ️',
      }));
      setNotifications(notifs);

      // Map active case
      const firstCase = caseRes.data && caseRes.data.length > 0 ? caseRes.data[0] : null;
      const mappedCase = firstCase ? {
        id: firstCase.id,
        caseNumber: firstCase.case_number || 'N/A',
        court: firstCase.court_name || firstCase.court || 'Court Room',
        nextHearing: firstCase.next_hearing ? new Date(firstCase.next_hearing).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'None',
        stage: firstCase.stage || 'Filed',
      } : null;
      setActiveCase(mappedCase);

      // Fetch hearings if active case exists
      if (firstCase) {
        const { data: hearingData } = await supabase
          .from('hearings')
          .select('*')
          .eq('case_id', firstCase.id)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .limit(3);

        const mappedHearings = (hearingData ?? []).map((h: any) => ({
          id: h.id,
          date: h.date,
          caseTitle: h.case_title || h.caseTitle || firstCase.title || 'Hearing Case',
          court: h.court_name || h.court || firstCase.court_name || 'Court Room',
        }));
        setHearings(mappedHearings);
      }

      setLoading(false);
    };

    if (userId) fetchAll();
  }, [userId]);

  // Real-time: listen for new notifications
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('client-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload.new;
          const newNotif = {
            id: n.id,
            text: n.text || n.message || '',
            type: n.type || 'info',
            timestamp: n.created_at ? new Date(n.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Just now',
            read: n.read ?? false,
            icon: notifIcons[n.type] || 'ℹ️',
          };
          setNotifications(prev => [newNotif, ...prev.slice(0, 5)]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { documents, notifications, activeCase, hearings, loading };
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { documents, notifications, activeCase, hearings, loading } = useClientDashboardData(user!.id);

  // Compute stats from live data
  const stats = {
    total: documents.length,
    underReview: documents.filter(d => d.status === 'Under Review' || d.status === 'under_review').length,
    finalized: documents.filter(d => d.status === 'Finalized' || d.status === 'finalized').length,
    pending: documents.filter(d => d.status === 'Revision Needed' || d.status === 'revision_needed').length,
    draft: documents.filter(d => d.status === 'Draft' || d.status === 'draft').length,
  };

  return (
    <div className="space-y-6">
      <OnboardingModal />

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Documents Created" value={stats.total} icon={<FileText size={18} className="text-blue-brand" />} borderColor="border-blue-brand" trend="+2 this month" loading={loading} />
        <StatCard label="Under Review" value={stats.underReview} icon={<Clock size={18} className="text-amber-500" />} borderColor="border-amber-400" loading={loading} />
        <StatCard label="Finalized" value={stats.finalized} icon={<CheckCircle size={18} className="text-success" />} borderColor="border-success" loading={loading} />
        <StatCard label="Pending Action" value={stats.pending} icon={<AlertTriangle size={18} className="text-risk" />} borderColor="border-risk" loading={loading} />
      </div>

      {/* ── Document Status Summary ── */}
      <DocStatusSummary stats={stats} loading={loading} />

      {/* ── Case Timeline ── */}
      <CaseTimeline activeCase={activeCase} loading={loading} />

      {/* ── Main 3-col Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Documents table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden dark:bg-slate-800">
            <div className="p-5 border-b border-border dark:border-slate-700 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-dark-text dark:text-slate-100">Recent Documents</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/client/documents')}>
                View all
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-gray dark:bg-slate-700/60 text-xs text-muted-text dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Document</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-left">Lawyer</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 dark:divide-slate-700">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-4 py-3"><Skeleton height="1.5rem" /></td>
                      </tr>
                    ))
                  ) : documents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-text italic">
                        No documents created yet.
                      </td>
                    </tr>
                  ) : (
                    documents.slice(0, 6).map(doc => (
                      <tr key={doc.id} className="hover:bg-surface-gray/50 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-dark-text dark:text-slate-200 max-w-[160px] truncate">
                          {doc.title}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-text dark:text-slate-400">{doc.type}</td>
                        <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                        <td className="px-4 py-3 text-xs text-muted-text dark:text-slate-400">{doc.createdAt}</td>
                        <td className="px-4 py-3 text-xs text-muted-text dark:text-slate-400">
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Upcoming Hearings in left column below table */}
          <UpcomingHearings hearings={hearings} loading={loading} />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Assigned Lawyer */}
          <AssignedLawyerCard loading={loading} />

          {/* Quick Actions */}
          <Card className="p-5 dark:bg-slate-800">
            <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: <FilePlus size={20} className="text-navy dark:text-blue-300" />, label: 'Draft New Document', path: '/client/documents/new', bg: 'bg-light-blue dark:bg-slate-700' },
                { icon: <FileText size={20} className="text-blue-brand dark:text-blue-300" />, label: 'Summarize a Doc', path: '/client/summarize', bg: 'bg-light-blue dark:bg-slate-700' },
                { icon: <Shield size={20} className="text-risk" />, label: 'Check Contract Risk', path: '/client/risk', bg: 'bg-red-50 dark:bg-slate-700' },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl ${action.bg}
                    hover:opacity-80 transition-opacity text-left group`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-600 shadow-sm flex items-center justify-center flex-shrink-0">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-dark-text dark:text-slate-200">{action.label}</span>
                  <ArrowRight size={14} className="ml-auto text-muted-text dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-5 dark:bg-slate-800">
            <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100 mb-4">Notifications</h3>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height="2rem" />
                ))
              ) : notifications.length === 0 ? (
                <p className="text-xs text-muted-text dark:text-slate-400 py-2 italic text-center">No new notifications.</p>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className="flex gap-3 items-start">
                    <span className="text-base flex-shrink-0 mt-0.5">{notif.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-dark-text dark:text-slate-200 leading-snug">{notif.text}</p>
                      <p className="text-xs text-muted-text dark:text-slate-500 mt-0.5">{notif.timestamp}</p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-brand flex-shrink-0 mt-1" />}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Activity Chart ── */}
      <Card className="p-5 dark:bg-slate-800">
        <h3 className="font-serif text-base font-semibold text-dark-text dark:text-slate-100 mb-4">
          Document Activity — Last 6 Months
        </h3>
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
