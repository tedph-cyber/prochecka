# 🚀 Quick Setup Guide - T2D Nudge Chatbot

Follow these steps to get your application running in ~10 minutes!

## Step 1: Configure Supabase (5 minutes)

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Name: `t2d-nudge-chatbot`
   - Database Password: (save this securely!)
   - Region: Choose closest to you
4. Click "Create new project" and wait ~2 minutes

### 1.2 Get Your Keys
1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values:
   - `Project URL` (looks like: `https://xxxxx.supabase.co`)
   - `anon/public key` (long string starting with `eyJ...`)

### 1.3 Update .env.local
Open `.env.local` and replace:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-actual-key
```

### 1.4 Create Database Tables
1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste into the SQL Editor
5. Click "Run" (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned"

✅ **Verification**: Go to **Table Editor** and you should see:
- `chat_history` table
- `action_plans` table

## Step 2: Enable Authentication (2 minutes)

### 2.1 Email Authentication (Already Enabled!)
Email/password auth is enabled by default. You're good to go!

### 2.2 Google OAuth (Optional)
If you want Google sign-in:

1. Go to **Authentication** → **Providers**
2. Find "Google" and click to expand
3. Toggle "Enable Sign in with Google"
4. Follow the instructions to create Google OAuth credentials
5. Add redirect URL: `http://localhost:3000/auth/callback`
6. Save

**Note**: You'll handle the full OAuth setup. The placeholders are ready in the code!

## Step 3: Run the Application (1 minute)

```bash
# Install dependencies (if you haven't already)
npm install

# Start the development server
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

## Step 4: Test the Application

### 4.1 Create Account
1. You'll be redirected to sign-in page
2. Click "Sign up"
3. Enter email and password
4. Check your email for confirmation (or disable confirmation in Supabase)

### 4.2 Complete Assessment
1. After signing in, you'll land on the dashboard
2. The chatbot will ask 8 questions about health metrics
3. Answer with realistic numbers (use these examples):
   - Pregnancies: 0-5
   - Glucose: 70-200
   - Blood Pressure: 60-120
   - Skin Thickness: 10-50
   - Insulin: 0-300
   - BMI: 18-40
   - Diabetes Pedigree: 0.1-2.0
   - Age: 21-70

### 4.3 View Action Plan
1. After answering all questions, check the right sidebar
2. Your risk score and personalized tasks will appear
3. Click checkboxes to mark tasks complete

### 4.4 Test Emergency Button
1. Look for the red pulsing button in bottom-right corner
2. Hover to see tooltip
3. (Don't click unless you need help - it dials 911!)

## 🎯 What You Built

### Core Features
✅ Full authentication flow (email + OAuth ready)
✅ Sequential health assessment (8 PIMA questions)
✅ Risk prediction algorithm
✅ Personalized action plans
✅ Task tracking with progress bar
✅ Emergency help button
✅ Persistent data storage
✅ User-specific data isolation

### Security Features
✅ Row Level Security (RLS) on all tables
✅ Authenticated API routes
✅ Session management
✅ Secure middleware

## 📊 Sample Test Data

Use these values for testing:

**Low Risk Profile:**
- Pregnancies: 0
- Glucose: 90
- Blood Pressure: 70
- Skin Thickness: 20
- Insulin: 80
- BMI: 22
- Diabetes Pedigree: 0.3
- Age: 25

**High Risk Profile:**
- Pregnancies: 3
- Glucose: 180
- Blood Pressure: 95
- Skin Thickness: 40
- Insulin: 250
- BMI: 38
- Diabetes Pedigree: 1.8
- Age: 55

## 🐛 Troubleshooting

### "Unauthorized" errors
- Check that your Supabase keys are correct in `.env.local`
- Restart your dev server after changing `.env.local`
- Verify RLS policies are applied (run schema again if needed)

### Database connection issues
- Verify your Supabase project is active
- Check Project URL is correct (no trailing slash)
- Ensure you ran the SQL schema

### Authentication not working
- Check email confirmation settings in Supabase
- For testing, disable email confirmation:
  - Go to Authentication → Settings
  - Disable "Enable email confirmations"

### Tables not appearing
- Re-run the SQL schema from `supabase-schema.sql`
- Check for error messages in SQL Editor
- Verify you're in the correct Supabase project

## 🎨 Customization Ideas

- Change emergency number from 911 to local equivalent
- Adjust risk calculation thresholds in `lib/risk-prediction.ts`
- Customize questions in PIMA_FEATURES array
- Modify task routines per risk factor
- Change color schemes in components

## 🚀 Next Steps

Now that your MVP is running:

1. **Test thoroughly** with different user profiles
2. **Customize** the risk factors and recommendations
3. **Deploy** to Vercel (see README.md)
4. **Add features** from the enhancement list
5. **Present** at your hackathon! 🎉

## 📝 Important Notes

- The `.env.local` file is gitignored (keep your keys secret!)
- Type errors in the IDE are expected until tables are created
- OAuth providers need additional configuration
- Emergency button links to tel:911 (change for your region)

## ✅ Success Checklist

Before your demo:
- [ ] Supabase project created and configured
- [ ] Database schema applied successfully
- [ ] `.env.local` file updated with real credentials
- [ ] Application runs without errors (`npm run dev`)
- [ ] Can create account and sign in
- [ ] Can complete health assessment
- [ ] Action plan appears in sidebar
- [ ] Tasks can be checked/unchecked
- [ ] Emergency button is visible
- [ ] Can sign out and sign back in
- [ ] Data persists between sessions

---

**Need help?** Check the main README.md for more detailed information!

**Ready to demo?** Make sure to showcase:
1. User ID display (for hackathon verification)
2. Full question flow
3. Risk calculation
4. Task tracking
5. Emergency feature
