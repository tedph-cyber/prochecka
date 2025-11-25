# 🚀 START HERE - T2D Nudge Chatbot

## Welcome! Your Phase 1 MVP is Complete! 🎉

Everything has been built and is ready for you. Follow these 3 simple steps to get started.

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Set Up Supabase (3 minutes)

1. **Go to:** [supabase.com](https://supabase.com)
2. **Click:** "New Project"
3. **Fill in:**
   - Project Name: `t2d-chatbot`
   - Password: (create and save it)
   - Region: Choose closest to you
4. **Wait:** ~2 minutes for setup to complete

### Step 2: Configure Database (1 minute)

1. **In Supabase, click:** SQL Editor (left sidebar)
2. **Click:** "New Query"
3. **Copy:** Everything from `supabase-schema.sql` file (in this project)
4. **Paste:** Into SQL Editor
5. **Click:** Run (or press Ctrl/Cmd + Enter)
6. **Verify:** You see "Success. No rows returned"

### Step 3: Connect Your App (1 minute)

1. **In Supabase, go to:** Project Settings → API
2. **Copy:**
   - Project URL
   - Anon/public key
3. **Open:** `.env.local` file (in this project)
4. **Replace:** The placeholder values with your actual keys
5. **Save** the file

---

## 🎮 Run the Application

```bash
# Install dependencies (if not done already)
npm install

# Start the development server
npm run dev
```

**Open:** [http://localhost:3000](http://localhost:3000)

---

## ✅ Test Your App

1. **Sign up** with email and password
2. **Answer** the 8 health questions
3. **See** your risk score and action plan
4. **Check** tasks to track progress
5. **Notice** the emergency button (bottom-right)

---

## 📚 Full Documentation

### Need More Details?

- **`SETUP_GUIDE.md`** - Step-by-step setup instructions
- **`README.md`** - Complete technical documentation
- **`CHECKLIST.md`** - Verify everything works
- **`KNOWN_ISSUES.md`** - Explanation of IDE warnings
- **`IMPLEMENTATION_SUMMARY.md`** - What was built

---

## 🎯 What You Have

### ✅ Complete Features:
- 🔐 Email/password authentication
- 💬 8-question health assessment
- 📊 Risk score calculation (0-100)
- 📋 Personalized action plan
- ✅ Task tracking with checkboxes
- 🚨 Emergency help button
- 💾 Data persistence in Supabase
- 🔒 Row-level security

### ✅ Technologies:
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)

### ✅ Ready For:
- Hackathon demo
- Production deployment
- Feature extensions

---

## 🚨 Quick Troubleshooting

### "Can't connect to database"
→ Check `.env.local` has correct Supabase URL and key

### "Unauthorized" errors
→ Make sure you ran the SQL schema in Supabase

### "Module not found" errors in IDE
→ Ignore them! They're cosmetic. See `KNOWN_ISSUES.md`

### Database tables not found
→ Re-run `supabase-schema.sql` in SQL Editor

---

## 🎨 Customize (Optional)

Want to make it your own?

### Change Emergency Number:
Edit `components/EmergencyButton.tsx` - change `tel:911` to your local number

### Modify Questions:
Edit `lib/risk-prediction.ts` - update `PIMA_FEATURES` array

### Adjust Risk Algorithm:
Edit `lib/risk-prediction.ts` - modify `calculateRiskAndNudge` function

### Change Colors:
Edit components - modify Tailwind classes

---

## 🚀 Deploy to Production

### Using Vercel (Recommended):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Then add your environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Don't forget:** Update OAuth redirect URLs in Supabase for production domain!

---

## 📊 Test Data for Demo

### Low Risk Profile:
- Pregnancies: 0
- Glucose: 90
- Blood Pressure: 70
- Skin Thickness: 20
- Insulin: 80
- BMI: 22
- Diabetes Pedigree: 0.3
- Age: 25

### High Risk Profile:
- Pregnancies: 3
- Glucose: 180
- Blood Pressure: 95
- Skin Thickness: 40
- Insulin: 250
- BMI: 38
- Diabetes Pedigree: 1.8
- Age: 55

---

## 🎤 Demo Tips

### Show These Features:

1. **User ID Display** (in header - hackathon requirement)
2. **Sequential Questions** (8 PIMA features)
3. **Input Validation** (try invalid numbers)
4. **Risk Calculation** (show different risk levels)
5. **Action Plan Sidebar** (personalized tasks)
6. **Task Tracking** (check/uncheck boxes)
7. **Progress Bar** (updates as tasks complete)
8. **Emergency Button** (pulsing animation)
9. **Data Persistence** (refresh page, data remains)
10. **New Assessment** (reset and start over)

### Talking Points:

- "Full authentication with Supabase"
- "PIMA dataset-based risk assessment"
- "Personalized daily routines based on primary risk factor"
- "Real-time task tracking with database sync"
- "Row-level security for data privacy"
- "Emergency help always accessible"

---

## 🎯 Next Steps

1. ✅ Complete 5-minute setup above
2. ✅ Test all features
3. ✅ (Optional) Add OAuth credentials
4. ✅ (Optional) Customize styling
5. ✅ Deploy to Vercel
6. ✅ Present at hackathon! 🏆

---

## 💡 Need Help?

- **Type errors in IDE?** → See `KNOWN_ISSUES.md`
- **Setup questions?** → See `SETUP_GUIDE.md`
- **Technical details?** → See `README.md`
- **Feature checklist?** → See `CHECKLIST.md`

---

## 🎉 You're All Set!

Your T2D Nudge Chatbot is ready to:
- **Assess** Type 2 Diabetes risk
- **Generate** personalized action plans
- **Track** daily health tasks
- **Impress** at your hackathon!

**Time to shine! 🌟**

---

**Built with:** Next.js 16 + TypeScript + Tailwind CSS + Supabase  
**Ready for:** Demo, Deployment, and Extension  
**Status:** ✅ Phase 1 MVP Complete

---

**Questions?** Check the docs. **Ready?** Run `npm run dev` and go! 🚀
