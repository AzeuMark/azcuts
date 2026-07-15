import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Scissors, Calendar, Clock, Settings, Users, BarChart3, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const userLinks = [
  { to: '/app/book', label: 'Book', icon: Calendar },
  { to: '/app/history', label: 'History', icon: Clock },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

const staffLinks = [
  { to: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/staff/history', label: 'History', icon: Clock },
  { to: '/staff/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/inventory', label: 'Inventory', icon: Package },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/history/staff', label: 'Staff History', icon: Clock },
  { to: '/admin/history/users', label: 'User History', icon: Clock },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed }) {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'staff' ? staffLinks : userLinks;

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="sidebar-brand">
        <Scissors size={20} />
        {!collapsed && <span>AzCuts</span>}
      </div>
      <nav className="sidebar-nav" aria-label="Portal navigation">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}>
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }) {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'staff' ? staffLinks : userLinks;

  if (!open) return null;

  return (
    <>
      <div className="mobile-sidebar-overlay" onClick={onClose} />
      <aside className="mobile-sidebar" role="navigation" aria-label="Mobile navigation">
        <div className="sidebar-brand">
          <Scissors size={20} />
          <span>AzCuts</span>
        </div>
        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
