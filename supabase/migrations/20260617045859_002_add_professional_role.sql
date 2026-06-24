-- Add 'professional' to the role check constraint
ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('student', 'mentor', 'professional'));