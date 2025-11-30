# Prochecka AI Chat Integration - Setup Guide

## 🎯 What Changed

The dashboard has been transformed from a **forced PIMA assessment** to a **free-flowing AI chatbot** that can optionally run PIMA tests.

### Before ❌
- Hardcoded PIMA test automatically started on page load
- No AI integration despite having the code
- Used OpenAI SDK even though OpenRouter SDK was installed
- Disconnected frontend and backend systems

### After ✅
- **Free-flowing conversational AI** using OpenRouter
- **Welcome message** introducing Prochecka as a diabetes health assistant
- **Optional PIMA assessment** via button or chat request
- **AI-generated** personalized meal plans, exercise routines, and health advice
- **Unified system** - frontend and backend properly connected

---

## 🚀 Quick Start

### 1. Get Your OpenRouter API Key

1. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-or-v1-...`)

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase (you already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter - REQUIRED!
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Install Dependencies (if needed)

```bash
npm install @openrouter/sdk openai
```

The OpenRouter SDK was already installed but not being used!

### 4. Run the Development Server

```bash
npm run dev
```

---

## 🎨 New Features

### 1. **Welcome Screen**
When users first enter the dashboard, they see:
- Friendly welcome message from Prochecka
- Overview of capabilities (chat, PIMA test, meal plans, tips)
- **Quick action button** to start PIMA assessment
- Option to just chat about diabetes health

### 2. **Free-Flowing Conversation**
Users can:
- Ask general questions about diabetes
- Get nutrition advice
- Request exercise recommendations
- Discuss symptoms and concerns
- Have natural back-and-forth conversations

### 3. **Optional PIMA Assessment**
Two ways to start:
1. **Button**: Click "🎯 Start PIMA Risk Assessment" on welcome screen
2. **Chat**: Simply say "I want to start PIMA assessment" or "Run diabetes risk test"

The AI will guide them through 8 questions:
1. Number of pregnancies
2. Glucose level (mg/dL)
3. Blood Pressure (mm Hg)
4. Skin Thickness (mm)
5. Insulin level (mu U/ml)
6. BMI
7. Diabetes Pedigree Function
8. Age

### 4. **AI-Generated Personalized Plans**
The AI creates custom:
- Daily meal plans (breakfast, lunch, dinner, snacks)
- Exercise routines with specific activities
- Lifestyle modification suggestions
- Focus areas based on risk factors

---

## 🔧 Technical Architecture

### Changed Files

#### 1. **lib/ai-services.ts** (MAJOR REFACTOR)
**Before:**
```typescript
import OpenAI from "openai"
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
model: "gpt-4-turbo-preview"
```

**After:**
```typescript
import OpenAI from "openai"
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL,
    "X-Title": "Prochecka Health Assistant"
  }
})
model: "openai/gpt-3.5-turbo" // Can use any OpenRouter model!
```

**Key Changes:**
- Uses OpenRouter as OpenAI-compatible endpoint
- Removed function calling (simplified)
- Added `generatePersonalizedPlan()` function for PIMA results
- Updated system prompt for conversational style

#### 2. **app/api/ai-chat/route.ts** (SIMPLIFIED)
**Before:**
- Complex function call handling
- Imported from wrong path (`ai-service` vs `ai-services`)
- State management for metrics collection

**After:**
- Simple message-in, message-out flow
- Fixed import path
- Saves conversation to database
- Returns AI response directly

#### 3. **app/dashboard/page.tsx** (COMPLETE REWRITE)
**Before:**
- 609 lines of hardcoded PIMA logic
- `askFirstQuestion()` auto-starts assessment
- Manual question validation
- Direct `/api/predict` calls
- Disconnected from AI endpoints

**After:**
- 480 lines of clean AI chat integration
- Welcome message instead of forced questions
- Calls `/api/ai-chat` for all responses
- Optional PIMA button
- Natural conversation flow

**Backup:** Old version saved as `page-old.tsx.backup`

---

## 🎯 Available AI Models

You can change the model in `lib/ai-services.ts`:

### Recommended Models
```typescript
// Fast & Affordable (Current)
model: "openai/gpt-3.5-turbo"

// Balanced Performance
model: "openai/gpt-4-turbo"
model: "anthropic/claude-3-sonnet"

// Best Quality
model: "anthropic/claude-3.5-sonnet"
model: "openai/gpt-4"

