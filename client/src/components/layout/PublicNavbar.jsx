import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import Button from '../ui/Button';
import './PublicNavbar.css';

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : '/app';

  return (
    <nav className="public-nav">
      <div className="public-nav-inner">
        <Link to="/" className="public-nav-brand">
          <Scissors size={22} />
          <span>AzCuts</span>
        </Link>

        <div className={`public-nav-links ${mobileOpen ? 'public-nav-links--open' : ''}`}>
          <a href="#services" onClick={() => setMobileOpen(false)}>Services</a>
          <a href="#about" onClick={() => setMobileOpen(false)}>About</a>
          <a href="#contact" onClick={() => setMobileOpen(false)}>Contact</a>
          <a href="#location" onClick={() => setMobileOpen(false)}>Location</a>
        </div>

        <div className="public-nav-actions">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button size="sm" onClick={() => navigate(dashboardPath)}>Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Register</Button>
            </>
          )}
          <button className="public-nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
