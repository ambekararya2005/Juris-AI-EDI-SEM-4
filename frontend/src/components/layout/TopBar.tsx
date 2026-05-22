import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, ChevronRight, Moon, Sun, Menu, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

// ─── Breadcrumb map ───────────────────────────────────────────
const breadcrumbMap: Record<string, string[]> = {
  '/client/dashboard':     ['Client', 'Dashboard'],
  '/client/documents':     ['Client', 'My Documents'],
  '/client/documents/new': ['Client', 'New Document'],
  '/client/summarize':     ['Client', 'Summarize Document'],
  '/client/risk':          ['Client', 'Contract Risk'],
  '/lawyer/dashboard':     ['Lawyer', 'Dashboard'],
  '/lawyer/queue':         ['Lawyer', 'Review Queue'],
  '/lawyer/search':        ['Lawyer', 'Case Law Search'],
  '/lawyer/library':       ['Lawyer', 'Case Library'],
  '/lawyer/risk':          ['Lawyer', 'Contract Risk'],
  '/settings':             ['Settings'],
};

// ─── Notification type → icon ─────────────────────────────────
const notifIcon: Record<string, string> = {
  success: '✅', info: '💬', warning: '⚠️', error: '🔔',
};

// ─── Dark mode hook ───────────────────────────────────────────
const useDarkMode = () => {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggle = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setDark(false);
      localStorage.setItem('jurisai-theme', 'light');
    } else {
      html.classList.add('dark');
      setDark(true);
      localStorage.setItem('jurisai-theme', 'dark');
    }
  };

  // Apply saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('jurisai-theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);

  return { dark, toggle };
};

// ─── Props from Layout ────────────────────────────────────────
interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { notifications, markAllRead, unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { dark, toggle: toggleDark } = useDarkMode();

  const crumbs =
    breadcrumbMap[location.pathname] ??
    breadcrumbMap[location.pathname.replace(/\/[^/]+$/, '')] ??
    ['JurisAI'];

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-border dark:border-slate-700
      flex items-center px-4 lg:px-6 gap-3 z-20 flex-shrink-0">

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-surface-gray dark:hover:bg-slate-700
          text-muted-text dark:text-slate-400 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="flex-1 flex items-center gap-1.5 text-sm text-muted-text dark:text-slate-400 min-w-0 overflow-hidden">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb}>
            {i > 0 && <ChevronRight size={13} className="flex-shrink-0" />}
            <span
              className={`truncate ${
                i === crumbs.length - 1
                  ? 'text-dark-text dark:text-slate-100 font-medium'
                  : ''
              }`}
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Search — hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 bg-surface-gray dark:bg-slate-700
        rounded-xl px-3 py-2 w-56 border border-transparent focus-within:border-blue-brand transition-colors">
        <Search size={15} className="text-muted-text dark:text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm outline-none w-full text-dark-text dark:text-slate-100
            placeholder:text-muted-text dark:placeholder:text-slate-500"
        />
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        className="p-2 rounded-xl hover:bg-surface-gray dark:hover:bg-slate-700
          text-muted-text dark:text-slate-400 hover:text-navy dark:hover:text-blue-300 transition-colors"
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={dark ? 'Light mode' : 'Dark mode'}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Notification Bell + Dropdown */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(v => !v)}
          className="relative p-2 rounded-xl hover:bg-surface-gray dark:hover:bg-slate-700 transition-colors"
          aria-label={`Notifications (${unreadCount} unread)`}
          aria-expanded={notifOpen}
        >
          <Bell size={19} className="text-muted-text dark:text-slate-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-risk rounded-full text-white
              text-[9px] flex items-center justify-center font-bold badge-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown panel */}
        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800
            rounded-2xl shadow-2xl border border-border dark:border-slate-700 z-50 animate-fade-in-up overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3
              border-b border-border dark:border-slate-700">
              <span className="font-serif text-sm font-semibold text-dark-text dark:text-slate-100">
                Notifications
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-brand hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-muted-text hover:text-dark-text dark:text-slate-400 p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.slice(0, 4).map(notif => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border/50
                    dark:border-slate-700/50 hover:bg-surface-gray dark:hover:bg-slate-700/50
                    transition-colors last:border-0 ${!notif.read ? 'bg-light-blue/30 dark:bg-blue-900/10' : ''}`}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">
                    {notif.icon ?? notifIcon[notif.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${
                      !notif.read
                        ? 'font-medium text-dark-text dark:text-slate-100'
                        : 'text-muted-text dark:text-slate-400'
                    }`}>
                      {notif.text}
                    </p>
                    <p className="text-[10px] text-muted-text dark:text-slate-500 mt-0.5">
                      {notif.timestamp}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-brand flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 text-center border-t border-border dark:border-slate-700">
              <button className="text-xs text-blue-brand hover:underline">
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
