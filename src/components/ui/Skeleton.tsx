import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  count?: number;
}

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  rounded = 'lg',
  className = '',
  count = 1,
}) => {
  const base = `animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%]
    dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 ${roundedMap[rounded]} ${className}`;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={base}
          style={{ width, height }}
          aria-hidden="true"
        />
      ))}
    </>
  );
};

/** Preset: card skeleton (title + 3 lines + button) */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-card space-y-3 ${className}`}>
    <Skeleton height="1.25rem" width="60%" />
    <Skeleton height="0.75rem" count={3} className="mt-2" />
    <Skeleton height="2rem" width="40%" rounded="xl" className="mt-4" />
  </div>
);

/** Preset: table row skeleton */
export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton height="0.875rem" width={i === 0 ? '80%' : '60%'} />
      </td>
    ))}
  </tr>
);

export default Skeleton;
