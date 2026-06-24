-- Update roles to include admin
ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('student', 'mentor', 'professional', 'admin'));

-- Add mentor_status for approval system
ALTER TABLE profiles ADD COLUMN mentor_status TEXT DEFAULT 'pending' CHECK (mentor_status IN ('pending', 'approved', 'rejected'));

-- Update existing profiles
UPDATE profiles SET mentor_status = 'approved' WHERE role = 'mentor';
UPDATE profiles SET mentor_status = NULL WHERE role != 'mentor';

-- Jobs Table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'internship', 'remote')),
  category TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  salary_range TEXT,
  requirements TEXT,
  employer_id UUID REFERENCES profiles(id) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog/News Posts Table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'blog' CHECK (type IN ('blog', 'news')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES profiles(id) NOT NULL,
  featured_image_url TEXT,
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  is_online BOOLEAN DEFAULT false,
  stream_url TEXT,
  is_live BOOLEAN DEFAULT false,
  organizer_id UUID REFERENCES profiles(id) NOT NULL,
  image_url TEXT,
  max_attendees INTEGER,
  attendee_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Conversations Table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID REFERENCES profiles(id) NOT NULL,
  participant2_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id),
  CHECK (participant1_id != participant2_id)
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vault Items Table
CREATE TABLE vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT DEFAULT 'project' CHECK (item_type IN ('project', 'idea', 'portfolio', 'note', 'other')),
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  file_urls TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets Table
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  attachment_urls TEXT[] DEFAULT '{}',
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Jobs RLS Policies
CREATE POLICY "jobs_select_published" ON jobs FOR SELECT
  TO authenticated USING (is_active = true OR employer_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "jobs_insert_authenticated" ON jobs FOR INSERT
  TO authenticated WITH CHECK (employer_id = auth.uid());

CREATE POLICY "jobs_update_own" ON jobs FOR UPDATE
  TO authenticated USING (employer_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "jobs_delete_own" ON jobs FOR DELETE
  TO authenticated USING (employer_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Posts RLS Policies
CREATE POLICY "posts_select_published" ON posts FOR SELECT
  TO authenticated USING (is_published = true OR author_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "posts_insert_authenticated" ON posts FOR INSERT
  TO authenticated WITH CHECK (author_id = auth.uid());

CREATE POLICY "posts_update_own" ON posts FOR UPDATE
  TO authenticated USING (author_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "posts_delete_own" ON posts FOR DELETE
  TO authenticated USING (author_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Events RLS Policies
CREATE POLICY "events_select_all" ON events FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "events_insert_authenticated" ON events FOR INSERT
  TO authenticated WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "events_update_own" ON events FOR UPDATE
  TO authenticated USING (organizer_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "events_delete_own" ON events FOR DELETE
  TO authenticated USING (organizer_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Event RSVPs RLS Policies
CREATE POLICY "rsvps_select_all" ON event_rsvps FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "rsvps_insert_own" ON event_rsvps FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "rsvps_update_own" ON event_rsvps FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "rsvps_delete_own" ON event_rsvps FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- Conversations RLS Policies
CREATE POLICY "conversations_select_participant" ON conversations FOR SELECT
  TO authenticated USING (participant1_id = auth.uid() OR participant2_id = auth.uid());

CREATE POLICY "conversations_insert_authenticated" ON conversations FOR INSERT
  TO authenticated WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- Messages RLS Policies
CREATE POLICY "messages_select_participant" ON messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = messages.conversation_id 
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_participant" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    sender_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = messages.conversation_id 
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

-- Vault Items RLS Policies
CREATE POLICY "vault_select_public_own" ON vault_items FOR SELECT
  TO authenticated USING (visibility = 'public' OR owner_id = auth.uid());

CREATE POLICY "vault_insert_own" ON vault_items FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "vault_update_own" ON vault_items FOR UPDATE
  TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "vault_delete_own" ON vault_items FOR DELETE
  TO authenticated USING (owner_id = auth.uid());

-- Support Tickets RLS Policies
CREATE POLICY "tickets_select_own_or_admin" ON support_tickets FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR assigned_to = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "tickets_insert_authenticated" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "tickets_update_own_or_admin" ON support_tickets FOR UPDATE
  TO authenticated USING (user_id = auth.uid() OR assigned_to = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create indexes for performance
CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_active ON jobs(is_active, created_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_type ON posts(type, created_at DESC);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_vault_owner ON vault_items(owner_id);
CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);