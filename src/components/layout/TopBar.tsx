import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import NotificationPanel from '../shared/NotificationPanel';

const breadcrumbMap: Record<string, string[]> = {
  '/client/dashboard': ['Client', 'Dashboard'],
  '/client/documents': ['Client', 'My Documents'],
  '/client/documents/new': ['Client', 'New Document'],
  '/client/summarize': ['Client', 'Summarize Document'],
  '/client/risk': ['Client', 'Contract Risk'],
  '/lawyer/dashboard': ['Lawyer', 'Dashboard'],
  '/lawyer/queue': ['Lawyer', 'Review Queue'],
  '/lawyer/search': ['Lawyer', 'Case Law Search'],
  '/lawyer/library': ['Lawyer', 'Case Library'],
  '/lawyer/risk': ['Lawyer', 'Contract Risk'],
  '/settings': ['Settings'],
};

const TopBar: React.FC = () => {
  const { unreadCount } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();

  const crumbs = breadcrumbMap[location.pathname] ||
    breadcrumbMap[location.pathname.replace(/\/[^/]+$/, '')] ||
    ['JurisAI'];

  return (
    <>
      <header className="h-16 bg-white border-b border-border flex items-center px-6 gap-4 z-20">
        {/* Breadcrumb */}
        <div className="flex-1 flex items-center gap-2 text-sm text-muted-text">
          {crumbs.map((crumb, i) => (
            <React.Fragment key={crumb}>
              {i > 0 && <ChevronRight size={14} />}
              <span className={i === crumbs.length - 1 ? 'text-dark-text font-medium' : ''}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-surface-gray rounded-xl px-3 py-2 w-64">
          <Search size={16} className="text-muted-text" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none w-full text-dark-text placeholder:text-muted-text"
          />
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => setNotifOpen(true)}
          className="relative p-2 rounded-xl hover:bg-surface-gray transition-colors"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell size={20} className="text-muted-text" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-risk rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
};

export default TopBar;
