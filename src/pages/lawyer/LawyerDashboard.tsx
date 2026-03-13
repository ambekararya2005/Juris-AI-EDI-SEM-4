import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, BookOpen, Star, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getPriorityBadge } from '../../components/ui/Badge';
import { mockReviewQueue, mockActivityData, mockWeeklyReviews, mockRecentSearches } from '../../data/mockData';

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; borderColor: string }> = ({
  label, value, icon, borderColor
}) => (
  <Card className={`p-4 border-l-4 ${borderColor}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 rounded-xl bg-light-blue">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-dark-text font-serif">{value}</div>
    <div className="text-xs text-muted-text mt-0.5">{label}</div>
  </Card>
);

const priorityIcon: Record<string, string> = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢' };

const LawyerDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Pending Reviews" value={5} icon={<Clock size={18} className="text-risk" />} borderColor="border-risk" />
        <StatCard label="Completed This Month" value={12} icon={<CheckCircle size={18} className="text-success" />} borderColor="border-success" />
        <StatCard label="Cases Researched" value={34} icon={<BookOpen size={18} className="text-blue-brand" />} borderColor="border-blue-brand" />
        <StatCard label="Avg. Review Time" value="1.4h" icon={<TrendingUp size={18} className="text-amber-500" />} borderColor="border-amber-400" />
        <StatCard label="Client Rating" value="4.8 ★" icon={<Star size={18} className="text-gold" />} borderColor="border-gold" />
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Review Queue */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-serif text-base font-semibold text-dark-text">Review Queue</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/lawyer/queue')}>View All →</Button>
            </div>
            <div className="divide-y divide-border/50">
              {mockReviewQueue.map(item => (
                <div key={item.id} className="p-4 hover:bg-surface-gray/50 transition-colors flex items-center gap-3">
                  <span className="text-lg flex-shrink-0">{priorityIcon[item.priority]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-text truncate">{item.documentTitle}</p>
                    <p className="text-xs text-muted-text">{item.clientName} · {item.receivedAt}</p>
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
        <Card className="p-5">
          <h2 className="font-serif text-sm font-semibold text-dark-text mb-4">Recent Case Searches</h2>
          <div className="space-y-3">
            {mockRecentSearches.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs text-blue-brand mt-0.5">🔍</span>
                <div>
                  <p className="text-xs font-medium text-dark-text leading-snug">{s.query}</p>
                  <p className="text-xs text-muted-text">{s.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-3 text-blue-brand w-full" onClick={() => navigate('/lawyer/search')}>
            Open Case Search →
          </Button>
        </Card>

        {/* Performance */}
        <Card className="p-5">
          <h2 className="font-serif text-sm font-semibold text-dark-text mb-4">Performance</h2>

          {/* Circular progress */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" stroke="#EBF1FA" strokeWidth="10" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#1B3A6B" strokeWidth="10" fill="none"
                  strokeDasharray={`${(12 / 15) * 251.3} 251.3`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-bold text-lg text-dark-text leading-none">12</span>
                <span className="text-xs text-muted-text">/15</span>
              </div>
            </div>
            <p className="text-xs text-muted-text mt-1">Monthly review target</p>
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-0.5 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} fill={i < 4.8 ? '#E8A020' : 'none'} className="text-gold" />
            ))}
          </div>
          <p className="text-center text-sm font-semibold text-dark-text">4.8 / 5.0</p>

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

      {/* Line Chart */}
      <Card className="p-5">
        <h3 className="font-serif text-base font-semibold text-dark-text mb-4">Review Activity — Last 6 Months</h3>
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
