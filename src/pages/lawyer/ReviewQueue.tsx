import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getPriorityBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import useSimulatedLoading from '../../hooks/useSimulatedLoading';
import { mockReviewQueue } from '../../data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterTab = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Urgent', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

// ─── Client avatar initials from name ────────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ReviewQueue: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, triggerLoad } = useSimulatedLoading(1000);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  // Trigger skeleton on mount
  useEffect(() => {
    triggerLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter queue based on active tab
  const filtered =
    activeTab === 'ALL'
      ? mockReviewQueue
      : mockReviewQueue.filter(item => item.priority === activeTab);

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-dark-text dark:text-slate-100">Review Queue</h1>
          <p className="text-muted-text dark:text-slate-400 text-sm mt-1">Documents awaiting your legal review</p>
        </div>
        <span className="px-3 py-1.5 bg-risk/10 text-risk text-sm font-semibold rounded-full">
          {mockReviewQueue.length} pending
        </span>
      </div>

      {/* ── Priority Filter Tabs ─────────────────────────────────────────── */}
      <div className="flex gap-0 border-b border-border dark:border-slate-700">
        {TABS.map(tab => (
          <button
            key={tab.value}
            id={`review-tab-${tab.value.toLowerCase()}`}
            onClick={() => setActiveTab(tab.value)}
            className={[
              'px-5 py-2.5 text-sm font-medium transition-colors focus:outline-none',
              activeTab === tab.value
                ? 'border-b-2 border-gold text-navy dark:text-blue-300 -mb-px'
                : 'text-muted-text dark:text-slate-400 hover:text-dark-text dark:hover:text-slate-200',
            ].join(' ')}
          >
            {tab.label}
            {tab.value !== 'ALL' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({mockReviewQueue.filter(i => i.priority === tab.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {isLoading ? (
        /* Skeleton loaders */
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <Card className="dark:bg-slate-800">
          <EmptyState
            title="No items in queue"
            subtitle="All caught up!"
          />
        </Card>
      ) : (
        /* Document cards */
        <div className="space-y-3">
          {filtered.map(item => (
            <Card
              key={item.id}
              className="p-5 dark:bg-slate-800 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Client avatar */}
                <div className="w-11 h-11 rounded-full bg-gold/90 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                  {getInitials(item.clientName)}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark-text dark:text-slate-100 leading-tight truncate">
                    {item.documentTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm text-muted-text dark:text-slate-400">{item.clientName}</span>
                    <span className="text-muted-text dark:text-slate-600">·</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-gray dark:bg-slate-700 text-dark-text dark:text-slate-300">
                      {item.documentType}
                    </span>
                  </div>
                </div>

                {/* Right side: time + priority + button */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-text dark:text-slate-400 whitespace-nowrap">
                    Received {item.receivedAt}
                  </span>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(item.priority)}
                    <Button
                      id={`open-editor-${item.documentId}`}
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/lawyer/review/${item.documentId}`)}
                    >
                      Open in Editor →
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewQueue;