// Open Source
model: "meta-llama/llama-3.1-70b-instruct"
model: "meta-llama/llama-3-8b-instruct"
```

See all models: [https://openrouter.ai/models](https://openrouter.ai/models)

---

## 🐛 Troubleshooting

### "Failed to send message" Error
**Cause:** Missing or invalid `OPENROUTER_API_KEY`

**Fix:**
1. Check `.env` file exists in project root
2. Verify key starts with `sk-or-v1-`
3. Restart development server after adding key

### AI Responses Are Generic
**Cause:** May need better model or system prompt tuning

**Fix:**
1. Try a more capable model (see above)
2. Edit system prompt in `lib/ai-services.ts`
3. Add more context to user messages

### PIMA Test Not Working
The old manual PIMA flow was removed. PIMA tests now work through AI conversation:

**User:** "I want to take the PIMA test"  
**AI:** "Great! Let's begin. First question: How many times have you been pregnant?"  
**User:** "2"  
**AI:** "Thanks! Next, what is your glucose level in mg/dL?"  
...continues through 8 questions...

If you need the old forced assessment, restore from `page-old.tsx.backup`.

### Guest Mode Not Saving
Guest messages are saved to localStorage. Check:
```typescript
// In browser console:
localStorage.getItem('prochecka_guest_session')
```

---

## 📊 Cost Estimation

OpenRouter pricing (approximate):

| Model | Input | Output | Est. per 1000 messages |
|-------|-------|--------|----------------------|
| GPT-3.5 Turbo | $0.50/1M tokens | $1.50/1M tokens | $2-5 |
| GPT-4 Turbo | $10/1M tokens | $30/1M tokens | $30-60 |
| Claude 3 Sonnet | $3/1M tokens | $15/1M tokens | $15-30 |
| Llama 3 70B | $0.59/1M tokens | $0.79/1M tokens | $1-2 |

**Recommendation:** Start with GPT-3.5 Turbo for testing, upgrade if needed.

---

## 🔮 Future Enhancements

### Planned Features
1. **Direct PIMA Form**
   - Modal with 8 input fields
   - Submit all metrics at once
   - Instant risk calculation

2. **User-Specific Memory**
   - AI remembers past conversations
   - Tracks progress over time
   - Personalizes responses per user

3. **Generated Routines Database**
   - Save meal plans to `meal_plans` table
   - Store routines in `user_routines` table
   - Allow editing/rating of AI suggestions

4. **Voice Input**
   - Speech-to-text for questions
   - Text-to-speech for responses
   - Hands-free interaction

---

## 📝 Development Notes

### Why OpenRouter?
- **Flexibility**: Switch between 100+ models without code changes
- **Cost**: Often cheaper than direct API access
- **Fallbacks**: Automatic model fallback if one is down
- **Unified API**: Same interface for OpenAI, Anthropic, Meta, etc.

### Import Bug Fixed
The original code had:
```typescript
// app/api/ai-chat/route.ts
import { chatWithAI } from "@/lib/ai-service" // ❌ Wrong (singular)
```

File was actually:
```typescript
lib/ai-services.ts // ✅ Correct (plural)
```

Now fixed - imports match filename.

### Function Calling Removed
The old system used OpenAI function calling for:
- `start_assessment()`
- `record_health_metric()`
- `calculate_risk()`

New system relies on:
1. Natural language understanding by AI
2. User explicitly requesting "start PIMA test"
3. AI guiding conversation to collect metrics
4. Manual call to `/api/predict` when complete (future enhancement)

This is simpler and works with ANY model, not just OpenAI.

---

## 🎨 UI/UX Highlights

All existing design elements preserved:
- ✅ Glass morphism styling
- ✅ Gradient animated background
- ✅ Floating chat input with backdrop blur
- ✅ Modern header with animated menu
- ✅ Responsive mobile design
- ✅ Action plan modal
- ✅ Loading animations

New additions:
- 🎯 Quick action button for PIMA test
- 👋 Friendly welcome message
- 💬 Natural conversation flow
- 📱 Better mobile experience

---

## 📞 Support

If you encounter issues:

1. **Check environment variables** - Most common issue
2. **View browser console** - Look for API errors
3. **Check OpenRouter dashboard** - Verify API key is active
4. **Restart dev server** - After changing `.env`

**Old functionality backup:** `app/dashboard/page-old.tsx.backup`

---

## ✅ Checklist

Before deploying:

- [ ] Added `OPENROUTER_API_KEY` to `.env`
- [ ] Tested welcome message loads
- [ ] Verified AI responds to messages
- [ ] Tested PIMA assessment button
- [ ] Checked mobile responsiveness
- [ ] Confirmed guest mode works
- [ ] Tested authenticated user mode
- [ ] Verified action plan modal
- [ ] Added `.env` to `.gitignore` (security!)

---

**Version:** 2.0  
**Date:** January 2025  
**Breaking Changes:** Yes - removed forced PIMA test  
**Migration:** Automatic (old chats still load)
