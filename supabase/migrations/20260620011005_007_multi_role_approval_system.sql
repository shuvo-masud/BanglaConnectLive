-- Multi-role support and approval workflow
-- Change role to roles array and add admin_status

-- Add roles array column (supports multiple roles per user)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles text[] DEFAULT ARRAY['student']::text[];

-- Add admin_status for admin approval workflow
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_status text DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected'));

-- Add is_owner flag for the super admin
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_owner boolean DEFAULT false;

-- Migrate existing role data to roles array
UPDATE profiles SET roles = ARRAY[role] WHERE roles = ARRAY['student']::text[] OR roles IS NULL;

-- Add constraint for valid roles
ALTER TABLE profiles ADD CONSTRAINT valid_roles CHECK (roles::text[] <@ ARRAY['student', 'mentor', 'admin', 'owner']::text[]);

-- Update mentor_status constraint to include valid values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS mentor_status_check;
ALTER TABLE profiles ADD CONSTRAINT mentor_status_check CHECK (mentor_status IN ('pending', 'approved', 'rejected'));

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON profiles USING GIN (roles);
CREATE INDEX IF NOT EXISTS idx_profiles_mentor_status ON profiles(mentor_status);
CREATE INDEX IF NOT EXISTS idx_profiles_admin_status ON profiles(admin_status);

-- RLS Policies for role-based access
-- Drop existing policies
DROP POLICY IF EXISTS select_profiles ON profiles;
DROP POLICY IF EXISTS profiles_select_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
DROP POLICY IF EXISTS update_own_profile ON profiles;
DROP POLICY IF EXISTS insert_own_profile ON profiles;

-- Users can view all profiles but with restrictions
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated
  USING (
    -- Owner can see all
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_owner = true)
    OR
    -- Admin can see all approved profiles
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND 'admin' = ANY(p.roles) AND p.admin_status = 'approved')
    OR
    -- Regular users can see approved mentors
    ('mentor' = ANY(roles) AND mentor_status = 'approved')
    OR
    -- Users can see their own profile
    auth.uid() = id
    OR
    -- Regular users can see other non-mentor profiles (students)
    (NOT ('mentor' = ANY(roles)))
  );

-- Users can update their own profile (but not roles/status)
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only owner can update roles and status fields
CREATE POLICY "profiles_update_roles_owner" ON profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_owner = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_owner = true));

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Function to check if user has active role
CREATE OR REPLACE FUNCTION has_active_role(check_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid()
    AND check_role = ANY(roles)
    AND (
      check_role = 'student' 
      OR (check_role = 'mentor' AND mentor_status = 'approved')
      OR (check_role = 'admin' AND admin_status = 'approved')
      OR (check_role = 'owner' AND is_owner = true)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active roles
CREATE OR REPLACE FUNCTION get_active_roles()
RETURNS text[] AS $$
DECLARE
  user_roles text[];
  result_roles text[] := ARRAY[]::text[];
BEGIN
  SELECT roles INTO user_roles FROM profiles WHERE id = auth.uid();
  
  IF user_roles IS NULL THEN
    RETURN result_roles;
  END IF;
  
  -- Student is always active
  IF 'student' = ANY(user_roles) THEN
    result_roles := array_append(result_roles, 'student');
  END IF;
  
  -- Mentor only if approved
  IF 'mentor' = ANY(user_roles) AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND mentor_status = 'approved') THEN
    result_roles := array_append(result_roles, 'mentor');
  END IF;
  
  -- Admin only if approved
  IF 'admin' = ANY(user_roles) AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin_status = 'approved') THEN
    result_roles := array_append(result_roles, 'admin');
  END IF;
  
  -- Owner always active
  IF 'owner' = ANY(user_roles) AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true) THEN
    result_roles := array_append(result_roles, 'owner');
  END IF;
  
  RETURN result_roles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
