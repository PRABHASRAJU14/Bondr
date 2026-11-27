-- ==============================================================================
-- BONDR - SRM UNIVERSITY-AP
-- Complete Supabase PostgreSQL Schema & Realtime Setup
-- ==============================================================================
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  roll_number TEXT,
  department TEXT,
  year TEXT,
  hostel TEXT,
  image TEXT,
  bio TEXT,
  about_me TEXT,
  hobbies TEXT[] DEFAULT '{}',
  goal TEXT DEFAULT 'Friendship',
  favourite_activities TEXT[] DEFAULT '{}',
  password TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Create CONNECTIONS table
CREATE TABLE IF NOT EXISTS public.connections (
  id TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Index for fast lookup of connections
CREATE INDEX IF NOT EXISTS idx_connections_users ON public.connections(from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

-- 3. Create MESSAGES table (Direct 1-on-1 Messages)
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  thread_key TEXT NOT NULL,
  sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_meetup BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  read_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Index for fast thread history retrieval
CREATE INDEX IF NOT EXISTS idx_messages_thread_key ON public.messages(thread_key);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- 4. Create GROUPS table (Campus Circles)
CREATE TABLE IF NOT EXISTS public.groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hobby TEXT NOT NULL,
  description TEXT,
  member_count INTEGER DEFAULT 1,
  member_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Create GROUP_MESSAGES table
CREATE TABLE IF NOT EXISTS public.group_messages (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  sender_role TEXT DEFAULT 'Member',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON public.group_messages(group_id);

-- 6. Seed Default SRM AP Campus Groups (if not already seeded)
INSERT INTO public.groups (id, name, hobby, description, member_count, member_ids)
VALUES
  ('grp-photo', '📸 SRM AP Photography Club', 'Photography', 'Golden-hour walks, campus reels, and portrait sessions around Amaravati.', 28, '{}'),
  ('grp-coding', '💻 Hackathon & AI Builders Squad', 'Coding', 'Team formation for Smart India Hackathon, open-source projects & DSA grind.', 34, '{}'),
  ('grp-music', '🎵 Acoustic Jam & Music Circle', 'Music', 'Unwinding with acoustic jams at the amphitheatre steps, indie playlists and song collabs.', 19, '{}'),
  ('grp-study', '📚 Central Library Study Pod', 'Reading', 'Pomodoro study blocks, quiet focus, note swaps & exam preparation in Discussion Room 3.', 22, '{}'),
  ('grp-sports', '🏸 SRM AP Badminton & Turf Squad', 'Sports', 'Evening indoor badminton court rallies, morning 5K runs and turf football.', 31, '{}')
ON CONFLICT (id) DO NOTHING;

-- 7. Enable Row Level Security (RLS) with open campus peer policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for authenticated campus web app (safe re-run)
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on profiles" ON public.profiles;
CREATE POLICY "Allow public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on profiles" ON public.profiles;
CREATE POLICY "Allow public update on profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on profiles" ON public.profiles;
CREATE POLICY "Allow public delete on profiles" ON public.profiles FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on connections" ON public.connections;
CREATE POLICY "Allow public read on connections" ON public.connections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on connections" ON public.connections;
CREATE POLICY "Allow public insert on connections" ON public.connections FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on connections" ON public.connections;
CREATE POLICY "Allow public update on connections" ON public.connections FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on connections" ON public.connections;
CREATE POLICY "Allow public delete on connections" ON public.connections FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on messages" ON public.messages;
CREATE POLICY "Allow public read on messages" ON public.messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on messages" ON public.messages;
CREATE POLICY "Allow public insert on messages" ON public.messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on messages" ON public.messages;
CREATE POLICY "Allow public update on messages" ON public.messages FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read on groups" ON public.groups;
CREATE POLICY "Allow public read on groups" ON public.groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on groups" ON public.groups;
CREATE POLICY "Allow public insert on groups" ON public.groups FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on group_messages" ON public.group_messages;
CREATE POLICY "Allow public read on group_messages" ON public.group_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on group_messages" ON public.group_messages;
CREATE POLICY "Allow public insert on group_messages" ON public.group_messages FOR INSERT WITH CHECK (true);

-- 8. Enable Realtime Publications on tables so live updates push to clients instantly (safe re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'connections'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'group_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
  END IF;
END $$;
