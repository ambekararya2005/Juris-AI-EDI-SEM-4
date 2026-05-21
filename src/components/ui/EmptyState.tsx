import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}

/** Default SVG illustration — document with magnifier */
const DefaultIllustration: React.FC = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="20" y="10" width="64" height="82" rx="8" fill="#EBF1FA" className="dark:fill-slate-700" />
    <rect x="32" y="28" width="40" height="4" rx="2" fill="#C5D5EE" className="dark:fill-slate-500" />
    <rect x="32" y="38" width="32" height="4" rx="2" fill="#C5D5EE" className="dark:fill-slate-500" />
    <rect x="32" y="48" width="36" height="4" rx="2" fill="#C5D5EE" className="dark:fill-slate-500" />
    <rect x="32" y="58" width="24" height="4" rx="2" fill="#C5D5EE" className="dark:fill-slate-500" />
    <circle cx="82" cy="78" r="22" fill="white" className="dark:fill-slate-800" stroke="#C5D5EE" strokeWidth="2" />
    <circle cx="80" cy="76" r="12" fill="#EBF1FA" className="dark:fill-slate-700" stroke="#2E5DA6" strokeWidth="2" />
    <line x1="89" y1="86" x2="100" y2="97" stroke="#2E5DA6" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  ctaLabel,
  onCta,
  className = '',
}) => (
  <div
    className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
  >
    <div className="mb-5 opacity-80">{icon ?? <DefaultIllustration />}</div>

    <h3 className="font-serif text-xl font-semibold text-dark-text dark:text-slate-100 mb-2">
      {title}
    </h3>

    {subtitle && (
      <p className="text-sm text-muted-text dark:text-slate-400 max-w-xs leading-relaxed mb-6">
        {subtitle}
      </p>
    )}

    {ctaLabel && onCta && (
      <button
        onClick={onCta}
        className="px-5 py-2.5 bg-navy hover:bg-blue-brand text-white text-sm font-medium
          rounded-xl transition-colors duration-200 shadow-card hover:shadow-card-hover"
      >
        {ctaLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
