import React from 'react';

// ─── Status Badge ─────────────────────────────────────────────────────────────

type StatusVariant =
  | 'draft' | 'pending' | 'approved' | 'rejected' | 'active'
  | 'info' | 'success' | 'warning' | 'error';

const statusStyles: Record<StatusVariant, string> = {
  draft:    'bg-gray-100   text-gray-600   dark:bg-gray-700   dark:text-gray-300',
  pending:  'bg-amber-100  text-amber-700  dark:bg-amber-900/40 dark:text-amber-300',
  approved: 'bg-green-100  text-green-700  dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100    text-red-700    dark:bg-red-900/40  dark:text-red-300',
  active:   'bg-blue-100   text-blue-700   dark:bg-blue-900/40 dark:text-blue-300',
  info:     'bg-light-blue text-blue-brand dark:bg-blue-900/40 dark:text-blue-300',
  success:  'bg-green-50   text-success    dark:bg-green-900/40 dark:text-green-300',
  warning:  'bg-amber-50   text-amber-700  dark:bg-amber-900/40 dark:text-amber-300',
  error:    'bg-red-50     text-risk       dark:bg-red-900/40  dark:text-red-300',
};

interface BadgeProps {
  variant?: StatusVariant;
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  pulse = false,
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
      ${statusStyles[variant]} ${pulse ? 'badge-pulse' : ''} ${className}`}
  >
    {children}
  </span>
);

// ─── Document status helpers ──────────────────────────────────────────────────

export const getStatusBadge = (status: string) => {
  const map: Record<string, { variant: StatusVariant; label: string }> = {
    'Draft':          { variant: 'draft',    label: 'Draft' },
    'Under Review':   { variant: 'pending',  label: 'Under Review' },
    'Finalized':      { variant: 'approved', label: 'Finalized' },
    'Revision Needed':{ variant: 'rejected', label: 'Revision Needed' },
  };
  const cfg = map[status] ?? { variant: 'info', label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

// ─── Priority badge ───────────────────────────────────────────────────────────

export const getPriorityBadge = (priority: string) => {
  const map: Record<string, { variant: StatusVariant; label: string }> = {
    HIGH:   { variant: 'rejected', label: '🔴 High' },
    MEDIUM: { variant: 'pending',  label: '🟡 Medium' },
    LOW:    { variant: 'approved', label: '🟢 Low' },
  };
  const cfg = map[priority] ?? { variant: 'info', label: priority };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

// ─── Case stage badge ─────────────────────────────────────────────────────────

export const getStageBadge = (stage: string) => {
  const map: Record<string, StatusVariant> = {
    'Filed':              'draft',
    'Under Review':       'pending',
    'Hearing Scheduled':  'active',
    'Judgment Pending':   'warning',
    'Resolved':           'approved',
  };
  return <Badge variant={map[stage] ?? 'info'}>{stage}</Badge>;
};

export default Badge;
