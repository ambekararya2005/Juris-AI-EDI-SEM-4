import React from 'react';
import { X, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeColors: Record<string, string> = {
  success: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50 text-green-900 dark:text-green-300',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 text-amber-900 dark:text-amber-300',
  error: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50 text-red-900 dark:text-red-300',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50 text-blue-900 dark:text-blue-300',
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, markAllRead } = useNotifications();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={onClose} />
      )}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-850 shadow-2xl z-50 flex flex-col
          transition-transform duration-300 ease-out border-l border-border dark:border-slate-700
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border dark:border-slate-700">
          <h2 className="font-serif text-lg font-semibold text-dark-text dark:text-slate-100">Notifications</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-xs text-blue-brand dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-gray dark:hover:bg-slate-800 rounded-lg transition-colors text-muted-text dark:text-slate-400"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex gap-3 p-3 rounded-xl border transition-all
                ${typeColors[notif.type] || 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50 text-blue-900 dark:text-blue-300'}
                ${!notif.read ? 'border-l-4' : 'opacity-70'}`}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{notif.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notif.read ? 'font-medium text-dark-text dark:text-slate-100' : 'text-muted-text dark:text-slate-400'}`}>
                  {notif.text}
                </p>
                <p className="text-xs text-muted-text dark:text-slate-500 mt-1">{notif.timestamp}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-blue-brand mt-1.5 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
