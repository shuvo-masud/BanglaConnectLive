-- Create profiles table that extends auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  country_of_residence TEXT NOT NULL,
  professional_field TEXT,
  job_title TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor')),
  mentorship_available BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Create mentorship_requests table
CREATE TABLE mentorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, mentor_id)
);

-- Enable RLS
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

-- Mentorship requests policies
CREATE POLICY "select_own_requests" ON mentorship_requests FOR SELECT
  TO authenticated USING (auth.uid() = student_id OR auth.uid() = mentor_id);

CREATE POLICY "insert_student_request" ON mentorship_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "update_mentor_request" ON mentorship_requests FOR UPDATE
  TO authenticated USING (auth.uid() = mentor_id) WITH CHECK (auth.uid() = mentor_id);

-- Create saved_mentors table
CREATE TABLE saved_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, mentor_id)
);

-- Enable RLS
ALTER TABLE saved_mentors ENABLE ROW LEVEL SECURITY;

-- Saved mentors policies
CREATE POLICY "select_own_saved" ON saved_mentors FOR SELECT
  TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "insert_own_saved" ON saved_mentors FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "delete_own_saved" ON saved_mentors FOR DELETE
  TO authenticated USING (auth.uid() = student_id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_mentorship_requests_updated_at
  BEFORE UPDATE ON mentorship_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create index for faster queries
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_country ON profiles(country_of_residence);
CREATE INDEX idx_profiles_mentorship_available ON profiles(mentorship_available);
CREATE INDEX idx_mentorship_requests_student ON mentorship_requests(student_id);
CREATE INDEX idx_mentorship_requests_mentor ON mentorship_requests(mentor_id);