import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar, { MobileSidebar } from './Sidebar';
import Topbar from './Topbar';
import './DashboardShell.css';

export default function DashboardShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Sidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="dashboard-main">
        <Topbar onMenuOpen={() => setMobileOpen(true)} />
        <main id="main-content" className="dashboard-content" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
