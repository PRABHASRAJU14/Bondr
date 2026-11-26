import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, UserCheck, LogIn, PlusCircle, LogOut, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import AppLogo from './AppLogo';

export default function Navbar({ onOpenLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, pendingConnections, unreadMessagesCount, logoutToGuest } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const pendingNotificationCount = pendingConnections?.length || 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header className={`navbar-wrapper ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <div className="brand-logo" role="banner" style={{ cursor: 'default' }} aria-label="Bondr SRM AP">
          <span className="brand-mark">
            <AppLogo size={38} />
          </span>
          <span className="brand-text-group">
            <span>Bondr</span>
            <span className="brand-sub">SRM University-AP</span>
          </span>
        </div>

        <nav className="nav-links" aria-label="Primary navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/discover" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Discover
          </NavLink>
          <NavLink to="/hobbies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Explore Hobbies
          </NavLink>
          <NavLink to="/connections" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Connections
            {pendingNotificationCount > 0 && <span className="nav-count-pill">{pendingNotificationCount}</span>}
          </NavLink>
          <NavLink to="/messages" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Messages
            {unreadMessagesCount > 0 && (
              <span className="nav-count-pill messages-badge">{unreadMessagesCount}</span>
            )}
          </NavLink>
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            onClick={onOpenLogin}
            className="nav-user-pill"
            title={currentUser.isGuest ? 'Sign in to Bondr • SRM AP' : 'View My Profile Summary'}
          >
            <span className="nav-user-avatar">
              {currentUser.image ? (
                <img src={currentUser.image} alt="" className="nav-user-avatar" />
              ) : !currentUser.isGuest ? (
                (currentUser.name || 'S').trim().charAt(0).toUpperCase()
              ) : (
                <User size={14} />
              )}
            </span>
            <span>{currentUser.isGuest ? 'Login' : currentUser.name.split(' ')[0]}</span>
            {!currentUser.isGuest ? <UserCheck size={14} /> : <LogIn size={14} />}
          </button>

          {currentUser.isGuest ? (
            <Link to="/add-student" className="btn btn-primary btn-sm">
              <PlusCircle size={15} />
              Get Started
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link to={`/student/${currentUser.id}`} className="btn btn-secondary btn-sm" title="View Full Profile Page">
                <User size={14} /> My Profile
              </Link>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  logoutToGuest();
                  navigate('/');
                }}
                title="Log out of session"
                style={{ padding: '6px 10px', color: '#DC2626' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/discover" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Discover Friends
            </NavLink>
            <NavLink to="/hobbies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Explore Hobbies
            </NavLink>
            <NavLink to="/connections" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Connections {pendingNotificationCount > 0 && `(${pendingNotificationCount})`}
            </NavLink>
            <NavLink to="/messages" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Messages &amp; Chat {unreadMessagesCount > 0 && `(${unreadMessagesCount})`}
            </NavLink>

            <div className="mobile-drawer-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenLogin();
                }}
              >
                <LogIn size={16} />
                {currentUser.isGuest ? 'Login to Bondr' : `Signed in: ${currentUser.name}`}
              </button>
              {currentUser.isGuest ? (
                <Link to="/add-student" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
                  <PlusCircle size={16} />
                  Get Started — Add Profile
                </Link>
              ) : (
                <Link to={`/student/${currentUser.id}`} className="btn btn-primary" onClick={() => setMobileOpen(false)}>
                  View &amp; Edit My Profile
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
