import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { X, LayoutDashboard, FileText, FilePlus, BookOpen, Search, ClipboardList } from 'lucide-react';

// ─── Toast container ──────────────────────────────────────────
const toastBg: Record<string, string> = {
  success: 'bg-success text-white',
  error:   'bg-risk text-white',
  warning: 'bg-gold text-white',
  info:    'bg-blue-brand text-white',
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();
  return (
    <div className="fixed bottom-20 lg:bottom-6 right-6 z-[9999] flex flex-col gap-2">
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

// ─── Mobile Bottom Nav ────────────────────────────────────────
interface BottomNavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const clientBottomNav: BottomNavItem[] = [
  { label: 'Home',      path: '/client/dashboard',     icon: <LayoutDashboard size={22} /> },
  { label: 'Documents', path: '/client/documents',     icon: <FileText size={22} /> },
  { label: 'New Doc',   path: '/client/documents/new', icon: <FilePlus size={22} /> },
  { label: 'Summarize', path: '/client/summarize',     icon: <BookOpen size={22} /> },
];

const lawyerBottomNav: BottomNavItem[] = [
  { label: 'Home',   path: '/lawyer/dashboard', icon: <LayoutDashboard size={22} /> },
  { label: 'Queue',  path: '/lawyer/queue',     icon: <ClipboardList size={22} /> },
  { label: 'Search', path: '/lawyer/search',    icon: <Search size={22} /> },
  { label: 'Docs',   path: '/lawyer/library',   icon: <FileText size={22} /> },
];

const MobileBottomNav: React.FC<{ role: string }> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = role === 'lawyer' ? lawyerBottomNav : clientBottomNav;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-800
      border-t border-border dark:border-slate-700 animate-slide-up flex-shrink-0">
      <div className="flex items-stretch">
        {items.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/client/dashboard' && item.path !== '/lawyer/dashboard' &&
              location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 relative
                transition-colors duration-200
                ${isActive
                  ? 'text-navy dark:text-blue-300'
                  : 'text-muted-text dark:text-slate-500 hover:text-navy dark:hover:text-blue-300'
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5
                  bg-gold rounded-full" />
              )}
              {item.icon}
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// ─── Layout ───────────────────────────────────────────────────
interface LayoutProps {
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ requireAuth = true }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const page = pathParts[pathParts.length - 1] || 'home';
    document.title = `${page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, ' ')} | JurisAI`;
    // Close mobile sidebar on route change
    setMobileSidebarOpen(false);
  }, [location]);

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen bg-surface-gray dark:bg-slate-900">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 page-enter overflow-y-auto pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {user && <MobileBottomNav role={user.role} />}

      <ToastContainer />
    </div>
  );
};

export default Layout;
