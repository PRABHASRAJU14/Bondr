import { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SAMPLE_STUDENTS } from '../data/students';
import { rankStudentsBySharedInterests } from '../utils/matching';
import {
  fetchProfilesFromCloud,
  upsertProfileToCloud,
  fetchConnectionsFromCloud,
  upsertConnectionToCloud,
  removeConnectionFromCloud,
  fetchMessagesFromCloud,
  insertMessageToCloud,
  markMessagesReadInCloud,
  subscribeToCloudChanges,
} from '../services/dbService';
import { isSupabaseConfigured } from '../services/supabaseClient';

const AppContext = createContext(null);

const DEFAULT_USER = {
  id: 'guest',
  name: 'Guest Explorer',
  department: 'Computer Science & Engineering',
  year: '1st Year',
  hobbies: [],
  goal: 'Friendship',
  rollNumber: '',
  email: '',
  hostel: '',
  isGuest: true,
  image: null,
};

const DEFAULT_CONNECTIONS = [];

const DEFAULT_GROUPS = [
  {
    id: 'grp-photo',
    name: '📸 SRM AP Photography Club',
    hobby: 'Photography',
    description: 'Golden-hour walks, campus reels, and portrait sessions around Amaravati.',
    memberIds: [],
    memberCount: 28,
  },
  {
    id: 'grp-coding',
    name: '💻 Hackathon & AI Builders Squad',
    hobby: 'Coding',
    description: 'Team formation for Smart India Hackathon, open-source projects & DSA grind.',
    memberIds: [],
    memberCount: 34,
  },
  {
    id: 'grp-music',
    name: '🎵 Acoustic Jam & Music Circle',
    hobby: 'Music',
    description: 'Unwinding with acoustic jams at the amphitheatre steps, indie playlists and song collabs.',
    memberIds: [],
    memberCount: 19,
  },
  {
    id: 'grp-study',
    name: '📚 Central Library Study Pod',
    hobby: 'Reading',
    description: 'Pomodoro study blocks, quiet focus, note swaps & exam preparation in Discussion Room 3.',
    memberIds: [],
    memberCount: 22,
  },
  {
    id: 'grp-sports',
    name: '🏸 SRM AP Badminton & Turf Squad',
    hobby: 'Sports',
    description: 'Evening indoor badminton court rallies, morning 5K runs and turf football.',
    memberIds: [],
    memberCount: 31,
  },
];

const DEFAULT_GROUP_MESSAGES = {
  'grp-photo': [
    {
      id: 'gmsg-1',
      senderId: 'circle-lead-1',
      senderName: 'Photography Circle',
      senderAvatar: null,
      senderRole: 'Club Lead',
      text: 'Welcome photographers! Golden-hour photowalk tomorrow around 5:15 PM near the central lawns. Bring your cameras or phones!',
      createdAt: '2026-11-26T10:00:00.000Z',
    },
  ],
  'grp-coding': [
    {
      id: 'gmsg-2',
      senderId: 'circle-lead-2',
      senderName: 'Hackathon Circle',
      senderAvatar: null,
      senderRole: 'Organizer',
      text: 'Smart India Hackathon submissions open this week! Who is looking for project teammates in AI, Web, or Mobile tracks?',
      createdAt: '2026-11-26T10:15:00.000Z',
    },
  ],
  'grp-music': [
    {
      id: 'gmsg-3',
      senderId: 'circle-lead-3',
      senderName: 'Music Circle',
      senderAvatar: null,
      senderRole: 'Club Host',
      text: 'Acoustic jam session this Thursday at 6:00 PM near the amphitheatre steps! Bring your instruments or just come vibe.',
      createdAt: '2026-11-26T10:30:00.000Z',
    },
  ],
  'grp-study': [
    {
      id: 'gmsg-4',
      senderId: 'circle-lead-4',
      senderName: 'Library Circle',
      senderAvatar: null,
      senderRole: 'Study Host',
      text: 'Setting up a quiet 3-hour Pomodoro study block in Central Library Discussion Room 3 tomorrow from 2:00 PM.',
      createdAt: '2026-11-26T11:00:00.000Z',
    },
  ],
  'grp-sports': [
    {
      id: 'gmsg-5',
      senderId: 'circle-lead-5',
      senderName: 'Sports Council',
      senderAvatar: null,
      senderRole: 'Sports Lead',
      text: 'Badminton Court 2 is booked tomorrow from 6:00 PM to 7:30 PM! Looking for doubles sparring partners.',
      createdAt: '2026-11-26T11:30:00.000Z',
    },
  ],
};

