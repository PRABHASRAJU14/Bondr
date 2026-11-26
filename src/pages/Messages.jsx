import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  Eye,
  MessageCircle,
  X,
  Compass,
  Users,
  PlusCircle,
  Info,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { getSharedInterests } from '../utils/matching';
import { HOBBIES } from '../data/hobbies';
import defaultAvatar from '../assets/images/avatars/avatar-1.svg';

const CAMPUS_SPOTS = [
  'Central Library – Discussion Rooms',
  'Student Activity Center (SAC)',
  'University Central Lawns',
  'Campus Nescafe & Eateries',
  'Tech Block 1 – Innovation Labs',
  'Hostel Courtyard / Sports Arena',
];

const MEETUP_TIMES = [
  'Today at 5:15 PM',
  'Tomorrow during Free Hour (1:00 PM)',
  'Tomorrow Evening at 5:30 PM',
  'This Saturday Morning',
  'This Sunday Afternoon',
];

export default function Messages() {
  const { studentId: paramId } = useParams();
  const navigate = useNavigate();
  const {
    students,
    currentUser,
    acceptedConnections,
    messages,
    groups,
    groupMessages,
    sendMessage,
    sendGroupMessage,
    createGroup,
    unreadMessagesCount,
    getUnreadCountForStudent,
    markMessagesAsRead,
  } = useApp();

  // Mode: 'groups' | 'direct'
  const isDirectParam = paramId && paramId.startsWith('stu-');
  const isGroupParam = paramId && paramId.startsWith('grp-');

  const [activeMode, setActiveMode] = useState(isDirectParam ? 'direct' : 'groups');
  const [activeGroupId, setActiveGroupId] = useState(isGroupParam ? paramId : (groups[0]?.id || 'grp-photo'));
  const [activeStudentId, setActiveStudentId] = useState(isDirectParam ? paramId : (acceptedConnections[0]?.studentId || null));

  const [inputVal, setInputVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);

  const [selectedSpot, setSelectedSpot] = useState(CAMPUS_SPOTS[0]);
  const [selectedTime, setSelectedTime] = useState(MEETUP_TIMES[0]);

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupHobby, setNewGroupHobby] = useState(HOBBIES[0]?.name || 'Coding');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const chatScrollContainerRef = useRef(null);

  // Map of student records
  const studentMap = useMemo(() => {
    return new Map((students || []).map((s) => [s?.id, s]));
  }, [students]);

  const acceptedFriends = useMemo(() => {
    if (!currentUser || currentUser.isGuest) return [];
    return (acceptedConnections || [])
      .map((c) => {
        const otherId = c.fromUserId === currentUser.id ? c.toUserId : c.fromUserId || c.studentId;
        return otherId ? studentMap.get(otherId) : null;
      })
      .filter(Boolean);
  }, [acceptedConnections, studentMap, currentUser]);

  // Sync state if URL changes
  useEffect(() => {
    if (paramId) {
      if (paramId.startsWith('grp-')) {
        setActiveMode('groups');
        setActiveGroupId(paramId);
      } else if (paramId.startsWith('stu-')) {
        setActiveMode('direct');
        setActiveStudentId(paramId);
        markMessagesAsRead(paramId);
      }
    } else {
      // If user landed on /messages and has unread messages from a friend, open that direct chat!
      const friendWithUnread = acceptedFriends.find((f) => getUnreadCountForStudent(f.id) > 0);
      if (friendWithUnread) {
        setActiveMode('direct');
        setActiveStudentId(friendWithUnread.id);
        markMessagesAsRead(friendWithUnread.id);
      } else if (activeMode === 'groups' && groups[0]) {
        setActiveGroupId(groups[0].id);
      } else if (activeMode === 'direct' && acceptedFriends[0]) {
        setActiveStudentId(acceptedFriends[0].id);
        markMessagesAsRead(acceptedFriends[0].id);
      }
    }
  }, [paramId, activeMode, groups, acceptedFriends, getUnreadCountForStudent, markMessagesAsRead]);

  // Current active entity
  const activeGroup = useMemo(() => {
    return (groups || []).find((g) => g?.id === activeGroupId) || groups[0];
  }, [groups, activeGroupId]);

  const activeStudent = useMemo(() => {
    const idToFind = activeStudentId || (acceptedFriends[0] ? acceptedFriends[0].id : null);
    return idToFind ? studentMap.get(idToFind) : null;
  }, [activeStudentId, acceptedFriends, studentMap]);

  // Active message stream: merges shared threadKey, studentId key, and currentUser.id key
  const currentThread = useMemo(() => {
    if (activeMode === 'groups') {
      return activeGroup ? (groupMessages || {})[activeGroup.id] || [] : [];
    }
    const targetStudentId = activeStudent?.id || activeStudentId;
    if (!targetStudentId || !currentUser) return [];

    const threadKey = [currentUser.id, targetStudentId].sort().join('__');
    const safeMessages = messages || {};

    const seenIds = new Set();
    const combined = [];

    const addMsgs = (list) => {
      if (!Array.isArray(list)) return;
      list.forEach((msg) => {
        if (!msg || !msg.id || seenIds.has(msg.id)) return;
        if (msg.senderId === currentUser.id || msg.senderId === targetStudentId) {
          seenIds.add(msg.id);
          combined.push(msg);
        }
      });
    };

    addMsgs(safeMessages[threadKey]);
    addMsgs(safeMessages[targetStudentId]);
    addMsgs(safeMessages[currentUser.id]);

    return combined.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }, [activeMode, activeGroup, activeStudent, activeStudentId, currentUser, groupMessages, messages]);

  const sharedInterests = useMemo(() => {
    if (activeMode !== 'direct' || !activeStudent) return [];
    return getSharedInterests(currentUser?.hobbies || [], activeStudent?.hobbies || []);
  }, [activeMode, currentUser, activeStudent]);

  // Auto scroll message feed to bottom without shifting page
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [currentThread]);

  // Automatically mark messages as read when viewing an active direct chat
  useEffect(() => {
    if (activeMode === 'direct') {
      const targetId = activeStudent?.id || activeStudentId;
      if (targetId) {
        markMessagesAsRead(targetId);
      }
    }
  }, [activeMode, activeStudent?.id, activeStudentId, currentThread.length, markMessagesAsRead]);

  // Filtered lists
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.hobby.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
    );
  }, [groups, searchQuery]);

  const filteredFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return acceptedFriends;
    return acceptedFriends.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q)
    );
  }, [acceptedFriends, searchQuery]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    if (activeMode === 'groups') {
      if (!activeGroup) return;
      sendGroupMessage(activeGroup.id, inputVal);
      setInputVal('');
    } else {
      if (!activeStudent) return;
      sendMessage(activeStudent.id, inputVal);
      setInputVal('');
    }
  };

  const handleSendIcebreaker = (icebreakerText) => {
    if (activeMode === 'groups' && activeGroup) {
      sendGroupMessage(activeGroup.id, icebreakerText);
    } else if (activeMode === 'direct' && activeStudent) {
      sendMessage(activeStudent.id, icebreakerText);
    }
  };

  const handleSendMeetup = (e) => {
    e.preventDefault();
    if (!activeStudent) return;
    const meetupSummary = `📅 Campus Meetup Proposal\n📍 Location: ${selectedSpot}\n⏰ Time: ${selectedTime}\nLet's catch up and collaborate!`;
    sendMessage(activeStudent.id, meetupSummary, true);
    setPlannerOpen(false);
    toast.success('Campus Meetup invitation sent in chat!');
  };

  const handleCreateNewGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name.');
      return;
    }
    const created = createGroup(newGroupName, newGroupHobby, newGroupDesc);
    setCreateGroupOpen(false);
    setActiveMode('groups');
    setActiveGroupId(created.id);
    setNewGroupName('');
    setNewGroupDesc('');
    navigate(`/messages/${created.id}`);
  };

  // Group Icebreaker suggestions
  const groupIcebreakers = useMemo(() => {
    if (!activeGroup) return [];
    if (activeGroup.hobby === 'Photography') {
      return [
        '📸 Who is free for a golden-hour photowalk tomorrow?',
        '🌅 Where are the best sunset angles around campus?',
        '🎨 Any recommendations for mobile Lightroom presets?',
      ];
    }
    if (activeGroup.hobby === 'Coding') {
      return [
        '💻 Anyone looking for a Smart India Hackathon teammate?',
        '🚀 Working on any cool React or AI projects this week?',
        '⚡ Setting up a LeetCode/DSA sprint at 7 PM tonight!',
      ];
    }
    if (activeGroup.hobby === 'Music') {
      return [
        '🎵 Thursday acoustic jam session near the amphitheatre!',
        '🎸 What songs or indie playlists are on repeat for you?',
        '🎤 Looking for vocalists to collab on a fest performance.',
      ];
    }
    if (activeGroup.hobby === 'Sports') {
      return [
        '🏸 Need 2 more players for badminton court 2 tonight!',
        '🏃 Who is up for a sunrise 5K campus run tomorrow?',
        '⚽ Weekend turf football match at 5:30 PM!',
      ];
    }
    return [
      '👋 Hey everyone! When is our next campus circle meeting?',
      '☕ Anyone free for a quick coffee break at the campus cafe?',
      '📚 Planning a study session in the library this afternoon!',
    ];
  }, [activeGroup]);

  return (
    <div className="messages-page-wrapper">
      <div className="container">
        <div className="messages-container">
          {/* LEFT SIDEBAR */}
          <aside className={`messages-sidebar ${paramId ? 'hide-mobile' : ''}`}>
            <div className="messages-sidebar-header">
              {/* Segmented Mode Selector: Groups vs Direct */}
              <div className="messages-mode-tabs" role="tablist">
                <button
                  type="button"
                  className={`mode-tab-btn ${activeMode === 'groups' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveMode('groups');
                    const targetGrp = activeGroupId || groups[0]?.id;
                    if (targetGrp) {
                      setActiveGroupId(targetGrp);
                      navigate(`/messages/${targetGrp}`);
                    }
                  }}
                >
                  <Users size={14} /> Campus Groups ({groups.length})
                </button>
                <button
                  type="button"
                  className={`mode-tab-btn ${activeMode === 'direct' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveMode('direct');
                    const friendWithUnread = acceptedFriends.find((f) => getUnreadCountForStudent(f.id) > 0);
                    const targetFriend = friendWithUnread?.id || activeStudentId || acceptedFriends[0]?.id;
                    if (targetFriend) {
                      setActiveStudentId(targetFriend);
                      markMessagesAsRead(targetFriend);
                      navigate(`/messages/${targetFriend}`);
                    }
                  }}
                >
                  <MessageCircle size={14} /> Direct Chats ({acceptedFriends.length})
                  {unreadMessagesCount > 0 && (
                    <span className="unread-tab-pill">{unreadMessagesCount}</span>
                  )}
                </button>
              </div>

              {/* Action row & Search */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="search"
                  className="sidebar-search-input"
                  placeholder={activeMode === 'groups' ? 'Search campus groups...' : 'Search friends...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {activeMode === 'groups' && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setCreateGroupOpen(true)}
                    title="Create a new campus group"
                    style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}
                  >
                    <PlusCircle size={15} /> New
                  </button>
                )}
              </div>
            </div>

            {/* Instagram-Style Connected Friends Story Tray (only when connections exist) */}
            {acceptedFriends.length > 0 && (
              <div className="instagram-connections-tray">
                <div className="instagram-tray-header">
                  <span className="tray-label">Connected Friends</span>
                  <span className="tray-count-pill">{acceptedFriends.length} Connected</span>
                </div>

                <div className="instagram-stories-scroll">
                  {acceptedFriends.map((friend) => {
                    const isSelected = activeMode === 'direct' && activeStudent?.id === friend.id;
                    const firstName = friend.name.split(' ')[0];
                    const friendUnread = getUnreadCountForStudent(friend.id);

                    return (
                      <button
                        key={friend.id}
                        type="button"
                        className={`instagram-story-item ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setActiveMode('direct');
                          setActiveStudentId(friend.id);
                          markMessagesAsRead(friend.id);
                          navigate(`/messages/${friend.id}`);
                        }}
                        title={`Chat with ${friend.name}`}
                      >
                        <div className={`story-ring-outer ${isSelected ? 'active' : ''} ${friendUnread > 0 ? 'has-unread' : ''}`}>
                          <div className="story-avatar-wrap">
                            {friend.image ? (
                              <img src={friend.image} alt="" className="story-avatar-img" />
                            ) : (
                              <div className="story-avatar-initial">
                                {(friend.name || 'S').trim().charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="story-online-dot" />
                            {friendUnread > 0 && (
                              <span className="story-unread-badge">{friendUnread}</span>
                            )}
                          </div>
                        </div>
                        <span className="story-name">{firstName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
      {/* LIST: Campus Groups */}
      {activeMode === 'groups' && (
        <div className="messages-chat-list">
          {filteredGroups.map((grp) => {
            const thread = groupMessages[grp.id] || [];
            const lastMsg = thread[thread.length - 1];
            const isActive = activeGroup?.id === grp.id;

            return (
              <button
                key={grp.id}
                type="button"
                className={`chat-list-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveGroupId(grp.id);
                  navigate(`/messages/${grp.id}`);
                }}
              >
                <div className="group-item-icon-wrap">
                  {grp.hobby === 'Photography' ? '📸' :
                    grp.hobby === 'Coding' ? '💻' :
                      grp.hobby === 'Music' ? '🎵' :
                        grp.hobby === 'Reading' ? '📚' :
                          grp.hobby === 'Sports' ? '🏸' : '👥'}
                </div>
                <div className="chat-item-info">
                  <div className="chat-item-top">
                    <span className="chat-item-name">{grp.name}</span>
                    <span className="chat-item-time">
                      {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                    </span>
                  </div>
                  <p className="chat-item-preview">
                    {lastMsg ? `${lastMsg.senderName.split(' ')[0]}: ${lastMsg.text}` : grp.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* LIST: Direct 1-on-1 Chats */}
      {activeMode === 'direct' && (
        <div className="messages-chat-list">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => {
              const threadKey = currentUser ? [currentUser.id, friend.id].sort().join('__') : friend.id;
              const thread = (messages || {})[threadKey] || (messages || {})[friend.id] || [];
              const lastMsg = thread[thread.length - 1];
              const isActive = activeStudent?.id === friend.id;
              const friendUnread = getUnreadCountForStudent(friend.id);

              return (
                <button
                  key={friend.id}
                  type="button"
                  className={`chat-list-item ${isActive ? 'active' : ''} ${friendUnread > 0 ? 'has-unread' : ''}`}
                  onClick={() => {
                    setActiveStudentId(friend.id);
                    markMessagesAsRead(friend.id);
                    navigate(`/messages/${friend.id}`);
                  }}
                >
                  <div className="chat-item-avatar-wrap">
                    {friend.image ? (
                      <img
                        src={friend.image}
                        alt={friend.name}
                        className="chat-item-avatar"
                        onError={(e) => {
                          if (friend.fallbackImage && e.currentTarget.src !== friend.fallbackImage) {
                            e.currentTarget.src = friend.fallbackImage;
                          }
                        }}
                      />
                    ) : (
                      <div className="chat-item-avatar-initial">
                        {(friend.name || 'S').trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="chat-online-badge" title="Online on campus" />
                  </div>
                  <div className="chat-item-info">
                    <div className="chat-item-top">
                      <span className={`chat-item-name ${friendUnread > 0 ? 'unread-name' : ''}`}>{friend.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="chat-item-time">
                          {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Online'}
                        </span>
                        {friendUnread > 0 && (
                          <span className="chat-unread-badge">{friendUnread}</span>
                        )}
                      </div>
                    </div>
                    <p className={`chat-item-preview ${friendUnread > 0 ? 'unread-bold' : ''}`}>
                      {lastMsg ? lastMsg.text : 'Tap to start conversation...'}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <MessageCircle size={28} style={{ margin: '0 auto 8px', color: 'var(--color-primary)' }} />
              <p style={{ fontSize: 'var(--text-xs)', marginBottom: 12 }}>
                No direct connections in this view yet.
              </p>
              <Link to="/connections" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Accept Requests
              </Link>
            </div>
          )}
        </div>
      )}
    </aside>

          {/* RIGHT CHAT WINDOW */ }
  <main className={`messages-main-pane ${!paramId ? 'hide-mobile' : ''}`}>
    {/* GROUP CHAT VIEW */}
    {activeMode === 'groups' && activeGroup && (
      <>
        <div className="chat-header">
          <div className="chat-header-user">
            <button
              type="button"
              className="btn btn-secondary btn-sm show-mobile-only"
              onClick={() => navigate('/messages')}
              style={{ padding: '6px' }}
            >
              <ArrowLeft size={16} />
            </button>
            <div className="group-item-icon-wrap" style={{ width: 42, height: 42, fontSize: '1.2rem' }}>
              {activeGroup.hobby === 'Photography' ? '📸' :
                activeGroup.hobby === 'Coding' ? '💻' :
                  activeGroup.hobby === 'Music' ? '🎵' :
                    activeGroup.hobby === 'Reading' ? '📚' :
                      activeGroup.hobby === 'Sports' ? '🏸' : '👥'}
            </div>
            <div>
              <h2 className="chat-header-name">{activeGroup.name}</h2>
              <p className="chat-header-sub">
                Active Campus Circle • {activeGroup.memberCount || 20} Student Members
              </p>
            </div>
          </div>

          <div className="chat-header-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setGroupInfoOpen(true)}
            >
              <Info size={14} /> Group Info
            </button>
          </div>
        </div>

        {/* Group Description Bar */}
        <div className="chat-shared-banner">
          <Sparkles size={14} />
          <span>{activeGroup.description}</span>
        </div>

        {/* Group Message Stream */}
        <div className="chat-messages-scroll" ref={chatScrollContainerRef}>
          {currentThread.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`message-bubble-row ${isMe ? 'sent' : 'received'}`}
              >
                {!isMe && (
                  <img
                    src={studentMap.get(msg.senderId)?.image || msg.senderAvatar || defaultAvatar}
                    alt={msg.senderName}
                    className="message-avatar-mini"
                    onError={(e) => {
                      const s = studentMap.get(msg.senderId);
                      if (s?.fallbackImage && e.currentTarget.src !== s.fallbackImage) {
                        e.currentTarget.src = s.fallbackImage;
                      }
                    }}
                  />
                )}
                <div className="message-bubble">
                  {!isMe && (
                    <div className="group-message-sender-name">
                      <span>{msg.senderName}</span>
                      {msg.senderRole && (
                        <span className="sender-role-pill">{msg.senderRole}</span>
                      )}
                    </div>
                  )}
                  <span>{msg.text}</span>
                  <span className="message-meta">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Group Quick Topics */}
        <div className="chat-icebreakers-bar">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
            Group Topics:
          </span>
          {groupIcebreakers.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="icebreaker-chip"
              onClick={() => handleSendIcebreaker(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Composer */}
        <form className="chat-composer-bar" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            placeholder={`Message #${activeGroup.name.replace(/[^a-zA-Z0-9 ]/g, '').trim()}...`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button type="submit" className="chat-send-btn" aria-label="Send message">
            <Send size={18} />
          </button>
        </form>
      </>
    )}

    {/* DIRECT CHAT VIEW */}
    {activeMode === 'direct' && (
      activeStudent ? (
        <>
          <div className="chat-header">
            <div className="chat-header-user">
              <button
                type="button"
                className="btn btn-secondary btn-sm show-mobile-only"
                onClick={() => navigate('/messages')}
                style={{ padding: '6px' }}
              >
                <ArrowLeft size={16} />
              </button>
              {activeStudent.image ? (
                <img
                  src={activeStudent.image}
                  alt={activeStudent.name}
                  className="chat-header-avatar"
                  onError={(e) => {
                    if (activeStudent.fallbackImage && e.currentTarget.src !== activeStudent.fallbackImage) {
                      e.currentTarget.src = activeStudent.fallbackImage;
                    }
                  }}
                />
              ) : (
                <div className="chat-header-avatar-initial">
                  {(activeStudent.name || 'S').trim().charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="chat-header-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {activeStudent.name}
                  <CheckCircle2 size={16} color="#3B82F6" title="Verified SRM AP Student" />
                </h2>
                <p className="chat-header-sub">
                  {activeStudent.department} • {activeStudent.year} • {activeStudent.goal}
                </p>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPlannerOpen(true)}
              >
                <Calendar size={14} /> Plan Meetup
              </button>
              <Link
                to={`/student/${activeStudent.id}`}
                className="btn btn-pastel btn-sm"
                title="View Full Profile"
              >
                <Eye size={14} /> Profile
              </Link>
            </div>
          </div>

          {sharedInterests.length > 0 && (
            <div className="chat-shared-banner">
              <Sparkles size={14} />
              <span>
                Shared Interests: <strong>{sharedInterests.join(', ')}</strong>
              </span>
            </div>
          )}

          {/* Chat messages */}
          <div className="chat-messages-scroll" ref={chatScrollContainerRef}>
            {currentThread.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Sparkles size={24} style={{ margin: '0 auto 8px', color: 'var(--color-primary)' }} />
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                  Start your conversation with {activeStudent.name.split(' ')[0]}!
                </p>
                <p style={{ fontSize: 'var(--text-xs)' }}>
                  Send a message or propose a campus meetup.
                </p>
              </div>
            ) : (
              currentThread.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`message-bubble-row ${isMe ? 'sent' : 'received'}`}
                  >
                    {!isMe && (
                      activeStudent.image ? (
                        <img
                          src={activeStudent.image}
                          alt=""
                          className="message-avatar-mini"
                          onError={(e) => {
                            if (activeStudent.fallbackImage && e.currentTarget.src !== activeStudent.fallbackImage) {
                              e.currentTarget.src = activeStudent.fallbackImage;
                            }
                          }}
                        />
                      ) : (
                        <div className="message-avatar-mini-initial">
                          {(activeStudent.name || 'S').trim().charAt(0).toUpperCase()}
                        </div>
                      )
                    )}
                    <div className="message-bubble">
                      {msg.isMeetup ? (
                        <div className="meetup-bubble-card">
                          <div className="meetup-bubble-header">
                            <MapPin size={14} /> Campus Meetup Invitation
                          </div>
                          <div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem' }}>
                            {msg.text}
                          </div>
                        </div>
                      ) : (
                        <span>{msg.text}</span>
                      )}
                      <span className="message-meta">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Icebreakers */}
          <div className="chat-icebreakers-bar">
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
              Quick Prompts:
            </span>
            <button
              type="button"
              className="icebreaker-chip"
              onClick={() => handleSendIcebreaker('👋 Hey, glad we connected! What are you working on this week?')}
            >
              👋 Say Hello
            </button>
            <button
              type="button"
              className="icebreaker-chip"
              onClick={() => handleSendIcebreaker('☕ Free to grab a coffee at Central Cafe this afternoon?')}
            >
              ☕ Coffee Break
            </button>
            <button
              type="button"
              className="icebreaker-chip"
              onClick={() => handleSendIcebreaker('📚 Heading to the library later to study?')}
            >
              📚 Library Study
            </button>
          </div>

          {/* Composer */}
          <form className="chat-composer-bar" onSubmit={handleSend}>
            <input
              type="text"
              className="chat-input"
              placeholder={`Message ${activeStudent.name.split(' ')[0]}...`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" aria-label="Send message">
              <Send size={18} />
            </button>
          </form>
        </>
      ) : (
        <div className="empty-state" style={{ margin: 'auto' }}>
          <Compass size={32} />
          <h3>No Direct Peer Selected</h3>
          <p>Choose an accepted friend from the left sidebar or visit Connections.</p>
          <Link to="/connections" className="btn btn-primary btn-sm">
            View Connections Hub
          </Link>
        </div>
      )
    )}
  </main>
        </div >
      </div >

    {/* PLAN MEETUP MODAL */ }
    < AnimatePresence >
    { plannerOpen && activeStudent && (
      <div className="modal-backdrop" onClick={() => setPlannerOpen(false)}>
        <motion.div
          className="meetup-modal-box"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem' }}>
              <Calendar size={20} color="var(--color-primary)" />
              Plan Meetup with {activeStudent.name.split(' ')[0]}
            </h3>
            <button
              type="button"
              onClick={() => setPlannerOpen(false)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSendMeetup}>
            <div className="form-field" style={{ marginBottom: 14 }}>
              <label className="form-label">
                <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
                Campus Location
              </label>
              <select
                className="form-select"
                value={selectedSpot}
                onChange={(e) => setSelectedSpot(e.target.value)}
              >
                {CAMPUS_SPOTS.map((spot) => (
                  <option key={spot} value={spot}>{spot}</option>
                ))}
              </select>
            </div>

            <div className="form-field" style={{ marginBottom: 18 }}>
              <label className="form-label">
                <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />
                Preferred Time
              </label>
              <select
                className="form-select"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                {MEETUP_TIMES.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPlannerOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Send Invitation
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
}
      </AnimatePresence >

  {/* CREATE NEW GROUP MODAL */ }
  < AnimatePresence >
  { createGroupOpen && (
    <div className="modal-backdrop" onClick={() => setCreateGroupOpen(false)}>
      <motion.div
        className="meetup-modal-box"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem' }}>
            <Users size={20} color="var(--color-primary)" />
            Create Campus Hobby Group
          </h3>
          <button
            type="button"
            onClick={() => setCreateGroupOpen(false)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreateNewGroup}>
          <div className="form-field" style={{ marginBottom: 12 }}>
            <label className="form-label">Group Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. SRM AP Autonomous Robotics Circle"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              required
            />
          </div>

          <div className="form-field" style={{ marginBottom: 12 }}>
            <label className="form-label">Hobby Category</label>
            <select
              className="form-select"
              value={newGroupHobby}
              onChange={(e) => setNewGroupHobby(e.target.value)}
            >
              {HOBBIES.map((h) => (
                <option key={h.id} value={h.name}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field" style={{ marginBottom: 18 }}>
            <label className="form-label">Description &amp; Goals</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: 70 }}
              placeholder="What will members collaborate or meet up for?"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setCreateGroupOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Create &amp; Launch Group
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )}
      </AnimatePresence >

  {/* GROUP INFO & MEMBERS MODAL */ }
  < AnimatePresence >
  { groupInfoOpen && activeGroup && (
    <div className="modal-backdrop" onClick={() => setGroupInfoOpen(false)}>
      <motion.div
        className="meetup-modal-box"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem' }}>
            <Info size={20} color="var(--color-primary)" />
            {activeGroup.name}
          </h3>
          <button
            type="button"
            onClick={() => setGroupInfoOpen(false)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-body)', marginBottom: 16 }}>
          {activeGroup.description}
        </p>

        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Active Members in this Circle ({activeGroup.memberCount || 20})
        </div>

        <div className="group-members-list">
          {students.slice(0, 5).map((stu) => (
            <div key={stu.id} className="group-member-item">
              <img
                src={stu.image}
                alt={stu.name}
                className="group-member-avatar"
                onError={(e) => {
                  if (stu.fallbackImage && e.currentTarget.src !== stu.fallbackImage) {
                    e.currentTarget.src = stu.fallbackImage;
                  }
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 'var(--text-xs)' }}>{stu.name}</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {stu.department} • {stu.year}
                </span>
              </div>
              <Link to={`/student/${stu.id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                Profile
              </Link>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setGroupInfoOpen(false)}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )}
      </AnimatePresence >
    </div >
  );
}
