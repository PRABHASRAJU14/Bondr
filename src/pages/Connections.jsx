import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  Send,
  XCircle,
  Sparkles,
  Eye,
  Compass,
  MessageCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHobbyStyle } from '../data/hobbies';

export default function Connections({ onOpenLogin }) {
  const {
    students,
    rankedStudents,
    currentUser,
    connections,
    cancelConnectionRequest,
    acceptConnectionRequest,
    acceptDemoConnection,
    getUnreadCountForStudent,
  } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'accepted' | 'sent'

  const enrichedConnections = useMemo(() => {
    if (!currentUser || currentUser.isGuest) return [];

    const safeRanked = Array.isArray(rankedStudents) ? rankedStudents : [];
    const safeStudents = Array.isArray(students) ? students : [];
    const safeConnections = Array.isArray(connections) ? connections : [];

    const studentMap = new Map();
    safeStudents.forEach((s) => s?.id && studentMap.set(s.id, s));
    safeRanked.forEach((s) => s?.id && studentMap.set(s.id, s));

    const list = [];
    for (const conn of safeConnections) {
      if (!conn) continue;

      let otherId = null;
      let isSentByMe = false;
      let isReceivedByMe = false;

      if (conn.fromUserId && conn.toUserId) {
        if (conn.fromUserId === conn.toUserId) continue; // Skip self connections
        if (conn.fromUserId === currentUser.id) {
          otherId = conn.toUserId;
          isSentByMe = true;
        } else if (conn.toUserId === currentUser.id) {
          otherId = conn.fromUserId;
          isReceivedByMe = true;
        } else {
          // Connection belongs to other users entirely — hide from my connections
          continue;
        }
      } else if (conn.studentId) {
        // Legacy fallback
        if (conn.studentId === currentUser.id) continue;
        otherId = conn.studentId;
        isSentByMe = conn.direction !== 'received';
        isReceivedByMe = conn.direction === 'received';
      }

      if (!otherId || otherId === currentUser.id) continue;
      const student = studentMap.get(otherId);
      if (!student) continue;

      list.push({
        ...conn,
        student,
        isSentByMe,
        isReceivedByMe,
        direction: isSentByMe ? 'sent' : 'received',
      });
    }

    return list;
  }, [connections, rankedStudents, students, currentUser]);

  const pendingList = enrichedConnections.filter((c) => c.status === 'pending' && c.isReceivedByMe);
  const acceptedList = enrichedConnections.filter((c) => c.status === 'accepted');
  const sentList = enrichedConnections.filter((c) => c.status === 'pending' && c.isSentByMe);

  const visibleList = useMemo(() => {
    if (activeTab === 'pending') return pendingList;
    if (activeTab === 'accepted') return acceptedList;
    if (activeTab === 'sent') return sentList;
    return enrichedConnections;
  }, [activeTab, enrichedConnections, pendingList, acceptedList, sentList]);

  return (
    <div>
      <section className="page-hero">
        <div
          className="bg-blob"
          style={{ width: 260, height: 260, background: '#F6D5E5', top: -60, right: 50 }}
        />
        <div className="container page-hero-inner">
          <span className="section-eyebrow">
            <Send size={14} /> Connection Hub
          </span>
          <h1 className="page-hero-title">My Connections</h1>
          <p className="page-hero-subtitle">
            Track your sent connection requests, pending invitations, and accepted campus friends at SRM AP.
          </p>
        </div>
      </section>

      <div className="container connections-page-body">
        {/* Summary Stats */}
        <div className="connections-stats-row">
          <div className="conn-stat-card">
            <span className="conn-stat-icon" style={{ backgroundColor: 'var(--color-lavender-soft)' }}>
              <Send size={22} />
            </span>
            <div>
              <strong>{sentList.length}</strong>
              <span>Sent Requests</span>
            </div>
          </div>

          <div className="conn-stat-card">
            <span className="conn-stat-icon" style={{ backgroundColor: 'var(--status-warning-bg)' }}>
              <Clock size={22} />
            </span>
            <div>
              <strong>{pendingList.length}</strong>
              <span>Pending Invitations</span>
            </div>
          </div>

          <div className="conn-stat-card">
            <span className="conn-stat-icon" style={{ backgroundColor: 'var(--status-success-bg)' }}>
              <CheckCircle2 size={22} />
            </span>
            <div>
              <strong>{acceptedList.length}</strong>
              <span>Accepted Connections</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="connections-tabs" role="tablist" aria-label="Filter connections by status">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`conn-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Activity <span className="conn-tab-count">{enrichedConnections.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pending'}
            className={`conn-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Invitations <span className="conn-tab-count">{pendingList.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'accepted'}
            className={`conn-tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
            onClick={() => setActiveTab('accepted')}
          >
            Accepted <span className="conn-tab-count">{acceptedList.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sent'}
            className={`conn-tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent Requests <span className="conn-tab-count">{sentList.length}</span>
          </button>
        </div>

        {/* Connections List */}
        {currentUser && currentUser.isGuest ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Compass size={28} />
            </div>
            <h3>Sign in to Bondr to view your connections</h3>
            <p>
              Please sign in with your Bondr profile to track sent connection requests, incoming invitations, and connected campus friends.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
              {onOpenLogin ? (
                <button type="button" className="btn btn-primary" onClick={onOpenLogin}>
                  <LogIn size={16} /> Sign In to Bondr
                </button>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  <LogIn size={16} /> Sign In to Bondr
                </Link>
              )}
              <Link to="/add-student" className="btn btn-secondary">
                <UserPlus size={16} /> Get Started
              </Link>
            </div>
          </div>
        ) : visibleList.length > 0 ? (
          <div className="connections-list">
            {visibleList.map(({ student, status, isSentByMe, isReceivedByMe }) => (
              <motion.article
                key={student.id}
                className="connection-row-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="connection-user-info">
                  {student.image ? (
                    <img
                      src={student.image}
                      alt={student.name}
                      className="connection-avatar"
                    />
                  ) : (
                    <div className="connection-avatar-initial">
                      {(student.name || 'S').trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="connection-details">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3>{student.name}</h3>
                    </div>
                    <p className="connection-sub">
                      {student.department} • {student.year} • Goal: {student.goal}
                    </p>
                    <div className="connection-tags-mini">
                      {student.hobbies.slice(0, 3).map((hobby) => (
                        <span
                          key={hobby}
                          className="hobby-tag"
                          style={{ backgroundColor: getHobbyStyle(hobby).bgTint }}
                        >
                          {hobby}
                        </span>
                      ))}
                      {typeof student.sharedCount === 'number' && (
                        <span className="hobby-tag" style={{ backgroundColor: '#ffffff' }}>
                          <Sparkles size={11} /> {student.sharedCount} shared
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="connection-right">
                  {status === 'accepted' ? (
                    <>
                      <span className="status-pill accepted">
                        <CheckCircle2 size={14} /> Connected
                      </span>
                      <Link to={`/messages/${student.id}`} className="btn btn-primary btn-sm" style={{ position: 'relative' }}>
                        <MessageCircle size={14} /> Chat
                        {getUnreadCountForStudent && getUnreadCountForStudent(student.id) > 0 && (
                          <span className="unread-tab-pill" style={{ marginLeft: 6 }}>
                            {getUnreadCountForStudent(student.id)}
                          </span>
                        )}
                      </Link>
                      <Link to={`/student/${student.id}`} className="btn btn-secondary btn-sm">
                        <Eye size={14} /> View Profile
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger-soft btn-sm"
                        onClick={() => cancelConnectionRequest(student.id, student.name)}
                        title="Remove connection"
                      >
                        <XCircle size={14} /> Remove
                      </button>
                    </>
                  ) : isReceivedByMe ? (
                    <>
                      <span className="status-pill pending" style={{ background: '#FEF3C7', color: '#92400E' }}>
                        <Sparkles size={14} /> Received Invitation
                      </span>
                      <Link to={`/student/${student.id}`} className="btn btn-secondary btn-sm">
                        <Eye size={14} /> View Profile
                      </Link>
                      <button
                        type="button"
                        className="btn btn-mint btn-sm"
                        onClick={() => acceptConnectionRequest(student.id, student.name)}
                        title="Accept connection request"
                      >
                        <CheckCircle2 size={14} /> Accept Connection
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger-soft btn-sm"
                        onClick={() => cancelConnectionRequest(student.id, student.name)}
                        title="Decline connection request"
                      >
                        <XCircle size={14} /> Decline
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="status-pill pending">
                        <Clock size={14} /> Request Sent
                      </span>
                      <Link to={`/student/${student.id}`} className="btn btn-secondary btn-sm">
                        <Eye size={14} /> View Profile
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger-soft btn-sm"
                        onClick={() => cancelConnectionRequest(student.id, student.name)}
                        title="Cancel sent request"
                      >
                        <XCircle size={14} /> Cancel Request
                      </button>
                    </>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Compass size={28} />
            </div>
            <h3>No connections in this tab yet</h3>
            <p>
              Head over to Discover Friends to meet SRM AP peers who share your hobbies and send a
              connection request.
            </p>
            <Link to="/discover" className="btn btn-primary">
              Discover Friends
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
