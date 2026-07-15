import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import './Topbar.css';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left" />
      <div className="topbar-right">
        <ThemeToggle />
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="topbar-user">
          <div className="topbar-avatar">
            <User size={16} />
          </div>
          <span className="topbar-username">{user?.fullName || 'User'}</span>
        </div>
        <button className="topbar-icon-btn" onClick={handleLogout} aria-label="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
