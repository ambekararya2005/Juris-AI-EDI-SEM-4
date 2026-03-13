import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'gray' | 'navy';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  pulse?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-50 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
  navy: 'bg-navy text-white',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', pulse = false, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[variant]} ${pulse ? 'badge-pulse' : ''} ${className}`}
    >
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Finalized': return <Badge variant="success">{status}</Badge>;
    case 'Under Review': return <Badge variant="info" pulse>{status}</Badge>;
    case 'Revision Needed': return <Badge variant="warning">{status}</Badge>;
    case 'Draft': return <Badge variant="gray">{status}</Badge>;
    default: return <Badge>{status}</Badge>;
  }
};

export const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'HIGH': return <Badge variant="error" pulse>High Priority</Badge>;
    case 'MEDIUM': return <Badge variant="warning">Medium</Badge>;
    case 'LOW': return <Badge variant="success">Low</Badge>;
    default: return <Badge>{priority}</Badge>;
  }
};

export default Badge;
