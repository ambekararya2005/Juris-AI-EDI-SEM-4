import React from 'react';

interface SkeletonCardProps {
  lines?: number;
  showHeader?: boolean;
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  showHeader = true,
  className = '',
}) => (
  <div
    className={`bg-white dark:bg-slate-800 rounded-2xl border border-border dark:border-slate-700 p-5 space-y-3 animate-pulse ${className}`}
    aria-hidden="true"
  >
    {showHeader && (
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded-md w-2/3" />
          <div className="h-2.5 bg-gray-100 dark:bg-slate-600 rounded-md w-1/3" />
        </div>
      </div>
    )}
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-md"
          style={{ width: i === lines - 1 ? '75%' : '100%' }}
        />
      ))}
    </div>
    <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded-lg w-28 mt-2" />
  </div>
);

export default SkeletonCard;
