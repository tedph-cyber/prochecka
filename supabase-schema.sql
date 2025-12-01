-- T2D Nudge Chatbot Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

-- Create user_profiles table (for usernames and additional user data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_final BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create action_plans table
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  factor TEXT NOT NULL,
  plan_message TEXT NOT NULL,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create guest_sessions table (for anonymous assessments)
CREATE TABLE IF NOT EXISTS guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  assessment_data JSONB,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  converted_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- ============================================
-- INDEXES
-- ============================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON chat_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_action_plans_user_id ON action_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_token ON guest_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires ON guest_sessions(expires_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - user_profiles
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;

-- Allow users to view all profiles (for username lookups)
CREATE POLICY "Anyone can view user profiles"
  ON user_profiles FOR SELECT
  USING (true);

-- Allow authenticated users and service role to insert profiles
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- RLS POLICIES - chat_history
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_history;
DROP POLICY IF EXISTS "Users can delete their own chat history" ON chat_history;

-- Allow users to view their own chat history
CREATE POLICY "Users can view their own chat history"
  ON chat_history FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own chat history
CREATE POLICY "Users can delete their own chat history"
  ON chat_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - action_plans
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own action plan" ON action_plans;
DROP POLICY IF EXISTS "Users can insert their own action plan" ON action_plans;
DROP POLICY IF EXISTS "Users can update their own action plan" ON action_plans;

-- Allow users to view their own action plan
CREATE POLICY "Users can view their own action plan"
  ON action_plans FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own action plan
CREATE POLICY "Users can insert their own action plan"
  ON action_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own action plan
CREATE POLICY "Users can update their own action plan"
  ON action_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - guest_sessions
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view guest sessions" ON guest_sessions;
DROP POLICY IF EXISTS "Anyone can create guest sessions" ON guest_sessions;
DROP POLICY IF EXISTS "Anyone can update guest sessions" ON guest_sessions;

-- Allow anyone to read their own guest session (public access for guests)
CREATE POLICY "Anyone can view guest sessions"
  ON guest_sessions FOR SELECT
  USING (true);

-- Allow anyone to insert guest sessions
CREATE POLICY "Anyone can create guest sessions"
  ON guest_sessions FOR INSERT
  WITH CHECK (true);

-- Allow updating guest sessions (for conversion)
CREATE POLICY "Anyone can update guest sessions"
  ON guest_sessions FOR UPDATE
  USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to clean up expired guest sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_guest_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM guest_sessions
  WHERE expires_at < NOW();
END;
$$;

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  random_username TEXT;
  username_exists BOOLEAN;
BEGIN
  -- Generate a random username if not provided
  LOOP
    random_username := 'user_' || substr(md5(random()::text), 1, 8);
    SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE username = random_username) INTO username_exists;
    EXIT WHEN NOT username_exists;
  END LOOP;
  
  -- Insert the profile with generated username (bypasses RLS with SECURITY DEFINER)
  INSERT INTO public.user_profiles (id, username, display_name)
  VALUES (
    NEW.id,
    random_username,
    COALESCE(NEW.raw_user_meta_data->>'username', random_username)
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Could not create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ============================================

-- Verify tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- View all policies
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
