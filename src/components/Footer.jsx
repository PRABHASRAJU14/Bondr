import { Link } from 'react-router-dom';
import { Sparkles, HeartHandshake } from 'lucide-react';
import AppLogo from './AppLogo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand-logo" style={{ cursor: 'default' }}>
              <span className="brand-mark">
                <AppLogo size={36} />
              </span>
              <span className="brand-text-group">
                <span>Bondr</span>
                <span className="brand-sub">SRM University-AP</span>
              </span>
            </div>
            <p>
              Find your people. Share your passions. Build real connections across SRM University-AP
              through shared hobbies, study goals, and creative collaborations.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/discover">Discover Friends</Link></li>
              <li><Link to="/hobbies">Explore Hobbies</Link></li>
              <li><Link to="/add-student">Create Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Community</h4>
            <ul className="footer-links">
              <li><Link to="/connections">My Connections</Link></li>
              <li><Link to="/messages">Campus Chats</Link></li>
              <li><Link to="/discover?goal=Study+Partner">Study Partners</Link></li>
              <li><Link to="/discover?goal=Project+Partner">Project Partners</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Bondr – SRM AP.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <HeartHandshake size={15} /> Built for hobby-first student friendships
          </span>
        </div>
      </div>
    </footer>
  );
}
