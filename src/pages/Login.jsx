import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  UserCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  LogOut,
  Hash,
  GraduationCap,
  Building,
  Check,
  Compass,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS, ACADEMIC_YEARS, HOBBIES } from '../data/hobbies';
import AppLogo from '../components/AppLogo';

export default function Login() {
  const navigate = useNavigate();
  const { currentUser, students, loginAsUser, logoutToGuest, addStudent } = useApp();

  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register'
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [identifier, setIdentifier] = useState(currentUser.isGuest ? '' : currentUser.email || currentUser.rollNumber || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    password: '',
    department: 'Computer Science & Engineering',
    year: '2nd Year',
    hostel: 'Ganga Hostel',
    hobbies: ['Coding', 'Photography'],
    goal: 'Friendship',
  });

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter your Student Roll Number or Name.');
      return;
    }
    if (!password.trim()) {
      toast.error('Please enter your account password.');
      return;
    }

    // Match existing student
    const matched = students.find(
      (s) =>
        (s.email && s.email.toLowerCase() === identifier.trim().toLowerCase()) ||
        (s.rollNumber && s.rollNumber.toLowerCase() === identifier.trim().toLowerCase()) ||
        s.name.toLowerCase() === identifier.trim().toLowerCase()
    );

    if (matched) {
      if (matched.password && matched.password !== password.trim()) {
        toast.error('Incorrect password. Please try again.');
        return;
      }
      const userToLogin = matched.password ? matched : { ...matched, password: password.trim() };
      loginAsUser(userToLogin);
      toast.success(`Welcome back, ${matched.name}!`);
      navigate('/discover');
    } else {
      toast.error('Student account not found. Please verify your credentials or register a profile below.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!registerData.name.trim() || registerData.name.trim().length < 2) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!registerData.password || registerData.password.trim().length < 4) {
      toast.error('Please choose a password with at least 4 characters.');
      return;
    }

    const created = addStudent(
      {
        name: registerData.name.trim(),
        department: registerData.department,
        year: registerData.year,
        rollNumber: registerData.rollNumber.trim() || `AP241100${Math.floor(1000 + Math.random() * 9000)}`,
        email: registerData.email.trim() || `${registerData.name.toLowerCase().replace(/\s+/g, '_')}@srmap.edu.in`,
        password: registerData.password.trim(),
        hostel: registerData.hostel,
        bio: `SRM AP student enthusiastic about ${registerData.hobbies.join(', ')}. Looking to connect with peers!`,
        hobbies: registerData.hobbies,
        goal: registerData.goal,
        favouriteActivities: ['Campus photowalks', 'Coding in innovation lounge', 'Library study sessions'],
        isVerified: true,
      },
      true // set as active user
    );

    toast.success(`Student profile created for ${created.name}!`);
    navigate('/discover');
  };

  const toggleRegisterHobby = (hobbyName) => {
    setRegisterData((prev) => {
      const exists = prev.hobbies.includes(hobbyName);
      if (exists && prev.hobbies.length <= 1) {
        toast.error('Select at least 1 hobby.');
        return prev;
      }
      return {
        ...prev,
        hobbies: exists
          ? prev.hobbies.filter((h) => h !== hobbyName)
          : [...prev.hobbies, hobbyName],
      };
    });
  };

  const handleDemoSignIn = (student) => {
    loginAsUser(student);
    toast.success(`Switched active profile to ${student.name}`);
    navigate('/discover');
  };

  return (
    <div className="login-page-wrap">
      <div
        className="bg-blob"
        style={{ width: 320, height: 320, background: '#B9A3E8', top: -40, left: '10%' }}
      />
      <div
        className="bg-blob"
        style={{ width: 280, height: 280, background: '#A8DDC8', bottom: 20, right: '10%' }}
      />

      <div className="container">
        <motion.div
          className="login-card-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="login-card-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <span className="brand-mark" style={{ width: 48, height: 48, borderRadius: 16 }}>
                <AppLogo size={32} />
              </span>
            </div>
            <span className="login-badge-pill">
              <ShieldCheck size={16} /> Official Bondr • SRM AP Student Portal
            </span>
            <h1 className="login-title">Campus Single Sign-On</h1>
            <p className="login-subtitle">
              Access hobby discovery, direct peer messaging, and campus study circles across SRM University-AP.
            </p>
          </div>

          <div className="login-body">
            {/* If currently signed in */}
            {!currentUser.isGuest && (
              <div
                style={{
                  background: 'var(--color-lavender-soft)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-deep-purple)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Active Campus Session
                  </span>
                  <h3 style={{ margin: '2px 0', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                    {currentUser.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {currentUser.rollNumber ? `ID: ${currentUser.rollNumber} • ` : ''}
                    {currentUser.department}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      logoutToGuest();
                      navigate('/');
                    }}
                  >
                    <LogOut size={14} /> Switch / Logout
                  </button>
                  <Link to="/discover" className="btn btn-primary btn-sm">
                    Discover Friends <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* Tab Buttons */}
            <div className="login-tabs-row" role="tablist">
              <button
                type="button"
                className={`login-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
                onClick={() => setActiveTab('signin')}
              >
                <UserCheck size={16} /> Student Sign In
              </button>
              <button
                type="button"
                className={`login-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                <GraduationCap size={16} /> Register New Student
              </button>
            </div>

            {/* SIGN IN FORM */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn}>
                <div className="form-field">
                  <label htmlFor="signin-id" className="form-label">
                    Student Roll Number or Full Name
                  </label>
                  <div className="input-with-icon-wrap">
                    <Hash size={18} className="input-icon" />
                    <input
                      id="signin-id"
                      type="text"
                      className="form-input"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. AP25110011325 or Bharath"
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="signin-password" className="form-label">
                    NetID Password / PIN
                  </label>
                  <div className="input-with-icon-wrap">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter student password or 6-digit PIN"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="login-options-row">
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: 'var(--color-deep-purple)' }}
                    />
                    <span>Keep me logged in on this device</span>
                  </label>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-xs)' }}
                    onClick={() => toast('Please contact SRM AP NetID Administrator to reset your student password.', { icon: 'ℹ️' })}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  <ShieldCheck size={18} /> Authenticate &amp; Continue
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister}>
                <div className="form-field">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="e.g. Varun Teja"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Student Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={registerData.rollNumber}
                    onChange={(e) => setRegisterData({ ...registerData, rollNumber: e.target.value })}
                    placeholder="e.g. AP25110011325"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Account Password *</label>
                  <div className="input-with-icon-wrap">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="Create a password (min. 4 characters)..."
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={registerData.department}
                      onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })}
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Academic Year</label>
                    <select
                      className="form-select"
                      value={registerData.year}
                      onChange={(e) => setRegisterData({ ...registerData, year: e.target.value })}
                    >
                      {ACADEMIC_YEARS.map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Campus Residence / Hostel</label>
                  <select
                    className="form-select"
                    value={registerData.hostel}
                    onChange={(e) => setRegisterData({ ...registerData, hostel: e.target.value })}
                  >
                    <option value="Ganga Hostel">Ganga Hostel (Girls)</option>
                    <option value="Yamuna Hostel">Yamuna Hostel (Girls)</option>
                    <option value="Narmada Hostel">Narmada Hostel (Boys)</option>
                    <option value="Brahmaputra Hostel">Brahmaputra Hostel (Boys)</option>
                    <option value="Godavari Hostel">Godavari Hostel (Boys)</option>
                    <option value="Day Scholar">Day Scholar (Local / Commuter)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Select Core Hobbies ({registerData.hobbies.length})</label>
                  <div className="hobby-selector-grid" style={{ marginBottom: 16 }}>
                    {HOBBIES.slice(0, 10).map((h) => {
                      const selected = registerData.hobbies.includes(h.name);
                      return (
                        <button
                          key={h.id}
                          type="button"
                          className={`hobby-choice-chip ${selected ? 'selected' : ''}`}
                          onClick={() => toggleRegisterHobby(h.name)}
                        >
                          {selected && <Check size={13} />}
                          {h.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  <UserCheck size={18} /> Register Student Profile
                </button>
              </form>
            )}

            {/* One-Click Quick Student Access Section (Only when profiles exist) */}
            {students && students.length > 0 && (
              <div className="login-demo-section">
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  Registered Campus Profiles
                </span>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-body)', margin: '4px 0 10px' }}>
                  Quickly switch active student profile:
                </p>
                <div className="demo-grid-list">
                  {students.map((stu) => (
                    <button
                      key={stu.id}
                      type="button"
                      className="demo-user-card-btn"
                      onClick={() => handleDemoSignIn(stu)}
                    >
                      {stu.image ? (
                        <img
                          src={stu.image}
                          alt={stu.name}
                          className="demo-user-avatar"
                          onError={(e) => {
                            if (stu.fallbackImage && e.currentTarget.src !== stu.fallbackImage) {
                              e.currentTarget.src = stu.fallbackImage;
                            }
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #30245F 0%, #6350A5 100%)',
                            color: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            flexShrink: 0,
                          }}
                        >
                          {(stu.name || 'S').trim().charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <strong style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {stu.name}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {stu.department.split('&')[0]} • {stu.goal}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
