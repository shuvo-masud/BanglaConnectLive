-- BanglaConnect Core Features Schema - Extension
-- Contacts, Groups, Calls, Wallet, Community Feeds

-- ============================================
-- ADD NEW PROFILE FIELDS
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diaspora_country VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_district VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS qr_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Update interests column to JSONB if it's text[]
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests' AND data_type = 'ARRAY') THEN
    ALTER TABLE profiles RENAME COLUMN interests TO interests_old;
    ALTER TABLE profiles ADD COLUMN interests JSONB DEFAULT '[]';
    UPDATE profiles SET interests = '[]'::jsonb WHERE interests IS NULL;
    ALTER TABLE profiles DROP COLUMN interests_old;
  END IF;
END $$;

-- ============================================
-- CONTACTS SYSTEM
-- ============================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20),
  name VARCHAR(255),
  is_registered BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_contact_user ON contacts(contact_user_id);
CREATE INDEX idx_contacts_phone ON contacts(phone_number);

-- Contact requests
CREATE TABLE contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

CREATE INDEX idx_contact_requests_receiver ON contact_requests(receiver_id);

-- ============================================
-- GROUPS & DIASPORA COMMUNITIES
-- ============================================

CREATE TABLE community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'community' CHECK (type IN ('diaspora', 'regional', 'interest', 'family', 'community')),
  category VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  district VARCHAR(100),
  avatar_url TEXT,
  cover_url TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_community_groups_type ON community_groups(type);
CREATE INDEX idx_community_groups_country ON community_groups(country);

-- Group members
CREATE TABLE community_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_user ON community_group_members(user_id);
CREATE INDEX idx_group_members_group ON community_group_members(group_id);

-- ============================================
-- CALLS SYSTEM
-- ============================================

CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL REFERENCES auth.users(id),
  receiver_id UUID REFERENCES auth.users(id),
  group_id UUID REFERENCES community_groups(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('voice', 'video')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('initiated', 'ringing', 'answered', 'ended', 'missed', 'rejected')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  cost_credits INTEGER DEFAULT 0,
  call_quality VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calls_caller ON calls(caller_id);
CREATE INDEX idx_calls_receiver ON calls(receiver_id);
CREATE INDEX idx_calls_created ON calls(created_at DESC);

-- ============================================
-- DIGITAL WALLET / CREDITS
-- ============================================

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'BDT',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('topup', 'call_charge', 'transfer', 'refund', 'reward', 'purchase')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_user ON wallets(user_id);
CREATE INDEX idx_wallet_trans_wallet ON wallet_transactions(wallet_id);

-- Top-up packages
CREATE TABLE topup_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  credits INTEGER NOT NULL,
  price_bdt DECIMAL(10, 2) NOT NULL,
  bonus_credits INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMUNITY FEEDS (extend existing posts)
-- ============================================

-- Add new columns to posts table for feed functionality
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_type VARCHAR(20) DEFAULT 'blog';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'group', 'private'));
ALTER TABLE posts ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Post likes
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Post comments
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_view_own_contacts" ON contacts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_contacts" ON contacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_contacts" ON contacts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own_contacts" ON contacts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Contact Requests
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_sent_or_received_requests" ON contact_requests FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "send_contact_request" ON contact_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "update_received_request" ON contact_requests FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

-- Community Groups
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_public_groups" ON community_groups FOR SELECT TO authenticated USING (is_private = FALSE OR EXISTS (
  SELECT 1 FROM community_group_members WHERE group_id = community_groups.id AND user_id = auth.uid()
));
CREATE POLICY "create_group" ON community_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "update_group_as_owner" ON community_groups FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM community_group_members WHERE group_id = community_groups.id AND user_id = auth.uid() AND role = 'owner')
);

-- Group Members
ALTER TABLE community_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_group_members_public" ON community_group_members FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM community_groups WHERE community_groups.id = community_group_members.group_id AND (is_private = FALSE OR EXISTS (
    SELECT 1 FROM community_group_members gm WHERE gm.group_id = community_group_members.group_id AND gm.user_id = auth.uid()
  )))
);
CREATE POLICY "join_group" ON community_group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Calls
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_own_calls" ON calls FOR SELECT TO authenticated USING (auth.uid() = caller_id OR auth.uid() = receiver_id);
CREATE POLICY "initiate_call" ON calls FOR INSERT TO authenticated WITH CHECK (auth.uid() = caller_id);
CREATE POLICY "update_call" ON calls FOR UPDATE TO authenticated USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Wallets
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_own_wallet" ON wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Wallet Transactions
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_own_transactions" ON wallet_transactions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM wallets WHERE wallets.id = wallet_transactions.wallet_id AND user_id = auth.uid())
);

-- Topup Packages
ALTER TABLE topup_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_active_packages" ON topup_packages FOR SELECT TO authenticated USING (is_active = TRUE);

-- Post Likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_likes" ON post_likes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "like_post" ON post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "unlike_post" ON post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Post Comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_comments" ON post_comments FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "comment_on_post" ON post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "delete_own_comment" ON post_comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Insert default topup packages
INSERT INTO topup_packages (name, credits, price_bdt, bonus_credits) VALUES
('Starter', 100, 50, 0),
('Basic', 500, 200, 25),
('Standard', 1000, 400, 100),
('Premium', 2500, 900, 350),
('Unlimited', 5000, 1500, 1000);
