import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  LogOut,
  UserCheck,
  ShieldCheck,
  Mail,
  Hash,
  GraduationCap,
  Building,
  User,
  ArrowRight,
  Edit3,
  Lock,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS, ACADEMIC_YEARS, HOBBIES, CONNECTION_GOALS } from '../data/hobbies';
import AppLogo from './AppLogo';

export default function LoginModal({ isOpen, onClose }) {
  const { currentUser, students, loginAsUser, logoutToGuest, updateUserProfile, deleteStudentProfile, addStudent } = useApp();
  const navigate = useNavigate();

  // If logged in: optional edit mode
  const [confirmDelete, setConfirmDelete] = useState(false);

  // If guest: login / signup form state
  const [authTab, setAuthTab] = useState('signin'); // 'signin' | 'register'
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('2nd Year');
  const [hostel, setHostel] = useState('Ganga Hostel (Girls)');
  const [bio, setBio] = useState('');
  const [registerHobbies, setRegisterHobbies] = useState(['Photography', 'Coding']);
  const [registerGoal, setRegisterGoal] = useState('Friendship');

  const toggleModalHobby = (hobbyName) => {
    setRegisterHobbies((prev) => {
      const exists = prev.includes(hobbyName);
      if (exists && prev.length <= 1) {
        toast.error('Select at least 1 hobby.');
        return prev;
      }
      return exists ? prev.filter((h) => h !== hobbyName) : [...prev, hobbyName];
    });
  };

  if (!isOpen) return null;

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    if (!loginId.trim()) {
      toast.error('Please enter your Student Roll Number or Name.');
      return;
    }
    if (!loginPassword.trim()) {
      toast.error('Please enter your account password.');
      return;
    }

    const safeStudents = Array.isArray(students) ? students : [];
    const matched = safeStudents.find(
      (s) =>
        (s.rollNumber && s.rollNumber.toLowerCase() === loginId.trim().toLowerCase()) ||
        (s.email && s.email.toLowerCase() === loginId.trim().toLowerCase()) ||
        s.name.toLowerCase() === loginId.trim().toLowerCase()
    );

    if (!matched) {
      toast.error('Student profile not found. Please switch to Create Account or check your details.');
      return;
    }

    if (matched.password && matched.password !== loginPassword.trim()) {
      toast.error('Incorrect password. Please try again.');
      return;
    }

    const userWithPassword = matched.password ? matched : { ...matched, password: loginPassword.trim() };
    loginAsUser(userWithPassword);
    toast.success(`Welcome back, ${matched.name}!`);
    onClose();
  };

  const handleGuestRegister = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!registerPassword.trim() || registerPassword.trim().length < 4) {
      toast.error('Please choose a password with at least 4 characters.');
      return;
    }

    const cleanEmail = email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '_')}@srmap.edu.in`;
    const cleanRoll = rollNumber.trim() || 'AP25110010045';

    const created = addStudent(
      {
        name: name.trim(),
        email: cleanEmail,
        rollNumber: cleanRoll,
        password: registerPassword.trim(),
        department,
        year,
        hostel,
        hobbies: registerHobbies.length > 0 ? registerHobbies : ['Photography', 'Coding'],
        goal: registerGoal || 'Friendship',
        image: null,
        bio: bio.trim(),
        aboutMe: bio.trim(),
        favouriteActivities: ['Meeting students with shared interests', 'Campus club projects'],
        isVerifiedStudent: true,
      },
      true
    );

    toast.success(`Welcome to Bondr, ${created.name}! Your profile is live.`);
    onClose();
    navigate('/discover');
  };

  const initialLetter = (currentUser.name || 'S').trim().charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: 520,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 24,
            padding: 0,
            overflow: 'hidden',
          }}
        >
          {/* Header - Pinned at top */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px 14px',
              borderBottom: '1px solid var(--border-subtle)',
              background: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="brand-mark" style={{ width: 36, height: 36, padding: 3, borderRadius: 12 }}>
                <AppLogo size={30} />
              </span>
              <div>
                <h2 id="login-modal-title" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {!currentUser.isGuest ? 'Your Bondr Profile' : 'Bondr'}
                </h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {!currentUser.isGuest ? 'Verified Active Session • SRM AP' : 'SRM University-AP • Student Portal'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(239, 234, 249, 0.7)',
                border: '1px solid rgba(185, 163, 232, 0.4)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* VIEW 1: USER IS ALREADY LOGGED IN -> ONLY SHOW PROFILE & LOGOUT */}
          {!currentUser.isGuest ? (
            <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flex: 1 }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 234, 249, 0.65) 0%, rgba(246, 213, 229, 0.35) 100%)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 20,
                  padding: '22px 20px',
                  marginBottom: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* User avatar + name row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {currentUser.image ? (
                    <img
                      src={currentUser.image}
                      alt={currentUser.name}
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: 20,
                        objectFit: 'cover',
                        boxShadow: '0 8px 18px rgba(48, 36, 95, 0.15)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: 20,
                        background: 'linear-gradient(135deg, #30245F 0%, #4E3C8E 50%, #7B68BA 100%)',
                        color: '#FFFFFF',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        boxShadow: '0 8px 20px rgba(48, 36, 95, 0.22)',
                        flexShrink: 0,
                      }}
                    >
                      {initialLetter}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {currentUser.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: 'rgba(59, 130, 246, 0.12)',
                          color: '#2563EB',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <ShieldCheck size={12} /> Verified
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {currentUser.department} • {currentUser.year}
                    </p>
                    {currentUser.rollNumber && (
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--color-deep-purple)', fontWeight: 600 }}>
                        Student ID: {currentUser.rollNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 14,
                      padding: '10px 14px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Residence
                    </span>
                    <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      {currentUser.hostel || 'Hostel Campus'}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 14,
                      padding: '10px 14px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Campus Email
                    </span>
                    <strong
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {currentUser.email || 'student@srmap.edu.in'}
                    </strong>
                  </div>
                </div>

                {/* Bio & Hobbies */}
                {currentUser.bio && (
                  <div style={{ background: '#FFFFFF', borderRadius: 14, padding: '12px 14px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                      Short Bio
                    </span>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {currentUser.bio}
                    </p>
                  </div>
                )}

                {/* Interests chips */}
                {currentUser.hobbies && currentUser.hobbies.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                      Selected Interests ({currentUser.hobbies.length})
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {currentUser.hobbies.map((h) => (
                        <span
                          key={h}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: '#FFFFFF',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: 'var(--color-deep-purple)',
                          }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: View Profile, Edit, Log Out, Delete Profile */}
              {confirmDelete ? (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 14,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#DC2626', fontWeight: 700 }}>
                    ⚠️ Delete your student profile permanently?
                  </p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#991B1B' }}>
                    This will delete your account, remove your card from Discover, cancel your connections, and log you out.
                  </p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs"
                      style={{
                        background: '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        deleteStudentProfile(currentUser.id);
                        onClose();
                      }}
                    >
                      Yes, Delete Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        logoutToGuest();
                        onClose();
                        navigate('/');
                      }}
                      style={{ color: '#4B5563' }}
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setConfirmDelete(true)}
                      style={{
                        color: '#DC2626',
                        borderColor: 'rgba(220, 38, 38, 0.25)',
                        background: 'rgba(254, 242, 242, 0.8)',
                      }}
                      title="Permanently delete your profile"
                    >
                      <Trash2 size={14} /> Delete Profile
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        onClose();
                        navigate('/add-student');
                      }}
                    >
                      <Edit3 size={14} /> Edit Profile
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onClose();
                        navigate(`/student/${currentUser.id}`);
                      }}
                    >
                      <User size={15} /> View Full Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* VIEW 2: USER IS GUEST -> SHOW LOGIN TABS & FORMS */
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ padding: '16px 24px 8px', background: '#FFFFFF', flexShrink: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    background: 'rgba(239, 234, 249, 0.6)',
                    borderRadius: 12,
                    padding: 4,
                    gap: 4,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setAuthTab('signin')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 9,
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      background: authTab === 'signin' ? '#FFFFFF' : 'transparent',
                      color: authTab === 'signin' ? 'var(--color-deep-purple)' : 'var(--text-muted)',
                      boxShadow: authTab === 'signin' ? '0 2px 8px rgba(48, 36, 95, 0.08)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <UserCheck size={14} style={{ display: 'inline', marginRight: 6 }} /> Student Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab('register')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 9,
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      background: authTab === 'register' ? '#FFFFFF' : 'transparent',
                      color: authTab === 'register' ? 'var(--color-deep-purple)' : 'var(--text-muted)',
                      boxShadow: authTab === 'register' ? '0 2px 8px rgba(48, 36, 95, 0.08)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <GraduationCap size={14} style={{ display: 'inline', marginRight: 6 }} /> Create Profile
                  </button>
                </div>
              </div>

              <div style={{ padding: '12px 24px 24px', overflowY: 'auto', flex: 1 }}>

              {authTab === 'signin' ? (
                <form onSubmit={handleSignInSubmit}>
                  <div className="form-field">
                    <label htmlFor="login-id" className="form-label">Student Roll Number or Full Name</label>
                    <input
                      id="login-id"
                      type="text"
                      className="form-input"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="e.g. AP25110011325 or Bharath"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="login-pass" className="form-label">Account Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="login-pass"
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your account password..."
                        style={{ paddingRight: 40 }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <UserCheck size={16} /> Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleGuestRegister}>
                  <div className="form-field">
                    <label htmlFor="reg-name" className="form-label">Full Name *</label>
                    <input
                      id="reg-name"
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bharath Reddy"
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label htmlFor="reg-roll" className="form-label">
                        <Hash size={13} style={{ display: 'inline' }} /> Roll Number
                      </label>
                      <input
                        id="reg-roll"
                        type="text"
                        className="form-input"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="e.g. AP25110011325"
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="reg-pass" className="form-label">Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="reg-pass"
                          type={showPassword ? 'text' : 'password'}
                          className="form-input"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          placeholder="Min. 4 characters"
                          style={{ paddingRight: 36 }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label htmlFor="reg-dept" className="form-label">Department</label>
                      <select
                        id="reg-dept"
                        className="form-select"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="reg-year" className="form-label">Academic Year</label>
                      <select
                        id="reg-year"
                        className="form-select"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                      >
                        {ACADEMIC_YEARS.map((yr) => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="reg-hostel" className="form-label">Campus Residence / Hostel</label>
                    <select
                      id="reg-hostel"
                      className="form-select"
                      value={hostel}
                      onChange={(e) => setHostel(e.target.value)}
                    >
                      <option value="Ganga Hostel (Girls)">Ganga Hostel (Girls)</option>
                      <option value="Yamuna Hostel (Girls)">Yamuna Hostel (Girls)</option>
                      <option value="Narmada Hostel (Boys)">Narmada Hostel (Boys)</option>
                      <option value="Brahmaputra Hostel (Boys)">Brahmaputra Hostel (Boys)</option>
                      <option value="Godavari Hostel (Boys)">Godavari Hostel (Boys)</option>
                      <option value="Day Scholar (Commuter)">Day Scholar (Local / Commuter)</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="reg-goal" className="form-label">Connection Goal</label>
                    <select
                      id="reg-goal"
                      className="form-select"
                      value={registerGoal}
                      onChange={(e) => setRegisterGoal(e.target.value)}
                    >
                      <option value="Friendship">Friendship</option>
                      <option value="Study Partner">Study Partner</option>
                      <option value="Project Partner">Project Partner</option>
                      <option value="Social Hangout">Social Hangout</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Core Hobbies ({registerHobbies.length} selected)</label>
                    <span className="form-hint" style={{ marginBottom: 8, display: 'block' }}>
                      Tap to select hobbies you want to share with peers:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {HOBBIES.slice(0, 10).map((h) => {
                        const isSelected = registerHobbies.includes(h.name);
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => toggleModalHobby(h.name)}
                            style={{
                              padding: '5px 11px',
                              borderRadius: 999,
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: isSelected ? '1.5px solid var(--color-deep-purple)' : '1px solid var(--border-subtle)',
                              background: isSelected ? 'var(--color-lavender-soft)' : '#FFFFFF',
                              color: isSelected ? 'var(--color-deep-purple)' : 'var(--text-secondary)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {h.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="reg-bio" className="form-label">
                      Short Bio <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <textarea
                      id="reg-bio"
                      className="form-textarea"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share a few words about what you love doing at SRM AP (optional)..."
                      rows={2}
                      style={{ minHeight: 60 }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ minWidth: 170 }}>
                      <UserCheck size={16} /> Create Profile &amp; Sign In
                    </button>
                  </div>
                </form>
              )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
