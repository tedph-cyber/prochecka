# Quick Start Guide - Testing New Features

## 🚀 How to Test

### 1. Start the Development Server
```powershell
npm run dev
```

Navigate to: `http://localhost:3000`

---

## 🧪 Feature Testing Guide

### Feature 1: AI-Generated Personalized Plans

**Test Steps:**
1. Go to `/dashboard`
2. Chat with AI: `"Can you create a personalized diet plan for me?"`
3. Wait for AI response
4. System will automatically generate custom meal plan
5. Click **"Diet"** button in header (fork/knife icon)
6. See personalized 6-meal plan with your specific foods

**What to Verify:**
- ✅ Meals are different from default meals
- ✅ Calories are reasonable (1800-2200 total)
- ✅ Foods are diabetes-friendly
- ✅ Each meal has 3-5 specific items

**Try These Prompts:**
- "Create an exercise routine for me"
- "I need a meal plan for Type 2 diabetes"
- "What exercises should I do if I have high blood pressure?"

---

### Feature 2: Persistent Progress Tracking

**Test Steps:**
1. Open Diet modal (click Diet button in header)
2. Check off "Breakfast" ✓
3. Check off "Morning Snack" ✓
4. **Close the modal** (click X or press Escape)
5. **Refresh the page** (F5)
6. Re-open Diet modal
7. Verify "Breakfast" and "Morning Snack" are still checked ✓

**What to Verify:**
- ✅ Checked items persist after closing modal
- ✅ Checked items persist after page refresh
- ✅ Progress bar updates correctly
- ✅ Calorie counter updates
- ✅ Works for both authenticated and guest users

**Test Exercise Too:**
1. Open Exercise modal
2. Complete "Brisk Walking" ✓
3. Complete "Squats" ✓
4. Close modal
5. Refresh page
6. Re-open - should still be checked ✓

---

### Feature 3: Escape Key Support

**Test Steps:**
1. Open any modal (Diet, Exercise, Action Plan, etc.)
2. **Press Escape key** on keyboard
3. Modal should close immediately

**Modals to Test:**
- Diet Timetable Modal
- Exercise Routine Modal  
- Action Plan Modal
- PIMA Info Modal
- Complication Prediction Modal

**What to Verify:**
- ✅ Escape key closes modal instantly
- ✅ No console errors
- ✅ Modal state is properly cleaned up
- ✅ Can reopen modal after closing with Escape

---

### Feature 4: HIPAA-Compliant Storage

**Test Database Security (Authenticated Users):**

1. **Sign up for a new account**
   ```
   Email: test@example.com
   Password: Test123456!
   ```

2. **Open Supabase Dashboard**
   - Go to Table Editor
   - View `user_profiles` table
   - Try to view another user's data (should fail)

3. **Check Row Level Security**
   - Each user can only see their own data
   - No cross-user data leakage

4. **Test Data Encryption**
   - All sensitive data encrypted at rest
   - HTTPS for all API calls
   - Check browser DevTools > Network tab
   - All requests should be HTTPS

**Test Guest Mode Privacy:**
1. Use app without signing in
2. Open DevTools > Application > Local Storage
3. Check `guest_session` data
4. Should see minimal data (no PHI)
5. Data expires after 7 days automatically

**What to Verify:**
- ✅ Each user's data is isolated (RLS)
- ✅ Sensitive data is encrypted
- ✅ HTTPS used everywhere
- ✅ Guest sessions expire automatically
- ✅ No PHI stored in guest mode

---

## 🔍 Common Issues & Solutions

### Issue: Custom plan not generating
**Solution:**
- Check `.env` file has `OPENROUTER_API_KEY`
- Check API key is valid
- Check browser console for errors
- Fallback: Default plans will show instead

### Issue: Progress not saving
**Solution:**
- **Authenticated users**: Check Supabase connection
- **Guest users**: Check localStorage not disabled
- Clear browser cache and try again
- Check browser console for errors

### Issue: Escape key not working
**Solution:**
- Make sure modal is focused
- Click inside modal first, then press Escape
- Some browsers may block keyboard events - try different browser

---

## 📊 Testing Checklist

### Guest User Flow
- [ ] Chat with AI without signing in
- [ ] Ask for diet/exercise plan
- [ ] Check off some items in modals
- [ ] Close and reopen modals (progress persists)
- [ ] Refresh page (progress persists)
- [ ] Sign up (data migrates to account)

### Authenticated User Flow
- [ ] Sign in or create account
- [ ] Complete PIMA assessment
- [ ] Generate custom diet plan via chat
- [ ] Generate custom exercise plan via chat
- [ ] Track diet progress (persists to database)
- [ ] Track exercise progress (persists to database)
- [ ] Test Escape key on all modals
- [ ] Log out and log back in (data persists)

### Security Testing
- [ ] Check RLS policies (users isolated)
- [ ] Verify HTTPS on all requests
- [ ] Confirm no PHI in browser console
- [ ] Test session expiration
- [ ] Try accessing other user's data (should fail)

---

## 🎯 Success Criteria

### Feature is Working If:

**Custom Plans:**
- ✅ AI chat triggers plan generation
- ✅ Plans appear in modals
- ✅ Plans are personalized (not generic)
- ✅ Fallback to defaults if API fails

**Persistence:**
- ✅ Checked items stay checked after modal close
- ✅ Checked items stay checked after page refresh
- ✅ Progress resets at midnight (new day)
- ✅ Works for both guest and authenticated users

**Escape Key:**
- ✅ Escape closes all modals
- ✅ No memory leaks (event listeners cleaned up)
- ✅ Can reopen modals after closing

**HIPAA Compliance:**
- ✅ Data encrypted at rest and in transit
- ✅ RLS enforced (users can only see own data)
- ✅ Guest mode has minimal data collection
- ✅ Sessions expire automatically
- ✅ No PHI exposed in logs or console

---

## 🐛 Reporting Issues

If you find a bug:

1. Open browser DevTools Console (F12)
2. Reproduce the issue
3. Copy any error messages
4. Note:
   - Browser and version
   - Authenticated or guest user
   - Steps to reproduce
   - Expected vs actual behavior

---

## 🎉 Quick Wins to Try

**Cool Things to Demo:**

1. **"Magic" AI Plans**
   - Chat: "I'm 45, Type 2 diabetes, need to lose weight"
   - AI generates custom meal plan automatically
   - Open Diet modal to see personalized foods

2. **Persistent Tracking**
   - Check off multiple meals
   - Close browser completely
   - Reopen site
   - Progress is still there! 🎉

3. **Keyboard Shortcuts**
   - Open any modal
   - Press Escape
   - Modal closes instantly
   - Power user feature! ⚡

4. **Data Privacy**
   - Sign in
   - Try to view another user's data in Supabase
   - Security blocks you
   - HIPAA-compliant! 🔒

---

## 📞 Need Help?

Check these files:
- `docs/FEATURE_IMPLEMENTATION.md` - Full technical details
- `docs/HIPAA_COMPLIANCE.md` - Security documentation
- `README.md` - General setup instructions

Good luck testing! 🚀
