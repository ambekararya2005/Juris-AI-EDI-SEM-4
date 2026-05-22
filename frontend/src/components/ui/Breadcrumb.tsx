import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const navigate = useNavigate();

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1 text-sm text-muted-text dark:text-slate-400 ${className}`}
    >
      <button
        onClick={() => navigate(-1)}
        className="p-0.5 hover:text-navy dark:hover:text-blue-300 transition-colors"
        aria-label="Home"
      >
        <Home size={14} />
      </button>

      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          <ChevronRight size={13} className="text-muted-text/50 flex-shrink-0" />
          {item.href && i < items.length - 1 ? (
            <button
              onClick={() => navigate(item.href!)}
              className="hover:text-navy dark:hover:text-blue-300 transition-colors hover:underline"
            >
              {item.label}
            </button>
          ) : (
            <span
              className={
                i === items.length - 1
                  ? 'text-dark-text dark:text-slate-200 font-medium'
                  : ''
              }
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
