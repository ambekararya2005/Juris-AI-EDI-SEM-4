import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, FilePlus, BookOpen, ShieldAlert, Settings,
  LogOut, ChevronLeft, ChevronRight, Scale, Search, Library,
  ClipboardList, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const clientNavItems: NavItem[] = [
  { label: 'Dashboard',     path: '/client/dashboard',     icon: <LayoutDashboard size={20} /> },
  { label: 'My Documents',  path: '/client/documents',     icon: <FileText size={20} /> },
  { label: 'New Document',  path: '/client/documents/new', icon: <FilePlus size={20} /> },
  { label: 'Summarize Doc', path: '/client/summarize',     icon: <BookOpen size={20} /> },
  { label: 'Contract Risk', path: '/client/risk',          icon: <ShieldAlert size={20} /> },
  { label: 'Settings',      path: '/settings',             icon: <Settings size={20} /> },
];

const lawyerNavItems: NavItem[] = [
  { label: 'Dashboard',      path: '/lawyer/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Review Queue',   path: '/lawyer/queue',     icon: <ClipboardList size={20} /> },
  { label: 'Case Law Search',path: '/lawyer/search',    icon: <Search size={20} /> },
  { label: 'Case Library',   path: '/lawyer/library',   icon: <Library size={20} /> },
  { label: 'Contract Risk',  path: '/lawyer/risk',      icon: <ShieldAlert size={20} /> },
  { label: 'Settings',       path: '/settings',         icon: <Settings size={20} /> },
];

interface SidebarProps {
  /** Mobile: controlled open/close */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NavItems: React.FC<{ collapsed: boolean; items: NavItem[] }> = ({ collapsed, items }) => (
  <nav className="flex-1 py-4 overflow-y-auto">
    {items.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        title={collapsed ? item.label : ''}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200
          ${isActive
            ? 'bg-white/10 border-l-4 border-gold text-white'
            : 'text-white/70 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
          }
          ${collapsed ? 'justify-center' : ''}`
        }
      >
        <span className="flex-shrink-0">{item.icon}</span>
        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
      </NavLink>
    ))}
  </nav>
);

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'lawyer' ? lawyerNavItems : clientNavItems;
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
    onMobileClose?.();
  };

  // ─── Shared inner content ─────────────────────────────────
  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 flex-shrink-0
        ${collapsed ? 'justify-center' : ''}`}>
        <Scale size={22} className="text-gold flex-shrink-0" />
        {!collapsed && (
          <span className="font-serif text-xl font-bold tracking-tight">
            Juris<span className="text-gold">AI</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <NavItems collapsed={collapsed} items={navItems} />

      {/* User + Logout */}
      <div className={`border-t border-white/10 p-4 flex-shrink-0 ${collapsed ? 'flex flex-col items-center gap-3' : ''}`}>
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center
              text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-white/60 capitalize flex items-center gap-1">
                {user.role}
                {user.role === 'lawyer' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                )}
              </p>
            </div>
          </div>
        )}
        {collapsed && user && (
          <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center
            text-white font-bold text-sm" title={user.name}>
            {initials}
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          className={`flex items-center gap-2 text-white/60 hover:text-white
            transition-colors text-sm ${collapsed ? '' : 'w-full'}`}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── DESKTOP sidebar (always visible lg+) ─────────────── */}
      <aside
        className={`relative hidden lg:flex flex-col bg-navy text-white transition-all duration-300
          ease-in-out min-h-screen flex-shrink-0
          ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <SidebarContent collapsed={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-navy border border-white/20
            rounded-full flex items-center justify-center text-white
            hover:bg-blue-brand transition-colors z-10"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ── MOBILE overlay sidebar ────────────────────────────── */}
      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-navy text-white z-50
          flex flex-col transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Close button */}
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10
            hover:bg-white/20 text-white transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        <SidebarContent collapsed={false} />
      </aside>
    </>
  );
};

export default Sidebar;
