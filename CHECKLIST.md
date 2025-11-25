# ✅ T2D Nudge Chatbot - Setup Checklist

Use this checklist to ensure everything is configured correctly before your demo!

---

## 🔧 Initial Setup

### 1. Supabase Configuration
- [ ] Created Supabase project at [supabase.com](https://supabase.com)
- [ ] Copied Project URL from Project Settings → API
- [ ] Copied anon/public key from Project Settings → API
- [ ] Updated `.env.local` with real credentials (replaced placeholders)
- [ ] Went to SQL Editor in Supabase dashboard
- [ ] Copied contents of `supabase-schema.sql`
- [ ] Pasted and ran SQL in Supabase SQL Editor
- [ ] Verified "Success" message appeared
- [ ] Checked Table Editor - saw `chat_history` table
- [ ] Checked Table Editor - saw `action_plans` table

### 2. Dependencies
- [ ] Ran `npm install` successfully
- [ ] No error messages during installation
- [ ] All packages installed (check package.json)

### 3. Environment Variables
- [ ] `.env.local` file exists in project root
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set to your project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set to your anon key
- [ ] No placeholder text remains in `.env.local`
- [ ] URLs have no trailing slashes

---

## 🚀 Application Launch

### 4. Start Development Server
- [ ] Ran `npm run dev` in terminal
- [ ] Server started without errors
- [ ] Saw "Ready" message in terminal
- [ ] Application accessible at http://localhost:3000

### 5. Authentication Testing
- [ ] Navigated to http://localhost:3000
- [ ] Redirected to sign-in page
- [ ] Clicked "Sign up" link
- [ ] Created account with email and password
- [ ] (If email confirmation enabled) Checked email for confirmation
- [ ] Successfully signed in
- [ ] Redirected to dashboard at `/dashboard`
- [ ] User ID visible in header (starts with UUID format)

---

## 🧪 Feature Testing

### 6. Chat Interface
- [ ] Dashboard loaded successfully
- [ ] Bot sent initial greeting message
- [ ] Bot asked first question (Pregnancies)
- [ ] Input field is active and working
- [ ] Entered a number and clicked "Send"
- [ ] Bot acknowledged response
- [ ] Bot asked second question (Glucose)
- [ ] Continued through all 8 questions
- [ ] Messages display correctly (user on right, bot on left)
- [ ] Timestamps show on messages
- [ ] Messages persist on page refresh

### 7. Risk Assessment
- [ ] After 8th answer, bot calculated risk
- [ ] Risk score displayed in final message (0-100)
- [ ] Primary factor identified (e.g., "BMI", "Glucose")
- [ ] Personalized message shown
- [ ] Action plan generated message appeared
- [ ] Input field disabled after completion

### 8. Action Plan Sidebar
- [ ] Sidebar visible on right side
- [ ] Risk score displayed with color (green/orange/red)
- [ ] Risk level shown (Low/Moderate/High)
- [ ] Primary factor highlighted in blue box
- [ ] 6 daily routine tasks listed
- [ ] Progress bar shows 0/6 tasks initially
- [ ] Can click checkboxes on tasks
- [ ] Checked tasks show green background
- [ ] Checked tasks show strikethrough text
- [ ] Progress bar updates when checking tasks
- [ ] Task count updates (e.g., "3/6 tasks")
- [ ] Changes persist on page refresh

### 9. Emergency Button
- [ ] Red button visible in bottom-right corner
- [ ] Button has pulsing animation
- [ ] Hover shows tooltip "Emergency Help (911)"
- [ ] Button stays fixed when scrolling
- [ ] Button is above other content (z-index working)

### 10. Session Management
- [ ] Clicked "Sign Out" button
- [ ] Redirected to sign-in page
- [ ] Signed back in with same account
- [ ] Previous chat history still visible
- [ ] Action plan still shows previous data
- [ ] Task completion status preserved

### 11. New Assessment
- [ ] Clicked "New Assessment" button
- [ ] Confirmation dialog appeared
- [ ] Confirmed to start new assessment
- [ ] Chat cleared
- [ ] Bot asked first question again
- [ ] Can complete new assessment
- [ ] New risk score calculated
- [ ] Action plan updated with new data

---

## 🔒 Security Verification

### 12. Data Isolation
- [ ] Created second test account
- [ ] Signed in with second account
- [ ] First account's data not visible
- [ ] Each account has separate chat history
- [ ] Each account has separate action plan

### 13. Protected Routes
- [ ] Signed out
- [ ] Tried to visit `/dashboard` directly
- [ ] Redirected to `/auth/sign-in`
- [ ] Signed in while on auth page
- [ ] Redirected away from auth pages

---

## 🎨 UI/UX Check

### 14. Design & Responsiveness
- [ ] All text is readable
- [ ] Colors are consistent
- [ ] Buttons have hover effects
- [ ] Loading animations work (typing dots)
- [ ] No console errors in browser DevTools
- [ ] No layout shifts or broken styles
- [ ] Responsive: tested on mobile size (resize browser)
- [ ] All functionality works on mobile view

---

## 📋 Pre-Demo Checklist

### 15. Demonstration Preparation
- [ ] Prepared sample test data (see SETUP_GUIDE.md)
- [ ] Tested complete user flow start to finish
- [ ] User ID clearly visible (requirement met!)
- [ ] Can explain risk calculation logic
- [ ] Can show task tracking feature
- [ ] Emergency button ready to showcase
- [ ] No errors in browser console
- [ ] No errors in terminal
- [ ] Database tables visible in Supabase dashboard

### 16. Optional: OAuth Configuration
- [ ] (If doing OAuth) Google credentials configured
- [ ] (If doing OAuth) Redirect URLs added
- [ ] (If doing OAuth) Tested Google sign-in
- [ ] (If doing OAuth) Callback working correctly

---

## 🎯 Final Verification

### All Core Requirements Met:
- [ ] ✅ Authentication (email/password working)
- [ ] ✅ Chatbot Interface (8 questions sequential)
- [ ] ✅ Risk Prediction (score calculated)
- [ ] ✅ Action Plan Tracker (sidebar with tasks)
- [ ] ✅ Data Persistence (survives refresh)
- [ ] ✅ Emergency Feature (button visible & working)
- [ ] ✅ User ID Display (visible in header)

### Technical Requirements:
- [ ] ✅ Next.js 16 (check package.json)
- [ ] ✅ Tailwind CSS (styles working)
- [ ] ✅ Supabase (database connected)
- [ ] ✅ TypeScript (no type errors blocking)

---

## 🚨 Common Issues & Solutions

### Issue: "Unauthorized" errors
**Solution:** 
- Verify `.env.local` has correct Supabase credentials
- Restart dev server after changing `.env.local`
- Check Supabase project is active

### Issue: Tables not found
**Solution:**
- Re-run SQL schema in Supabase SQL Editor
- Check for error messages in SQL execution
- Verify you're in the correct Supabase project

### Issue: Tasks not updating
**Solution:**
- Check browser console for errors
- Verify RLS policies applied (re-run schema)
- Try signing out and back in

### Issue: OAuth not working
**Solution:**
- Verify redirect URLs configured
- Check OAuth credentials in Supabase
- Ensure callback route exists

---

## 🎉 You're Ready!

If all checkboxes above are checked, you're ready to:
- **Demo** your application
- **Deploy** to production
- **Present** at your hackathon
- **Extend** with new features

---

## 📚 Reference Documents

- `README.md` - Comprehensive documentation
- `SETUP_GUIDE.md` - Quick setup instructions
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `supabase-schema.sql` - Database schema

---

**Questions?** Review the documentation files or check Supabase logs for errors.

**Success?** Time to showcase your T2D Health Assistant! 🚀

---

**Last Updated:** Ready for deployment
**Project Status:** ✅ Phase 1 MVP Complete
