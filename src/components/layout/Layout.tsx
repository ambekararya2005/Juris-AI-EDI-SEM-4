import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';

const toastBg: Record<string, string> = {
  success: 'bg-success text-white',
  error: 'bg-risk text-white',
  warning: 'bg-gold text-white',
  info: 'bg-blue-brand text-white',
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-slide-in-right
            min-w-[280px] max-w-sm ${toastBg[toast.type]}`}
        >
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

interface LayoutProps {
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ requireAuth = true }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const page = pathParts[pathParts.length - 1] || 'home';
    document.title = `${page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, ' ')} | JurisAI`;
  }, [location]);

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen bg-surface-gray">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 page-enter overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Layout;
