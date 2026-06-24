-- Add specialty column for mentors
ALTER TABLE profiles ADD COLUMN specialty TEXT[];

-- Add profession column for professionals  
ALTER TABLE profiles ADD COLUMN profession TEXT;

-- Add index for faster specialty queries
CREATE INDEX idx_profiles_specialty ON profiles USING GIN(specialty);