-- =====================================================
-- PROCHECKA COMPLETE DATABASE SCHEMA
-- Includes: User Profiles, Medical Info, Reminders, Education Progress
-- =====================================================

-- Drop existing tables if needed (CAREFUL IN PRODUCTION!)
-- DROP TABLE IF EXISTS reminders CASCADE;
-- DROP TABLE IF EXISTS emergency_contacts CASCADE;
-- DROP TABLE IF EXISTS health_logs CASCADE;
-- DROP TABLE IF EXISTS education_progress CASCADE;

-- =====================================================
-- 1. ENHANCED USER PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns if they don't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Medical Information
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bmi DECIMAL(4,2);

-- Diabetes-specific
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS diabetes_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS diagnosis_date DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_medications JSONB DEFAULT '[]';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS allergies TEXT[];

-- Emergency Contact Info
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

-- Insurance & Healthcare Provider
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS insurance_provider TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS primary_doctor_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS primary_doctor_phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_hospital TEXT;

-- Next of Kin
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS next_of_kin_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS next_of_kin_phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS next_of_kin_relationship TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS next_of_kin_address TEXT;

-- Preferences
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}';

-- =====================================================
-- 2. EMERGENCY CONTACTS TABLE (Multiple contacts)
-- =====================================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. HEALTH LOGS TABLE (Daily tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  log_time TIME NOT NULL DEFAULT CURRENT_TIME,
  
  -- Glucose Monitoring
  blood_sugar_mg_dl DECIMAL(5,1),
  measurement_type TEXT CHECK (measurement_type IN ('fasting', 'before_meal', 'after_meal', 'bedtime', 'random')),
  
  -- Vitals
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  temperature_celsius DECIMAL(4,2),
  
  -- Lifestyle
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  carbs_grams DECIMAL(5,1),
  exercise_type TEXT,
  exercise_duration_minutes INTEGER,
  
  -- Medication
  medication_taken BOOLEAN DEFAULT false,
  medication_name TEXT,
  medication_dose TEXT,
  
  -- Symptoms & Notes
  symptoms TEXT[],
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. REMINDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  reminder_type TEXT CHECK (reminder_type IN ('medication', 'meal', 'exercise', 'checkup', 'custom')),
  reminder_time TIME NOT NULL,
  
  -- Recurrence
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Monday, 7=Sunday
  is_recurring BOOLEAN DEFAULT true,
  
  -- Status
  is_enabled BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  
  -- Additional Info
  description TEXT,
  notification_method TEXT[] DEFAULT ARRAY['push'], -- 'push', 'email', 'sms'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. EDUCATION PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS education_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  article_title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. CHAT HISTORY TABLE (already exists, but enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ACTION PLANS TABLE (enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_level TEXT CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Very High')),
  
  -- PIMA Assessment Data
  pima_data JSONB, -- Stores all 8 PIMA inputs
  
  -- Recommendations
  primary_risk_factor TEXT,
  recommendations TEXT[],
  diet_plan JSONB,
  exercise_plan JSONB,
  
  -- Tasks
  tasks JSONB DEFAULT '[]',
  
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. GUEST SESSIONS TABLE (already exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_health_logs_user_date ON health_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_education_progress_user ON education_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_plans_user ON action_plans(user_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can manage own health logs" ON health_logs;
DROP POLICY IF EXISTS "Users can manage own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can manage own education progress" ON education_progress;
DROP POLICY IF EXISTS "Users can manage own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can manage own action plans" ON action_plans;
DROP POLICY IF EXISTS "Anyone can access guest sessions" ON guest_sessions;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Emergency Contacts Policies
CREATE POLICY "Users can manage own emergency contacts"
  ON emergency_contacts FOR ALL
  USING (auth.uid() = user_id);

-- Health Logs Policies
CREATE POLICY "Users can manage own health logs"
  ON health_logs FOR ALL
  USING (auth.uid() = user_id);

-- Reminders Policies
CREATE POLICY "Users can manage own reminders"
  ON reminders FOR ALL
  USING (auth.uid() = user_id);

-- Education Progress Policies
CREATE POLICY "Users can manage own education progress"
  ON education_progress FOR ALL
  USING (auth.uid() = user_id);

-- Chat History Policies
CREATE POLICY "Users can manage own chat history"
  ON chat_history FOR ALL
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Action Plans Policies
CREATE POLICY "Users can manage own action plans"
  ON action_plans FOR ALL
  USING (auth.uid() = user_id);

-- Guest Sessions Policies (open access for guest functionality)
CREATE POLICY "Anyone can access guest sessions"
  ON guest_sessions FOR ALL
  USING (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_plans_updated_at
  BEFORE UPDATE ON action_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.height_cm IS NOT NULL AND NEW.weight_kg IS NOT NULL AND NEW.height_cm > 0 THEN
    NEW.bmi = NEW.weight_kg / ((NEW.height_cm / 100) ^ 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_user_bmi
  BEFORE INSERT OR UPDATE OF height_cm, weight_kg ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_bmi();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample reminder types for a test user (replace UUID with actual user ID)
-- INSERT INTO reminders (user_id, title, reminder_type, reminder_time, days_of_week)
-- VALUES 
--   ('YOUR-USER-UUID-HERE', 'Morning Insulin', 'medication', '08:00:00', ARRAY[1,2,3,4,5,6,7]),
--   ('YOUR-USER-UUID-HERE', 'Lunch Time', 'meal', '12:30:00', ARRAY[1,2,3,4,5,6,7]),
--   ('YOUR-USER-UUID-HERE', 'Evening Walk', 'exercise', '18:00:00', ARRAY[1,2,3,4,5]);

-- =====================================================
-- CLEANUP OLD DATA (Run periodically)
-- =====================================================

-- Delete expired guest sessions
-- DELETE FROM guest_sessions WHERE expires_at < NOW();

-- Delete old health logs (keep last 90 days)
-- DELETE FROM health_logs WHERE log_date < CURRENT_DATE - INTERVAL '90 days';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON emergency_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON health_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON reminders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON education_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON action_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON guest_sessions TO anon, authenticated;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