const DEFAULT_MESSAGES = {};

export function AppProvider({ children }) {
  const [students, setStudents] = useLocalStorage('bondr_srm_students_v8', []);
  const [currentUser, setCurrentUser] = useLocalStorage('bondr_srm_user_v8', DEFAULT_USER);
  const [connections, setConnections] = useLocalStorage('bondr_srm_connections_v8', []);
  const [messages, setMessages] = useLocalStorage('bondr_srm_messages_v8', DEFAULT_MESSAGES);
  const [groups, setGroups] = useLocalStorage('bondr_srm_groups_v8', DEFAULT_GROUPS);
  const [groupMessages, setGroupMessages] = useLocalStorage('bondr_srm_group_messages_v8', DEFAULT_GROUP_MESSAGES);

  // Clean up any legacy user data and migrate previously created profiles from older storage versions
  useEffect(() => {
    try {
      const legacyKeys = [
        'faf_srm_students',
        'faf_srm_students_v2',
        'faf_srm_students_v3',
        'faf_srm_students_v4',
        'faf_srm_students_v5',
        'faf_srm_students_v6',
        'faf_srm_user_v6',
        'faf_srm_connections_v6',
        'faf_srm_messages_v6',
      ];
      legacyKeys.forEach((key) => window.localStorage.removeItem(key));

      // Recover student profiles from any previous version
      const olderStudentKeys = [
        'bondr_srm_students_v7',
        'bondr_srm_students_v6',
        'bondr_srm_students_v5',
        'bondr_srm_students',
      ];
      let recovered = [];
      olderStudentKeys.forEach((key) => {
        try {
          const raw = window.localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              recovered = [...recovered, ...parsed];
            }
          }
        } catch {
          // ignore
        }
      });

      if (recovered.length > 0) {
        setStudents((prev) => {
          const safe = Array.isArray(prev) ? prev : [];
          const existingIds = new Set(safe.map((s) => s.id));
          const existingRolls = new Set(safe.map((s) => s.rollNumber?.toLowerCase()).filter(Boolean));
          const toAdd = recovered.filter((s) => s && s.id && !existingIds.has(s.id) && !existingRolls.has(s.rollNumber?.toLowerCase()));
          if (toAdd.length > 0) {
            const merged = [...safe, ...toAdd];
            try {
              window.localStorage.setItem('bondr_srm_students_v8', JSON.stringify(merged));
            } catch {
              // ignore
            }
            return merged;
          }
          return safe;
        });
      }

      // Recover active logged-in user if currently guest
      const currentStored = window.localStorage.getItem('bondr_srm_user_v8');
      const isGuest = !currentStored || JSON.parse(currentStored)?.isGuest;
      if (isGuest) {
        for (const uKey of ['bondr_srm_user_v7', 'bondr_srm_user_v6', 'bondr_srm_user']) {
          try {
            const rawU = window.localStorage.getItem(uKey);
            if (rawU) {
              const parsedU = JSON.parse(rawU);
              if (parsedU && !parsedU.isGuest && parsedU.name) {
                setCurrentUser(parsedU);
                window.localStorage.setItem('bondr_srm_user_v8', JSON.stringify(parsedU));
                break;
              }
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }
  }, [setStudents, setCurrentUser]);

  // Supabase Cloud Synchronization & Realtime Listeners
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let mounted = true;

    async function loadCloudData() {
      try {
        const [cloudProfiles, cloudConnections, cloudMessages] = await Promise.all([
          fetchProfilesFromCloud(),
          fetchConnectionsFromCloud(),
          fetchMessagesFromCloud(),
        ]);

        if (mounted) {
          if (cloudProfiles && cloudProfiles.length > 0) {
            setStudents((prev) => {
              const safe = Array.isArray(prev) ? prev : [];
              const cloudIds = new Set(cloudProfiles.map((p) => p.id));
              const localOnly = safe.filter((s) => s && !cloudIds.has(s.id));
              return [...cloudProfiles, ...localOnly];
            });
          }

          if (cloudConnections && cloudConnections.length > 0) {
            setConnections(cloudConnections);
          }

          if (cloudMessages && Object.keys(cloudMessages).length > 0) {
            setMessages((prev) => ({
              ...(prev || {}),
              ...cloudMessages,
            }));
          }
        }
      } catch (err) {
        console.warn('Error loading cloud data from Supabase:', err);
      }
    }

    loadCloudData();

    // Subscribe to live WebSocket realtime events
    const unsubscribe = subscribeToCloudChanges({
      onProfileChange: (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const profile = payload.new;
          if (!profile) return;
          const mapped = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            rollNumber: profile.roll_number || '',
            department: profile.department || 'Computer Science & Engineering',
            year: profile.year || '2nd Year',
            hostel: profile.hostel || 'Ganga Hostel',
            image: profile.image || null,
            bio: profile.bio || profile.about_me || '',
            aboutMe: profile.about_me || profile.bio || '',
            hobbies: Array.isArray(profile.hobbies) ? profile.hobbies : [],
            goal: profile.goal || 'Friendship',
            favouriteActivities: Array.isArray(profile.favourite_activities) ? profile.favourite_activities : [],
            isVerified: profile.is_verified ?? true,
          };
          setStudents((prev) => {
            const safe = Array.isArray(prev) ? prev : [];
            const idx = safe.findIndex((s) => s.id === mapped.id);
            if (idx >= 0) {
              const updated = [...safe];
              updated[idx] = { ...updated[idx], ...mapped };
              return updated;
            }
            return [mapped, ...safe];
          });
        }
      },
      onConnectionChange: (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const c = payload.new;
          if (!c) return;
          const mapped = {
            id: c.id,
            fromUserId: c.from_user_id,
            toUserId: c.to_user_id,
            status: c.status,
            createdAt: c.created_at,
          };
          setConnections((prev) => {
            const safe = Array.isArray(prev) ? prev : [];
            const idx = safe.findIndex((item) => item.id === c.id);
            if (idx >= 0) {
              const updated = [...safe];
              updated[idx] = mapped;
              return updated;
            }
            return [mapped, ...safe];
          });
        } else if (payload.eventType === 'DELETE') {
          setConnections((prev) => (Array.isArray(prev) ? prev.filter((item) => item.id !== payload.old?.id) : []));
        }
      },
      onMessageInsert: (msgRow) => {
        if (!msgRow) return;
        const msg = {
          id: msgRow.id,
          senderId: msgRow.sender_id,
          text: msgRow.text,
          isMeetup: msgRow.is_meetup,
          read: msgRow.read,
          readBy: msgRow.read_by || [],
          createdAt: msgRow.created_at,
        };
        const key = msgRow.thread_key;
        setMessages((prev) => {
          const safe = prev || {};
          const existing = safe[key] || [];
          if (existing.some((m) => m && m.id === msg.id)) return prev;
          return {
            ...safe,
            [key]: [...existing, msg],
          };
        });
      },
      onMessageUpdate: (msgRow) => {
        if (!msgRow) return;
        const key = msgRow.thread_key;
        setMessages((prev) => {
          const safe = prev || {};
          const existing = safe[key] || [];
          const updated = existing.map((m) => (m && m.id === msgRow.id ? { ...m, read: msgRow.read, readBy: msgRow.read_by } : m));
          return {
            ...safe,
            [key]: updated,
          };
        });
      },
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [setStudents, setConnections, setMessages]);

  // Rank students dynamically against current user's hobbies (excluding self if signed in as a student)
  const rankedStudents = useMemo(() => {
    const safeStudents = Array.isArray(students) ? students : [];
    const currentId = currentUser?.id || 'guest';
    const currentHobbies = currentUser?.hobbies || [];
    const candidates = safeStudents.filter((s) => s && s.id !== currentId);
    return rankStudentsBySharedInterests(candidates, currentHobbies);
  }, [students, currentUser]);

  const getConnectionStatus = useCallback(
    (studentId) => {
      if (!studentId || !Array.isArray(connections)) return null;
      if (currentUser && !currentUser.isGuest && currentUser.id === studentId) return 'self';

      const currentId = currentUser?.id;
      const record = connections.find((c) => {
        if (!c) return false;
        if (c.fromUserId && c.toUserId) {
          return (
            (c.fromUserId === currentId && c.toUserId === studentId) ||
            (c.toUserId === currentId && c.fromUserId === studentId)
          );
        }
        return c.studentId === studentId;
      });

      if (!record) return null;
      if (record.status === 'accepted') return 'accepted';
      if (record.fromUserId === currentId) return 'sent';
      if (record.toUserId === currentId) return 'received';
      return record.direction === 'received' ? 'received' : record.status || 'pending';
    },
    [connections, currentUser]
  );

  const getConnectionDirection = useCallback(
    (studentId) => {
      if (!studentId || !Array.isArray(connections)) return null;
      const currentId = currentUser?.id;
      const record = connections.find((c) => {
        if (!c) return false;
        if (c.fromUserId && c.toUserId) {
          return (
            (c.fromUserId === currentId && c.toUserId === studentId) ||
            (c.toUserId === currentId && c.fromUserId === studentId)
          );
        }
        return c.studentId === studentId;
      });

      if (!record) return null;
      if (record.fromUserId === currentId) return 'sent';
      if (record.toUserId === currentId) return 'received';
      return record.direction || 'sent';
    },
    [connections, currentUser]
  );

  const sendConnectionRequest = useCallback(
    (target) => {
      if (!currentUser || currentUser.isGuest) {
        toast.error('Please sign in or create a profile to connect with peers.');
        return;
      }
      const studentId = typeof target === 'object' && target !== null ? target.id : target;
      const studentName = typeof target === 'object' && target !== null ? target.name : 'Peer';
      if (!studentId) return;

      if (studentId === currentUser.id) {
        toast.error('You cannot connect with your own profile.');
        return;
      }

      const safeConnections = Array.isArray(connections) ? connections : [];
      const existing = safeConnections.find((c) => {
        if (!c) return false;
        if (c.fromUserId && c.toUserId) {
          return (
            (c.fromUserId === currentUser.id && c.toUserId === studentId) ||
            (c.toUserId === currentUser.id && c.fromUserId === studentId)
          );
        }
        return c.studentId === studentId;
      });

      if (existing) {
        if (existing.status === 'accepted') {
          toast.success(`You are already connected with ${studentName}!`);
          return;
        }
        if (existing.fromUserId === currentUser.id || existing.direction === 'sent') {
          toast('Connection request is already pending.', { icon: '⏳' });
          return;
        }
        if (existing.toUserId === currentUser.id || existing.direction === 'received') {
          setConnections((prev) =>
            (Array.isArray(prev) ? prev : []).map((c) => {
              const match =
                c.id === existing.id ||
                (c.fromUserId === studentId && c.toUserId === currentUser.id) ||
                c.studentId === studentId;
              return match ? { ...c, status: 'accepted' } : c;
            })
          );
          toast.success(`Connected with ${studentName}! You can now chat in Messages.`);
          return;
        }
      }

      const newConnection = {
        id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        fromUserId: currentUser.id,
        toUserId: studentId,
        studentId: studentId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setConnections((prev) => [
        newConnection,
        ...(Array.isArray(prev) ? prev.filter((c) => c && c.fromUserId !== c.toUserId && c.studentId !== currentUser.id) : []),
      ]);
      upsertConnectionToCloud(newConnection);
      toast.success(`Connection request sent to ${studentName}!`);
    },
    [connections, currentUser, setConnections]
  );

  const acceptConnectionRequest = useCallback(
    (targetId, studentName) => {
      const currentId = currentUser?.id;
      setConnections((prev) =>
        (Array.isArray(prev) ? prev : []).map((c) => {
          if (!c) return c;
          const match =
            c.id === targetId ||
            c.studentId === targetId ||
            (c.fromUserId === targetId && c.toUserId === currentId) ||
            (c.toUserId === targetId && c.fromUserId === currentId);
          if (match) {
            upsertConnectionToCloud({ ...c, status: 'accepted' });
            return { ...c, status: 'accepted' };
          }
          return c;
        })
      );
      toast.success(`Connected with ${studentName || 'student'}! You can now chat in Messages.`);
    },
    [currentUser?.id, setConnections]
  );

  const cancelConnectionRequest = useCallback(
    (targetId, studentName) => {
      const currentId = currentUser?.id;
      removeConnectionFromCloud(targetId);
      setConnections((prev) =>
        (Array.isArray(prev) ? prev : []).filter((c) => {
          if (!c) return false;
          const match =
            c.id === targetId ||
            c.studentId === targetId ||
            (c.fromUserId === targetId && c.toUserId === currentId) ||
            (c.toUserId === targetId && c.fromUserId === currentId) ||
            (c.fromUserId === currentId && c.toUserId === targetId);
          return !match;
        })
      );
      toast.success(
        studentName ? `Removed connection with ${studentName}.` : 'Connection removed.'
      );
    },
    [currentUser?.id, setConnections]
  );

  const logoutToGuest = useCallback(() => {
    setCurrentUser(DEFAULT_USER);
    toast.success('Logged out. You are now in Guest mode.');
  }, [setCurrentUser]);

  const deleteStudentProfile = useCallback(
    (studentId) => {
      if (!studentId) return;
      setStudents((prev) => (Array.isArray(prev) ? prev.filter((s) => s && s.id !== studentId) : []));
      setConnections((prev) =>
        (Array.isArray(prev) ? prev : []).filter(
          (c) =>
            c &&
            c.fromUserId !== studentId &&
            c.toUserId !== studentId &&
            c.studentId !== studentId
        )
      );
      setMessages((prev) => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
      if (currentUser && currentUser.id === studentId) {
        logoutToGuest();
      }
      toast.success('Your profile has been permanently deleted.');
    },
    [currentUser, setStudents, setConnections, setMessages, logoutToGuest]
  );

  const addStudent = useCallback(
    (newStudentData, setAsActive = false) => {
      const cleanEmail =
        newStudentData.email ||
        `${newStudentData.name.toLowerCase().replace(/\s+/g, '_')}@srmap.edu.in`;

      const cleanRoll =
        newStudentData.rollNumber || `AP241100${Math.floor(1000 + Math.random() * 9000)}`;

      const created = {
        ...newStudentData,
        email: cleanEmail,
        rollNumber: cleanRoll,
        id: newStudentData.id || `stu-${Date.now()}`,
        isSample: false,
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      setStudents((prev) => {
        const safe = Array.isArray(prev) ? prev : [];
        const idx = safe.findIndex(
          (s) =>
            s.id === created.id ||
            (s.rollNumber && s.rollNumber.toLowerCase() === created.rollNumber.toLowerCase()) ||
            (s.email && s.email.toLowerCase() === created.email.toLowerCase())
        );

        let next;
        if (idx >= 0) {
          next = [...safe];
          next[idx] = { ...next[idx], ...created };
        } else {
          next = [created, ...safe];
        }

        try {
          window.localStorage.setItem('bondr_srm_students_v8', JSON.stringify(next));
        } catch (e) {
          console.warn('Direct save error on students:', e);
        }

        return next;
      });

      if (setAsActive) {
        const activeUser = {
          id: created.id,
          name: created.name,
          department: created.department,
          year: created.year,
          hobbies: created.hobbies,
          goal: created.goal,
          rollNumber: created.rollNumber,
          email: created.email,
          password: created.password || '',
          hostel: created.hostel || 'Ganga Hostel',
          bio: created.bio || '',
          aboutMe: created.aboutMe || created.bio || '',
          favouriteActivities: created.favouriteActivities || [],
          isGuest: false,
          image: created.image || null,
        };

        setCurrentUser(activeUser);

        try {
          window.localStorage.setItem('bondr_srm_user_v8', JSON.stringify(activeUser));
        } catch (e) {
          console.warn('Direct save error on user:', e);
        }
      }

      // Sync new profile to Supabase cloud
      upsertProfileToCloud(created);

      return created;
    },
    [setStudents, setCurrentUser]
  );

  const updateCurrentUserHobbies = useCallback(
    (hobbies) => {
      setCurrentUser((prev) => {
        const updated = { ...prev, hobbies };
        try {
          window.localStorage.setItem('bondr_srm_user_v8', JSON.stringify(updated));
        } catch (e) {
          // ignore
        }
        return updated;
      });
    },
    [setCurrentUser]
  );

  const updateUserProfile = useCallback(
    (updates) => {
      setCurrentUser((prev) => {
        const updated = { ...prev, ...updates };
        try {
          window.localStorage.setItem('bondr_srm_user_v8', JSON.stringify(updated));
        } catch (e) {
          // ignore
        }
        return updated;
      });

      setStudents((prev) => {
        const safe = Array.isArray(prev) ? prev : [];
        const next = safe.map((s) => (s.id === currentUser.id ? { ...s, ...updates } : s));
        try {
          window.localStorage.setItem('bondr_srm_students_v8', JSON.stringify(next));
        } catch (e) {
          // ignore
        }
        return next;
      });

      toast.success('Profile details updated successfully!');
      upsertProfileToCloud({ ...currentUser, ...updates });
    },
    [currentUser, setCurrentUser, setStudents]
  );

  const loginAsUser = useCallback(
    (userProfile) => {
      const loggedUser = {
        ...userProfile,
        isGuest: false,
      };
      setCurrentUser(loggedUser);

      // Make sure this student exists in the public directory and persist immediately
      setStudents((prev) => {
        const safe = Array.isArray(prev) ? prev : [];
        const idx = safe.findIndex(
          (s) =>
            s.id === loggedUser.id ||
            (s.email && s.email.toLowerCase() === loggedUser.email?.toLowerCase()) ||
            (s.rollNumber && s.rollNumber.toLowerCase() === loggedUser.rollNumber?.toLowerCase())
        );

        let next;
        if (idx >= 0) {
          next = [...safe];
          next[idx] = { ...next[idx], ...loggedUser };
        } else {
          next = [loggedUser, ...safe];
        }

        try {
          window.localStorage.setItem('bondr_srm_students_v8', JSON.stringify(next));
        } catch (e) {
          console.warn('Direct save students error:', e);
        }
        return next;
      });

      try {
        window.localStorage.setItem('bondr_srm_user_v8', JSON.stringify(loggedUser));
      } catch (e) {
        console.warn('Direct save user error:', e);
      }

      toast.success(`Welcome, ${userProfile.name}!`);
    },
    [setCurrentUser, setStudents]
  );

  // 1-on-1 Direct Messaging
  const sendMessage = useCallback(
    (studentId, text, isMeetup = false) => {
      if (!text || !text.trim() || !currentUser || currentUser.isGuest) return;

      const userMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        senderId: currentUser.id,
        text: text.trim(),
        isMeetup,
        createdAt: new Date().toISOString(),
        read: false,
        readBy: [currentUser.id],
      };

      const threadKey = [currentUser.id, studentId].sort().join('__');

      setMessages((prev) => {
        const safe = prev || {};
        const existingA = safe[threadKey] || [];
        const existingB = safe[studentId] || [];
        const existingC = safe[currentUser.id] || [];

        const seenIds = new Set();
        const merged = [];
        [...existingA, ...existingB, ...existingC].forEach((m) => {
          if (m && m.id && !seenIds.has(m.id)) {
            if (m.senderId === currentUser.id || m.senderId === studentId) {
              seenIds.add(m.id);
              merged.push(m);
            }
          }
        });

        const newThread = [...merged, userMsg];

        insertMessageToCloud(threadKey, userMsg);

        return {
          ...safe,
          [threadKey]: newThread,
          [studentId]: newThread,
        };
      });
    },
    [currentUser, setMessages]
  );

  // Group Messaging
  const sendGroupMessage = useCallback(
    (groupId, text) => {
      if (!text || !text.trim()) return;

      const groupMsg = {
        id: `gmsg-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.image || null,
        senderRole: currentUser.isGuest ? 'Guest' : 'Member',
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };

      setGroupMessages((prev) => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), groupMsg],
      }));
    },
    [currentUser, setGroupMessages]
  );

  const createGroup = useCallback(
    (groupData) => {
      const newGroup = {
        ...groupData,
        id: `grp-${Date.now()}`,
        memberIds: [currentUser.id],
        memberCount: 1,
      };
      setGroups((prev) => [newGroup, ...prev]);
      setGroupMessages((prev) => ({
        ...prev,
        [newGroup.id]: [
          {
            id: `gmsg-${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.image || null,
            senderRole: 'Founder',
            text: `Welcome to ${newGroup.name}! ${newGroup.description}`,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
      toast.success(`Group "${newGroup.name}" created!`);
      return newGroup;
    },
    [currentUser, setGroups, setGroupMessages]
  );

  const acceptedConnections = useMemo(() => {
    if (!currentUser || currentUser.isGuest) return [];
    return (Array.isArray(connections) ? connections : []).filter((c) => {
      if (!c || c.status !== 'accepted') return false;
      if (c.fromUserId && c.toUserId) {
        return c.fromUserId === currentUser.id || c.toUserId === currentUser.id;
      }
      return c.studentId !== currentUser.id;
    });
  }, [connections, currentUser]);

  const pendingConnections = useMemo(() => {
    if (!currentUser || currentUser.isGuest) return [];
    return (Array.isArray(connections) ? connections : []).filter((c) => {
      if (!c || c.status !== 'pending') return false;
      if (c.fromUserId && c.toUserId) {
        return c.toUserId === currentUser.id; // Received by current user
      }
      return c.direction === 'received' && c.studentId !== currentUser.id;
    });
  }, [connections, currentUser]);

  const sentConnections = useMemo(() => {
    if (!currentUser || currentUser.isGuest) return [];
    return (Array.isArray(connections) ? connections : []).filter((c) => {
      if (!c || c.status !== 'pending') return false;
      if (c.fromUserId && c.toUserId) {
        return c.fromUserId === currentUser.id; // Sent by current user
      }
      return c.direction === 'sent' && c.studentId !== currentUser.id;
    });
  }, [connections, currentUser]);

  const userConnectionsCount = useMemo(() => {
    if (!currentUser || currentUser.isGuest) return 0;
    return pendingConnections.length;
  }, [currentUser, pendingConnections]);

  const markMessagesAsRead = useCallback(
    (studentId) => {
      if (!currentUser || currentUser.isGuest || !studentId) return;
      const currentId = currentUser.id;
      const threadKey = [currentId, studentId].sort().join('__');

      setMessages((prev) => {
        if (!prev) return prev;
        let hasChanged = false;
        const updated = { ...prev };

        Object.keys(updated).forEach((key) => {
          const thread = updated[key];
          if (!Array.isArray(thread) || thread.length === 0) return;

          let threadModified = false;
          const newThread = thread.map((msg) => {
            if (!msg) return msg;
            if (msg.senderId === studentId) {
              const alreadyReadByMe =
                msg.read === true &&
                Array.isArray(msg.readBy) &&
                msg.readBy.includes(currentId);

              if (!alreadyReadByMe) {
                threadModified = true;
                hasChanged = true;
                const newReadBy = Array.isArray(msg.readBy) ? [...msg.readBy] : [];
                if (!newReadBy.includes(currentId)) {
                  newReadBy.push(currentId);
                }
                return {
                  ...msg,
                  read: true,
                  readBy: newReadBy,
                };
              }
            }
            return msg;
          });

          if (threadModified) {
            updated[key] = newThread;
          }
        });

        // Also ensure canonical threadKey has the updated read messages
        if (updated[threadKey]) {
          updated[threadKey] = updated[threadKey].map((m) =>
            m && m.senderId === studentId
              ? {
                  ...m,
                  read: true,
                  readBy: Array.isArray(m.readBy)
                    ? m.readBy.includes(currentId)
                      ? m.readBy
                      : [...m.readBy, currentId]
                    : [currentId],
                }
              : m
          );
        }

        markMessagesReadInCloud(threadKey, studentId, currentId);

        if (!hasChanged) return prev;
        return updated;
      });
    },
    [currentUser, setMessages]
  );

  const unreadMessagesCount = useMemo(() => {
    if (!currentUser || currentUser.isGuest) return 0;
    const safeMessages = messages || {};
    const currentId = currentUser.id;
    const countedMsgIds = new Set();
    let count = 0;

    Object.entries(safeMessages).forEach(([key, thread]) => {
      if (!Array.isArray(thread) || thread.length === 0) return;

      const isDualKey = key.includes('__');
      if (isDualKey) {
        if (!key.includes(currentId)) return;
      } else {
        const involvesUser =
          key === currentId ||
          thread.some(
            (m) =>
              m &&
              (m.senderId === currentId ||
                (Array.isArray(m.readBy) && m.readBy.includes(currentId)))
          );
        if (!involvesUser) return;
      }

      thread.forEach((msg) => {
        if (!msg || !msg.id || countedMsgIds.has(msg.id)) return;
        if (msg.senderId && msg.senderId !== currentId) {
          const isRead =
            (msg.read === true && (!msg.readBy || msg.readBy.includes(currentId))) ||
            (Array.isArray(msg.readBy) && msg.readBy.includes(currentId));
          if (!isRead) {
            countedMsgIds.add(msg.id);
            count += 1;
          }
        }
      });
    });

    return count;
  }, [currentUser, messages]);

  const getUnreadCountForStudent = useCallback(
    (studentId) => {
      if (!currentUser || currentUser.isGuest || !studentId) return 0;
      const currentId = currentUser.id;
      const safe = messages || {};
      const countedMsgIds = new Set();
      let count = 0;

      Object.entries(safe).forEach(([key, thread]) => {
        if (!Array.isArray(thread) || thread.length === 0) return;

        const isDualKey = key.includes('__');
        if (isDualKey) {
          if (!key.includes(currentId) || !key.includes(studentId)) return;
        } else {
          if (key !== studentId && key !== currentId) return;
        }

        thread.forEach((msg) => {
          if (!msg || !msg.id || countedMsgIds.has(msg.id)) return;
          if (msg.senderId === studentId) {
            countedMsgIds.add(msg.id);
            const isRead =
              (msg.read === true && (!msg.readBy || msg.readBy.includes(currentId))) ||
              (Array.isArray(msg.readBy) && msg.readBy.includes(currentId));
            if (!isRead) {
              count += 1;
            }
          }
        });
      });

      return count;
    },
    [currentUser, messages]
  );

  const value = {
    students,
    rankedStudents,
    currentUser,
    connections,
    acceptedConnections,
    pendingConnections,
    sentConnections,
    userConnectionsCount,
    unreadMessagesCount,
    getUnreadCountForStudent,
    markMessagesAsRead,
    messages,
    groups,
    groupMessages,
    getConnectionStatus,
    getConnectionDirection,
    sendConnectionRequest,
    acceptConnectionRequest,
    acceptDemoConnection: acceptConnectionRequest,
    cancelConnectionRequest,
    deleteStudentProfile,
    addStudent,
    loginAsUser,
    logoutToGuest,
    updateCurrentUserHobbies,
    updateUserProfile,
    sendMessage,
    sendGroupMessage,
    createGroup,
    isCloudConnected: isSupabaseConfigured(),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
