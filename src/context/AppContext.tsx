import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CaseResult, ToastMessage } from '../types';
import { mockNotifications as initialNotifications } from '../data/mockData';
import { Notification } from '../types';

interface AppContextType {
  savedCases: string[];
  toggleSavedCase: (caseId: string) => void;
  notifications: Notification[];
  markAllRead: () => void;
  unreadCount: number;
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedCases, setSavedCases] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toggleSavedCase = (caseId: string) => {
    setSavedCases(prev =>
      prev.includes(caseId) ? prev.filter(id => id !== caseId) : [...prev, caseId]
    );
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider value={{
      savedCases, toggleSavedCase,
      notifications, markAllRead, unreadCount,
      toasts, addToast, removeToast,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
