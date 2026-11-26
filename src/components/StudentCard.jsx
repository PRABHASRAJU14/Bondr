import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Clock, CheckCircle2, Sparkles, Compass, Eye } from 'lucide-react';
import { getHobbyStyle } from '../data/hobbies';
import { useApp } from '../context/AppContext';

export default function StudentCard({ student, index = 0, disableMotion = false }) {
  const { currentUser, getConnectionStatus, sendConnectionRequest, cancelConnectionRequest, acceptConnectionRequest } = useApp();
  const status = getConnectionStatus(student.id);
  const isOwnProfile = currentUser && !currentUser.isGuest && currentUser.id === student.id;
  const sharedSet = new Set((student.sharedInterests || []).map((h) => h.toLowerCase()));

  const cardContent = (
    <>
      <div className="student-card-media">
        {student.image ? (
          <img
            src={student.image}
            alt={`${student.name} — ${student.department}`}
            loading="lazy"
            onError={(e) => {
              if (student.fallbackImage && e.currentTarget.src !== student.fallbackImage) {
                e.currentTarget.src = student.fallbackImage;
              }
            }}
          />
        ) : (
          <div className="student-card-initial-avatar">
            <span className="initial-letter">
              {(student.name || 'S').trim().charAt(0).toUpperCase()}
            </span>
            <span className="initial-watermark">
              {(student.name || 'SRM AP Student').trim()}
            </span>
          </div>
        )}
        {student.isPreview || student.id === 'preview-student' ? (
          <span className="student-shared-badge has-match">
            <Sparkles size={13} />
            {student.hobbies?.length || 0}{' '}
            {(student.hobbies?.length || 0) === 1 ? 'Selected Hobby' : 'Selected Hobbies'}
          </span>
        ) : (
          <span className={`student-shared-badge ${student.sharedCount > 0 ? 'has-match' : ''}`}>
            <Sparkles size={13} />
            {student.sharedCount}{' '}
            {student.sharedCount === 1 ? 'Shared Interest' : 'Shared Interests'}
          </span>
        )}
        <span className="student-year-pill">{student.year}</span>
      </div>

      <div className="student-card-body">
        <div className="student-card-header">
          <div>
            <h3 className="student-card-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {student.name}
              <CheckCircle2 size={16} color="#3B82F6" title="Verified SRM AP Student" />
            </h3>
            {student.headline && (
              <p style={{ fontSize: '0.78rem', color: 'var(--color-deep-purple)', fontWeight: 600, margin: '2px 0 4px', lineHeight: 1.3 }}>
                {student.headline}
              </p>
            )}
            <p className="student-card-dept">{student.department}</p>
          </div>
        </div>

        <span className="student-goal-tag">
          <Compass size={13} />
          {student.goal}
        </span>

        <p className="student-card-bio">{student.bio}</p>

        <div className="student-hobbies-list" aria-label="Hobbies">
          {(student.hobbies || []).map((hobby) => {
            const { bgTint } = getHobbyStyle(hobby);
            const isShared =
              student.isPreview ||
              student.id === 'preview-student' ||
              sharedSet.has(hobby.toLowerCase());
            return (
              <span
                key={hobby}
                className={`hobby-tag ${isShared ? 'shared' : ''}`}
                style={{ backgroundColor: bgTint }}
                title={
                  isShared
                    ? student.isPreview
                      ? 'Selected hobby'
                      : 'Shared interest with your profile'
                    : hobby
                }
              >
                {hobby}
              </span>
            );
          })}
        </div>
      </div>

      <div className="student-card-footer">
        <Link to={`/student/${student.id}`} className="btn btn-secondary btn-sm">
          <Eye size={15} />
          View Profile
        </Link>

        {isOwnProfile || status === 'self' ? (
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--color-deep-purple)',
              background: 'var(--color-lavender-soft)',
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid rgba(185, 163, 232, 0.4)',
            }}
          >
            Your Profile
          </span>
        ) : status === 'accepted' ? (
          <Link to={`/messages/${student.id}`} className="btn btn-mint btn-sm" title="Chat directly in Messages">
            <CheckCircle2 size={15} />
            Connected • Chat
          </Link>
        ) : status === 'sent' ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => cancelConnectionRequest(student.id, student.name)}
            title="Request Sent — Click to cancel"
            style={{
              color: 'var(--color-deep-purple)',
              background: 'var(--color-lavender-soft)',
              borderColor: 'rgba(185, 163, 232, 0.6)',
              fontWeight: 600,
            }}
          >
            <Clock size={14} />
            Requested
          </button>
        ) : status === 'received' ? (
          <button
            type="button"
            className="btn btn-mint btn-sm"
            onClick={() => acceptConnectionRequest(student.id, student.name)}
            title="Accept incoming request"
          >
            <CheckCircle2 size={14} />
            Accept Request
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => sendConnectionRequest(student)}
          >
            <UserPlus size={15} />
            Connect
          </button>
        )}
      </div>
    </>
  );

  if (disableMotion) {
    return <article className="student-card">{cardContent}</article>;
  }

  return (
    <motion.article
      className="student-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.42, delay: Math.min(index * 0.05, 0.35), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      {cardContent}
    </motion.article>
  );
}
