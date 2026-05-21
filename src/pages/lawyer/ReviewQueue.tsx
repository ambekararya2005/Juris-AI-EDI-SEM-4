import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import { IS_MOCK_MODE, getMockReviewQueuePage } from '../../data/mockService';

type Priority = 'all' | 'urgent' | 'normal' | 'low';

const getPriority = (createdAt: string): 'urgent' | 'normal' | 'low' => {
  const hoursOld = (Date.now() - new Date(createdAt).getTime()) / 36e5;
  if (hoursOld < 12) return 'urgent';
  if (hoursOld < 48) return 'normal';
  return 'low';
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 36e5);
  const d = Math.floor(h / 24);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
};

const ReviewQueue: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Priority>('all');

  useEffect(() => {
    const fetchQueue = async () => {
      setLoading(true);

      // ── MOCK MODE ───────────────────────────────────────────────────────────
      if (IS_MOCK_MODE) {
        const data = await getMockReviewQueuePage();
        setQueue(data);
        setLoading(false);
        return;
      }
      // ── END MOCK MODE ─────────────────────────────────────────────────────

      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          client:profiles!documents_client_id_fkey (
            id, full_name, avatar_initials, email, phone
          )
        `)
        .eq('lawyer_id', user!.id)
        .in('status', ['under_review', 'draft'])
        .order('created_at', { ascending: true }); // oldest first = most urgent

      if (!error) setQueue(data ?? []);
      setLoading(false);
    };

    fetchQueue();

    // Real-time: new doc assigned (skip in mock mode)
    if (IS_MOCK_MODE) return;
    const channel = supabase
      .channel('review-queue')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `lawyer_id=eq.${user!.id}`,
        },
        () => { fetchQueue(); } // refetch on any change
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const filtered = queue.filter(doc => {
    if (filter === 'all') return true;
    return getPriority(doc.created_at) === filter;
  });

  const counts = {
    all: queue.length,
    urgent: queue.filter(d => getPriority(d.created_at) === 'urgent').length,
    normal: queue.filter(d => getPriority(d.created_at) === 'normal').length,
    low: queue.filter(d => getPriority(d.created_at) === 'low').length,
  };

  const priorityStyles: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-2xl font-bold text-dark-text dark:text-slate-100">
            Review Queue
          </h1>
          <p className="text-sm text-muted-text dark:text-slate-400 font-sans mt-0.5">
            {queue.length} document{queue.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-surface-gray dark:bg-slate-700 rounded-xl p-1 w-fit mb-6">
        {(['all', 'urgent', 'normal', 'low'] as Priority[]).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold font-sans
              transition-all capitalize ${
              filter === tab
                ? 'bg-white dark:bg-slate-800 text-navy dark:text-blue-300 shadow-sm'
                : 'text-muted-text dark:text-slate-400 hover:text-dark-text dark:hover:text-slate-200'
            }`}
          >
            {tab}
            <span className="ml-1.5 text-xs bg-light-blue dark:bg-slate-600 text-navy dark:text-blue-300 rounded-full px-1.5 py-0.5">
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Document Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🎉</div>
            <p className="font-semibold text-dark-text dark:text-slate-200 font-sans">Queue is clear!</p>
            <p className="text-sm text-muted-text dark:text-slate-400 font-sans mt-1">
              No {filter !== 'all' ? filter : ''} documents pending review
            </p>
          </div>
        ) : (
          filtered.map(doc => {
            const priority = getPriority(doc.created_at);
            return (
              <Card
                key={doc.id}
                className="p-5 dark:bg-slate-800 hover:border-blue-brand/40 hover:shadow-card-hover
                  transition-all cursor-pointer group"
                onClick={() => navigate(`/lawyer/review/${doc.id}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Client Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gold flex items-center
                    justify-center text-white text-sm font-bold flex-shrink-0">
                    {doc.client?.avatar_initials ?? '?'}
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-dark-text dark:text-slate-100 font-sans">
                          {doc.title}
                        </h3>
                        <p className="text-xs text-muted-text dark:text-slate-400 font-sans mt-0.5">
                          Client: {doc.client?.full_name ?? 'Unknown'} •{' '}
                          {doc.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full
                            font-sans ${priorityStyles[priority]}`}
                        >
                          {priority.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Meta Row */}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-xs text-muted-text dark:text-slate-400 font-sans">
                        <Clock size={11} />
                        Submitted {timeAgo(doc.created_at)}
                      </span>
                      <span className="text-xs text-muted-text dark:text-slate-400 font-sans">
                        v{doc.version}
                      </span>
                      {doc.district && (
                        <span className="text-xs text-muted-text dark:text-slate-400 font-sans">
                          {doc.district} Court
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      className="px-3 py-1.5 border border-border dark:border-slate-600 rounded-lg text-xs
                        font-semibold text-muted-text dark:text-slate-400 hover:bg-surface-gray dark:hover:bg-slate-700 font-sans
                        transition-colors"
                      onClick={e => {
                        e.stopPropagation();
                        // skip — move to bottom of queue
                        setQueue(prev => {
                          const rest = prev.filter(d => d.id !== doc.id);
                          return [...rest, doc];
                        });
                      }}
                    >
                      Skip
                    </button>
                    <button
                      className="px-3 py-1.5 bg-navy text-white rounded-lg text-xs
                        font-semibold font-sans hover:bg-blue-brand transition-colors
                        flex items-center gap-1.5"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/lawyer/review/${doc.id}`);
                      }}
                    >
                      Review <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReviewQueue;
