-- Add missing specialty and profession columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialty TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profession TEXT;

-- Update mentor_status constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_mentor_status_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_mentor_status_check 
  CHECK (mentor_status IS NULL OR mentor_status IN ('pending', 'approved', 'rejected'));

-- Fix profiles RLS - ensure policies exist
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
  DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
  DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
  
  -- Create proper policies
  CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
    TO authenticated USING (true);
    
  CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
END $$;