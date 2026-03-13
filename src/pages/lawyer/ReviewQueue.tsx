import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getPriorityBadge } from '../../components/ui/Badge';
import { mockReviewQueue } from '../../data/mockData';

const priorityIcon: Record<string, string> = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢' };

const ReviewQueue: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-dark-text">Review Queue</h1>
          <p className="text-muted-text text-sm mt-1">Documents awaiting your legal review</p>
        </div>
        <span className="px-3 py-1.5 bg-risk/10 text-risk text-sm font-semibold rounded-full">
          {mockReviewQueue.length} pending
        </span>
      </div>
      <Card className="overflow-hidden">
        <div className="divide-y divide-border/50">
          {mockReviewQueue.map(item => (
            <div key={item.id} className="p-5 hover:bg-surface-gray/50 transition-colors flex items-center gap-4">
              <span className="text-xl">{priorityIcon[item.priority]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-dark-text">{item.documentTitle}</p>
                <p className="text-sm text-muted-text mt-0.5">{item.clientName} · {item.documentType} · Received {item.receivedAt}</p>
              </div>
              {getPriorityBadge(item.priority)}
              <Button
                variant="primary" size="sm"
                onClick={() => navigate(`/lawyer/review/${item.documentId}`)}
              >
                Review Now →
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ReviewQueue;
