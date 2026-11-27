import { supabase, isSupabaseConfigured } from './supabaseClient';

// Helper to convert snake_case DB row to camelCase student object
const mapProfileFromDb = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    rollNumber: row.roll_number || '',
    department: row.department || 'Computer Science & Engineering',
    year: row.year || '2nd Year',
    hostel: row.hostel || 'Ganga Hostel',
    image: row.image || null,
    bio: row.bio || row.about_me || '',
    aboutMe: row.about_me || row.bio || '',
    hobbies: Array.isArray(row.hobbies) ? row.hobbies : [],
    goal: row.goal || 'Friendship',
    favouriteActivities: Array.isArray(row.favourite_activities) ? row.favourite_activities : [],
    password: row.password || '',
    isVerified: row.is_verified ?? true,
    isSample: false,
    createdAt: row.created_at,
  };
};

// Helper to convert student object to snake_case DB row
const mapProfileToDb = (student) => {
  return {
    id: student.id,
    name: student.name,
    email: student.email || `${student.name.toLowerCase().replace(/\s+/g, '_')}@srmap.edu.in`,
    roll_number: student.rollNumber || null,
    department: student.department || 'Computer Science & Engineering',
    year: student.year || '2nd Year',
    hostel: student.hostel || 'Ganga Hostel',
    image: student.image || null,
    bio: student.bio || student.aboutMe || '',
    about_me: student.aboutMe || student.bio || '',
    hobbies: Array.isArray(student.hobbies) ? student.hobbies : [],
    goal: student.goal || 'Friendship',
    favourite_activities: Array.isArray(student.favouriteActivities) ? student.favouriteActivities : [],
    password: student.password || '',
    is_verified: true,
  };
};

/* ==============================================================================
   PROFILES
   ============================================================================== */

export async function fetchProfilesFromCloud() {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching profiles from Supabase:', error);
      return [];
    }
    return (data || []).map(mapProfileFromDb).filter(Boolean);
  } catch (err) {
    console.warn('Network error fetching profiles from Supabase:', err);
    return [];
  }
}

export async function upsertProfileToCloud(student) {
  if (!isSupabaseConfigured() || !student?.id) return null;
  try {
    const dbPayload = mapProfileToDb(student);
    const { data, error } = await supabase
      .from('profiles')
      .upsert(dbPayload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error saving profile to Supabase:', error);
      return null;
    }
    return mapProfileFromDb(data);
  } catch (err) {
    console.warn('Network error saving profile to Supabase:', err);
    return null;
  }
}

/* ==============================================================================
   CONNECTIONS
   ============================================================================== */

export async function fetchConnectionsFromCloud() {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching connections from Supabase:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    console.warn('Network error fetching connections:', err);
    return [];
  }
}

export async function upsertConnectionToCloud(conn) {
  if (!isSupabaseConfigured() || !conn) return null;
  try {
    const payload = {
      id: conn.id,
      from_user_id: conn.fromUserId,
      to_user_id: conn.toUserId,
      status: conn.status || 'pending',
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('connections')
      .upsert(payload, { onConflict: 'id' });

    if (error) console.warn('Error upserting connection to Supabase:', error);
  } catch (err) {
    console.warn('Network error upserting connection:', err);
  }
}

export async function removeConnectionFromCloud(id) {
  if (!isSupabaseConfigured() || !id) return;
  try {
    await supabase.from('connections').delete().eq('id', id);
  } catch (err) {
    console.warn('Error removing connection from Supabase:', err);
  }
}

/* ==============================================================================
   MESSAGES
   ============================================================================== */

export async function fetchMessagesFromCloud() {
  if (!isSupabaseConfigured()) return {};
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error fetching messages from Supabase:', error);
      return {};
    }

    // Group messages by thread_key
    const grouped = {};
    (data || []).forEach((row) => {
      const msg = {
        id: row.id,
        senderId: row.sender_id,
        text: row.text,
        isMeetup: row.is_meetup,
        read: row.read,
        readBy: row.read_by || [],
        createdAt: row.created_at,
      };

      if (!grouped[row.thread_key]) {
        grouped[row.thread_key] = [];
      }
      grouped[row.thread_key].push(msg);
    });

    return grouped;
  } catch (err) {
    console.warn('Network error fetching messages:', err);
    return {};
  }
}

export async function insertMessageToCloud(threadKey, msg) {
  if (!isSupabaseConfigured() || !msg || !threadKey) return;
  try {
    const payload = {
      id: msg.id,
      thread_key: threadKey,
      sender_id: msg.senderId,
      text: msg.text,
      is_meetup: msg.isMeetup || false,
      read: msg.read || false,
      read_by: msg.readBy || [],
      created_at: msg.createdAt || new Date().toISOString(),
    };

    const { error } = await supabase.from('messages').insert([payload]);
    if (error) console.warn('Error inserting message to Supabase:', error);
  } catch (err) {
    console.warn('Network error inserting message:', err);
  }
}

export async function markMessagesReadInCloud(threadKey, studentId, readerId) {
  if (!isSupabaseConfigured() || !studentId || !readerId) return;
  try {
    // Find unread messages from studentId in this thread
    const { data } = await supabase
      .from('messages')
      .select('id, read_by')
      .eq('thread_key', threadKey)
      .eq('sender_id', studentId);

    if (data && data.length > 0) {
      for (const m of data) {
        const updatedReadBy = Array.isArray(m.read_by) ? [...m.read_by] : [];
        if (!updatedReadBy.includes(readerId)) {
          updatedReadBy.push(readerId);
        }
        await supabase
          .from('messages')
          .update({ read: true, read_by: updatedReadBy })
          .eq('id', m.id);
      }
    }
  } catch (err) {
    console.warn('Error marking messages read in Supabase:', err);
  }
}

/* ==============================================================================
   REALTIME SUBSCRIPTIONS
   ============================================================================== */

export function subscribeToCloudChanges({ onProfileChange, onConnectionChange, onMessageInsert, onMessageUpdate }) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('bondr-realtime-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profiles' },
      (payload) => {
        if (onProfileChange) onProfileChange(payload);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'connections' },
      (payload) => {
        if (onConnectionChange) onConnectionChange(payload);
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        if (onMessageInsert) onMessageInsert(payload.new);
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'messages' },
      (payload) => {
        if (onMessageUpdate) onMessageUpdate(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
