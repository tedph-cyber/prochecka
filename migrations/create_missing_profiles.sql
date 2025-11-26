-- Migration script to create profiles for existing users
-- Run this in Supabase SQL Editor if you have users without profiles

-- This will create user_profiles for all auth.users that don't have one yet
INSERT INTO public.user_profiles (id, username, display_name, created_at, updated_at)
SELECT 
  u.id,
  'user_' || SUBSTRING(u.id::text, 1, 8) as username,  -- Generate username from user ID
  NULL as display_name,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Verify the migration
SELECT COUNT(*) as users_without_profiles
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Should return 0 if migration was successful
