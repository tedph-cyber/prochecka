# T2D Nudge Chatbot - Phase 1 MVP

A full-stack, authenticated web application for Type 2 Diabetes risk assessment with personalized lifestyle recommendations and progress tracking.

## 🚀 Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL + Authentication)
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Git (optional)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to finish setting up

#### B. Get Your Credentials
1. Go to Project Settings > API
2. Copy your project URL and anon/public key

#### C. Update Environment Variables
Edit `.env.local` file and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Database Schema

Go to your Supabase project's SQL Editor and run this schema:

```sql
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON chat_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_action_plans_user_id ON action_plans(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_history
CREATE POLICY "Users can view their own chat history"
  ON chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat history"
  ON chat_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for action_plans
CREATE POLICY "Users can view their own action plan"
  ON action_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own action plan"
  ON action_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own action plan"
  ON action_plans FOR UPDATE
  USING (auth.uid() = user_id);
```

### 4. Configure Authentication (OAuth)

#### Google OAuth Setup (Optional):
1. Go to your Supabase project > Authentication > Providers
2. Enable Google provider
3. Follow the instructions to set up Google OAuth credentials
4. Add your authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

#### Email Authentication:
Email/password authentication is enabled by default. You can also enable:
- Magic Links (passwordless email login)
- Email confirmation requirements

Configure these in: Authentication > Providers > Email

### 5. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🎯 Features Implemented

### ✅ Authentication & User Management
- Email/password sign up and sign in
- Magic link authentication
- Google OAuth integration (placeholders ready)
- Protected routes with middleware
- Session management
- User ID display on dashboard

### ✅ Chatbot Interface
- Two-column responsive layout (Chat + Action Plan Sidebar)
- Sequential question flow (8 PIMA features)
- Input validation for each feature
- Real-time message updates
- Chat history persistence
- LLM-style interface design

### ✅ Risk Prediction Engine
- PIMA dataset-based risk calculation
- Identifies highest contributing risk factor
- Risk score calculation (0-100)
- Personalized nudge messages
- Secure API route implementation

### ✅ Action Plan Tracker
- Displays risk score with color coding
- Shows primary risk factor
- Daily routine task list (6 tasks)
- Checkbox tracking with instant updates
- Progress visualization
- Optimistic UI updates

### ✅ Data Persistence
- All chat messages stored in Supabase
- Action plans persisted per user
- Real-time updates capability
- Row Level Security (RLS) enabled
- User-specific data isolation

### ✅ Emergency Feature
- Fixed-position emergency button
- Highly visible red design with pulsing animation
- Direct tel: link (911)
- Tooltip on hover
- Always accessible

## 📁 Project Structure

```
prochecka/
├── app/
│   ├── api/
│   │   ├── action-plan/route.ts    # Action plan CRUD
│   │   ├── chat/route.ts           # Chat history endpoints
│   │   └── predict/route.ts        # Risk prediction
│   ├── auth/
│   │   ├── callback/route.ts       # OAuth callback
│   │   ├── sign-in/page.tsx        # Sign in page
│   │   └── sign-up/page.tsx        # Sign up page
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Root redirect
├── components/
│   ├── ActionPlanSidebar.tsx       # Action plan UI
│   └── EmergencyButton.tsx         # Emergency help button
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client
│   │   ├── middleware.ts           # Auth middleware
│   │   └── types.ts                # Database types
│   └── risk-prediction.ts          # Risk calculation logic
├── .env.local                      # Environment variables
├── middleware.ts                   # Next.js middleware
└── package.json
```

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- User-specific data access
- Authenticated API routes
- Secure session management
- CSRF protection via Supabase

## 🎨 UI/UX Features

- Responsive design
- Gradient backgrounds
- Smooth animations
- Loading states
- Error handling
- Progress indicators
- Color-coded risk levels
- Accessible UI components

## 📊 Database Schema

### Tables

#### `chat_history`
- Stores conversation messages
- Links to authenticated users
- Tracks message order and timestamps
- Supports final message flagging

#### `action_plans`
- One plan per user (UNIQUE constraint)
- Stores risk score and primary factor
- JSONB tasks array for flexibility
- Automatic timestamp updates

### Row Level Security
All tables have RLS policies ensuring users can only access their own data.

## 🚨 Emergency Feature

The emergency button is always visible in the bottom-right corner and provides immediate access to emergency services (911). It features:
- Pulsing animation for high visibility
- Hover tooltip
- Direct phone link
- Fixed positioning (always accessible)

## 🔄 Next Steps / Future Enhancements

1. **Add Supabase Realtime**: Live chat updates
2. **Export Data**: Allow users to download their history
3. **Progress Charts**: Visualize risk score trends
4. **Reminders**: Push notifications for tasks
5. **Multi-language Support**: Internationalization
6. **Advanced Analytics**: Track adherence over time
7. **Health Provider Integration**: Share reports with doctors

## 🤝 Contributing

This is a hackathon MVP. For production use:
1. Add comprehensive error handling
2. Implement rate limiting
3. Add input sanitization
4. Set up monitoring and logging
5. Add comprehensive tests
6. Optimize for performance

## 📝 License

MIT License - feel free to use for your hackathon or project!

## 🆘 Support

For issues with:
- **Supabase**: Check your project logs in the Supabase dashboard
- **Authentication**: Verify your OAuth credentials
- **Database**: Ensure RLS policies are correctly applied
- **Environment**: Double-check your `.env.local` file

---

Built with ❤️ for Type 2 Diabetes prevention and management.

