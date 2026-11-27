import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  GraduationCap,
  Calendar,
  Compass,
  Sparkles,
  UserPlus,
  Clock,
  CheckCircle2,
  Heart,
  Star,
  MessageCircle,
  Mail,
  Hash,
  Award,
  ShieldCheck,
  Building,
  Edit3,
  Save,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getHobbyStyle } from '../data/hobbies';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    students,
    rankedStudents,
    currentUser,
    getConnectionStatus,
    sendConnectionRequest,
    acceptConnectionRequest,
    cancelConnectionRequest,
    updateUserProfile,
    deleteStudentProfile,
  } = useApp();

  const student =
    rankedStudents.find((s) => s.id === id) ||
    students.find((s) => s.id === id);

  const isOwnProfile = student && currentUser && currentUser.id === student.id;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!student) {
    return (
      <div className="container" style={{ padding: '80px 24px' }}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <Sparkles size={28} />
          </div>
          <h3>Student profile not found</h3>
          <p>This profile may have been removed or the link is incorrect.</p>
          <Link to="/discover" className="btn btn-primary">
            Back to Discover Friends
          </Link>
        </div>
      </div>
    );
  }

  const status = getConnectionStatus(student.id);
  const sharedInterests = student.sharedInterests || [];
  const sharedSet = new Set(sharedInterests.map((h) => h.toLowerCase()));

  return (
    <div className="container profile-page-wrap">
      <button
        type="button"
        className="profile-back-link"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="profile-layout">
        {/* Sidebar Card */}
        <motion.aside
          className="profile-sidebar-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="profile-photo-wrap">
            {student.image ? (
              <img
                src={student.image}
                alt={`${student.name} portrait`}
                onError={(e) => {
                  if (student.fallbackImage && e.currentTarget.src !== student.fallbackImage) {
                    e.currentTarget.src = student.fallbackImage;
                  }
                }}
              />
            ) : (
              <div className="profile-photo-initial-avatar">
                <span className="initial-letter">
                  {(student.name || 'S').trim().charAt(0).toUpperCase()}
                </span>
                <span className="initial-watermark">
                  {student.name}
                </span>
              </div>
            )}
          </div>

          <div className="profile-identity">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {student.name}
                <CheckCircle2 size={20} color="#3B82F6" title="Verified SRM AP Student" />
              </h1>
            </div>
            {student.headline && (
              <p style={{ color: 'var(--color-deep-purple)', fontSize: '0.84rem', fontWeight: 600, margin: '4px 0 6px', lineHeight: 1.35 }}>
                {student.headline}
              </p>
            )}
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              SRM University-AP Verified Student
            </p>
          </div>

          <div className="profile-meta-list">
            <div className="profile-meta-item">
              <GraduationCap size={18} />
              <span>{student.department}</span>
            </div>
            <div className="profile-meta-item">
              <Calendar size={18} />
              <span>{student.year}</span>
            </div>
            {student.rollNumber && (
              <div className="profile-meta-item">
                <Hash size={18} />
                <span>Roll: <strong>{student.rollNumber}</strong></span>
              </div>
            )}
            {student.email && (
              <div className="profile-meta-item">
                <Mail size={18} />
                <span style={{ wordBreak: 'break-all' }}>{student.email}</span>
              </div>
            )}
            {student.hostel && (
              <div className="profile-meta-item">
                <Building size={18} />
                <span>{student.hostel}</span>
              </div>
            )}
            {student.cgpa && (
              <div className="profile-meta-item">
                <Award size={18} />
                <span>Academic Record: <strong>{student.cgpa}</strong></span>
              </div>
            )}
            <div className="profile-meta-item">
              <Compass size={18} />
              <span>Looking for: <strong>{student.goal}</strong></span>
            </div>
          </div>

          <div className="profile-sidebar-actions">
            {isOwnProfile ? (
              <>
                <Link
                  to="/add-student"
                  className="btn btn-primary btn-lg"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </Link>
                <button
                  type="button"
                  className="btn btn-danger-soft btn-sm"
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    color: '#DC2626',
                    background: 'rgba(254, 242, 242, 0.9)',
                    borderColor: 'rgba(220, 38, 38, 0.3)',
                    marginTop: 6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontWeight: 600,
                  }}
                  title="Permanently remove your student profile from Bondr"
                >
                  <Trash2 size={15} /> Delete Profile
                </button>
              </>
            ) : status === 'accepted' ? (
              <>
                <Link to={`/messages/${student.id}`} className="btn btn-primary btn-lg">
                  <MessageCircle size={18} />
                  Chat with {student.name.split(' ')[0]}
                </Link>
                <Link to="/connections" className="btn btn-mint btn-sm">
                  <CheckCircle2 size={16} />
                  Connected! View Connections
                </Link>
              </>
            ) : status === 'received' ? (
              <>
                <button
                  type="button"
                  className="btn btn-mint btn-lg"
                  onClick={() => acceptConnectionRequest(student.id, student.name)}
                >
                  <CheckCircle2 size={18} />
                  Accept Connection Request
                </button>
                <button
                  type="button"
                  className="btn btn-danger-soft btn-sm"
                  onClick={() => cancelConnectionRequest(student.id, student.name)}
                >
                  Decline Invitation
                </button>
              </>
            ) : status === 'sent' || status === 'pending' ? (
              <>
                <button
                  type="button"
                  className="btn btn-pastel btn-lg"
                  disabled
                >
                  <Clock size={18} />
                  Request Sent
                </button>
                <button
                  type="button"
                  className="btn btn-danger-soft btn-sm"
                  onClick={() => cancelConnectionRequest(student.id, student.name)}
                >
                  Cancel Sent Request
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => sendConnectionRequest(student)}
              >
                <UserPlus size={18} />
                Connect with {student.name.split(' ')[0]}
              </button>
            )}

            <Link to="/discover" className="btn btn-secondary">
              Explore More Students
            </Link>
          </div>
        </motion.aside>

        {/* Main Details Column */}
        <motion.div
          className="profile-main-col"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          {/* Shared Interests Highlight */}
          <section className="profile-section-card profile-shared-box">
            <div className="profile-shared-header">
              <h2 style={{ margin: 0 }}>
                <Sparkles size={20} /> Shared Interests
              </h2>
              <span className="profile-shared-count-pill">
                {sharedInterests.length}{' '}
                {sharedInterests.length === 1 ? 'Shared Interest' : 'Shared Interests'}
              </span>
            </div>

            {sharedInterests.length > 0 ? (
              <>
                <p style={{ fontSize: 'var(--text-sm)', marginBottom: 14 }}>
                  You and {student.name.split(' ')[0]} both love these hobbies—great conversation starters!
                </p>
                <div className="profile-tags-wrap">
                  {sharedInterests.map((hobby) => (
                    <span
                      key={hobby}
                      className="profile-hobby-pill is-shared"
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <Star size={14} fill="#F9DFA0" color="#30245F" />
                      {hobby}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>
                No overlapping hobbies with your current profile yet—connect anyway to discover something new together!
              </p>
            )}
          </section>

          {/* About Me */}
          <section className="profile-section-card">
            <h2>
              <Heart size={20} /> About Me
            </h2>
            <p className="profile-about-text">
              {student.aboutMe?.trim() || student.bio?.trim() || (isOwnProfile
                ? "No bio added yet. Click 'Edit Profile' above to introduce yourself to your campus peers!"
                : `Hi! I'm ${student.name?.split(' ')[0] || 'a student'} at SRM University-AP. Connect with me to collaborate on projects, study, and share campus experiences!`
              )}
            </p>
          </section>

          {/* Campus Leadership & Academic Highlights */}
          {student.club && (
            <section className="profile-section-card">
              <h2>
                <ShieldCheck size={20} /> Campus &amp; Club Leadership
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', minWidth: 120 }}>
                    Active Societies:
                  </span>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    {student.club}
                  </strong>
                </div>
                {student.linkedin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', minWidth: 120 }}>
                      Portfolio / Web:
                    </span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {student.linkedin}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Hobbies & Interests */}
          <section className="profile-section-card">
            <h2>
              <Sparkles size={20} /> Hobbies &amp; Interests
            </h2>
            <div className="profile-tags-wrap">
              {student.hobbies.map((hobby) => {
                const { bgTint } = getHobbyStyle(hobby);
                const isShared = sharedSet.has(hobby.toLowerCase());
                return (
                  <Link
                    key={hobby}
                    to={`/discover?hobby=${encodeURIComponent(hobby)}`}
                    className={`profile-hobby-pill ${isShared ? 'is-shared' : ''}`}
                    style={{ backgroundColor: bgTint }}
                  >
                    {hobby}
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Favourite Activities */}
          <section className="profile-section-card">
            <h2>
              <Compass size={20} /> Favourite Campus Activities
            </h2>
            <div className="activities-grid">
              {(student.favouriteActivities && student.favouriteActivities.length > 0
                ? student.favouriteActivities
                : ['Exploring campus clubs', 'Meeting peers with similar interests']
              ).map((act) => (
                <div key={act} className="activity-item">
                  <CheckCircle2 size={17} color="#1F7A5C" style={{ flexShrink: 0 }} />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>

      {/* Delete Profile Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 9999, display: 'grid', placeItems: 'center' }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-card"
            style={{ maxWidth: 440, borderRadius: 24, padding: '28px 24px', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#DC2626',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Trash2 size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Delete Your Student Profile?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 24px' }}>
              Are you sure you want to permanently delete your profile? This will remove your student card from Discover, cancel all your connections, clear your direct messages, and log you out. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 20px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  deleteStudentProfile(student.id);
                  navigate('/');
                }}
              >
                Yes, Delete My Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
