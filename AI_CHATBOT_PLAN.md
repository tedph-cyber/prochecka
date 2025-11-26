# 🤖 AI Chatbot Implementation Plan

## Overview

Transform the current rule-based chatbot into an intelligent AI assistant that can:
1. Have natural conversations about diabetes and health
2. Detect user intent to trigger assessments
3. Provide personalized health advice
4. Answer questions about diabetes management
5. Guide users through the assessment naturally

---

## 🎯 Core Features

### 1. Natural Language Conversation
**Instead of:** Sequential forced questions  
**New approach:** Free-form chat with intent detection

**Example:**
```
User: "I've been feeling really tired lately and drinking a lot of water"
Bot: "I understand you're experiencing fatigue and increased thirst. These can be 
     indicators of diabetes. Would you like me to help assess your risk with a quick 
     health check? I'll ask about some key health metrics."
User: "Yes, please"
Bot: [Triggers assessment mode]
```

### 2. Intent Detection
**Intents to recognize:**
- `assessment.start` - User wants risk assessment
- `assessment.question` - User asks about specific health metric
- `advice.general` - User wants diabetes info
- `advice.nutrition` - Asks about diet
- `advice.exercise` - Asks about physical activity
- `symptoms.check` - Describes symptoms
- `results.explain` - Wants to understand their score
- `plan.modify` - Wants to adjust action plan

### 3. Contextual Assessment
**Smart question flow:**
- Extract info from natural conversation
- Only ask what's missing
- Validate naturally
- Confirm understanding

**Example:**
```
User: "I'm 45, overweight with a BMI of 32"
Bot: "Thanks for sharing that. At 45 with a BMI of 32, it's good you're being 
     proactive about your health. Can you tell me what your typical fasting 
     blood glucose level is?"
```

---

## 🏗️ Architecture

### Option 1: OpenAI GPT-4 (Recommended)

**Pros:**
- Excellent natural language understanding
- Built-in function calling for intents
- Easy to implement
- Reliable and well-documented

**Implementation:**
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// System prompt
const systemPrompt = `You are a diabetes health assistant...`

// Function definitions
const functions = [
  {
    name: 'start_assessment',
    description: 'Start diabetes risk assessment',
    parameters: {...}
  },
  {
    name: 'record_metric',
    description: 'Record health metric',
    parameters: {...}
  },
  // ... more functions
]

// Chat completion with function calling
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: conversationHistory,
  functions: functions,
  function_call: 'auto',
})
```

**Cost:** ~$0.01-0.03 per conversation

### Option 2: Anthropic Claude

**Pros:**
- Excellent at following instructions
- Strong safety features
- Good for health advice
- Longer context window

**Implementation:**
```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const response = await anthropic.messages.create({
  model: 'claude-3-sonnet-20240229',
  max_tokens: 1024,
  system: systemPrompt,
  messages: conversationHistory,
})
```

**Cost:** Similar to GPT-4

### Option 3: Open Source (Llama 3)

**Pros:**
- Free (after setup)
- Privacy control
- Customizable

**Cons:**
- Requires hosting
- More complex setup
- May need fine-tuning

**Implementation:**
- Host on Replicate, HuggingFace, or own server
- Use together.ai or groq for managed inference
- Fine-tune on diabetes-specific data

---

## 🔧 Implementation Steps

### Phase 1: Setup (Week 1)

1. **Choose LLM Provider**
   ```bash
   npm install openai
   # or
   npm install @anthropic-ai/sdk
   ```

2. **Environment Variables**
   ```env
   OPENAI_API_KEY=sk-...
   # or
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **Create System Prompt**
   ```typescript
   // lib/ai-prompts.ts
   export const SYSTEM_PROMPT = `
   You are Prochecka, an empathetic AI health assistant specializing in 
   Type 2 Diabetes risk assessment and management...
   
   Your capabilities:
   - Conduct diabetes risk assessments (8 PIMA metrics)
   - Provide evidence-based health advice
   - Explain results in simple terms
   - Motivate healthy lifestyle changes
   
   Guidelines:
   - Be empathetic and non-judgmental
   - Use simple, clear language
   - Ask one question at a time
   - Validate user inputs naturally
   - Always emphasize: consult healthcare professionals
   `
   ```

### Phase 2: Intent System (Week 1-2)

1. **Define Functions**
   ```typescript
   // lib/ai-functions.ts
   export const AI_FUNCTIONS = [
     {
       name: 'start_assessment',
       description: 'Begin diabetes risk assessment when user expresses interest',
       parameters: {
         type: 'object',
         properties: {
           reason: {
             type: 'string',
             description: 'Why user wants assessment'
           }
         }
       }
     },
     {
       name: 'record_health_metric',
       description: 'Record a health metric shared by user',
       parameters: {
         type: 'object',
         properties: {
           metric: {
             type: 'string',
             enum: ['pregnancies', 'glucose', 'blood_pressure', 'bmi', 'age', 'insulin']
           },
           value: {
             type: 'number'
           },
           confidence: {
             type: 'string',
             enum: ['high', 'medium', 'low']
           }
         },
         required: ['metric', 'value']
       }
     },
     {
       name: 'provide_diabetes_info',
       description: 'User asks general question about diabetes',
       parameters: {
         type: 'object',
         properties: {
           topic: {
             type: 'string',
             enum: ['symptoms', 'prevention', 'diet', 'exercise', 'medication']
           }
         }
       }
     },
     {
       name: 'calculate_risk',
       description: 'Calculate diabetes risk when all metrics collected',
       parameters: {
         type: 'object',
         properties: {
           ready: {
             type: 'boolean'
           }
         }
       }
     }
   ]
   ```

2. **Create AI Service**
   ```typescript
   // lib/ai-service.ts
   import OpenAI from 'openai'
   import { SYSTEM_PROMPT, AI_FUNCTIONS } from './ai-prompts'

   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

   export async function chatWithAI(
     messages: Array<{ role: string; content: string }>,
     userId?: string
   ) {
     try {
       const response = await openai.chat.completions.create({
         model: 'gpt-4-turbo-preview',
         messages: [
           { role: 'system', content: SYSTEM_PROMPT },
           ...messages
         ],
         functions: AI_FUNCTIONS,
         function_call: 'auto',
         temperature: 0.7,
         max_tokens: 500,
       })

       const choice = response.choices[0]
       
       // Check if function was called
       if (choice.message.function_call) {
         return {
           type: 'function_call',
           function: choice.message.function_call.name,
           arguments: JSON.parse(choice.message.function_call.arguments),
           message: choice.message.content
         }
       }

       return {
         type: 'message',
         message: choice.message.content
       }
     } catch (error) {
       console.error('AI Error:', error)
       return {
         type: 'error',
         message: 'Sorry, I encountered an error. Please try again.'
       }
     }
   }
   ```

### Phase 3: New API Route (Week 2)

```typescript
// app/api/ai-chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { chatWithAI } from '@/lib/ai-service'
import { calculateRiskAndNudge } from '@/lib/risk-prediction'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await request.json()
    const { message, conversation_history, collected_metrics } = body

    // Add user message to history
    const messages = [
      ...conversation_history,
      { role: 'user', content: message }
    ]

    // Get AI response
    const aiResponse = await chatWithAI(messages, user?.id)

    // Handle function calls
    if (aiResponse.type === 'function_call') {
      switch (aiResponse.function) {
        case 'start_assessment':
          return NextResponse.json({
            message: aiResponse.message || "Great! Let's begin your health assessment.",
            action: 'start_assessment',
            state: 'collecting_metrics'
          })

        case 'record_health_metric':
          const { metric, value } = aiResponse.arguments
          return NextResponse.json({
            message: "Got it! I've recorded that information.",
            action: 'record_metric',
            metric,
            value,
            collected: { ...collected_metrics, [metric]: value }
          })

        case 'calculate_risk':
          // Check if all metrics collected
          const required = ['pregnancies', 'glucose', 'blood_pressure', 'bmi', 'age']
          const hasAll = required.every(m => collected_metrics[m] !== undefined)
          
          if (hasAll) {
            const result = calculateRiskAndNudge(collected_metrics)
            return NextResponse.json({
              message: `Based on your health metrics, your diabetes risk score is ${result.riskScore}/100.`,
              action: 'show_results',
              result
            })
          }
          break
      }
    }

    // Regular message response
    return NextResponse.json({
      message: aiResponse.message,
      action: 'continue_conversation'
    })

  } catch (error) {
    console.error('AI Chat Error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
```

### Phase 4: Updated Dashboard (Week 2-3)

```typescript
// app/dashboard/page.tsx (AI-enabled version)
'use client'

import { useState } from 'react'

export default function AIDashboard() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! I'm Prochecka, your diabetes health assistant. How can I help you today? 😊"
  }])
  const [input, setInput] = useState('')
  const [collectedMetrics, setCollectedMetrics] = useState({})
  const [assessmentMode, setAssessmentMode] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')

    // Call AI API
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input,
        conversation_history: messages,
        collected_metrics: collectedMetrics
      })
    })

    const data = await response.json()

    // Add AI response
    setMessages([...newMessages, {
      role: 'assistant',
      content: data.message
    }])

    // Handle actions
    switch (data.action) {
      case 'start_assessment':
        setAssessmentMode(true)
        break
      case 'record_metric':
        setCollectedMetrics(data.collected)
        break
      case 'show_results':
        // Show results modal
        showResults(data.result)
        break
    }
  }

  // ... rest of component
}
```

---

## 💡 Advanced Features

### 1. Context Awareness

```typescript
// Track user journey
interface UserContext {
  hasCompletedAssessment: boolean
  lastAssessmentDate: Date
  riskLevel: 'low' | 'moderate' | 'high'
  preferredTopics: string[]
  questionsAsked: string[]
}

// Personalize responses
const contextualPrompt = `
User context:
- Risk level: ${context.riskLevel}
- Last assessment: ${context.lastAssessmentDate}
- Interested in: ${context.preferredTopics.join(', ')}

Tailor your responses accordingly.
`
```

### 2. Multi-turn Validation

```typescript
// Natural validation flow
User: "My glucose is usually around 150"
Bot: "Thanks! Just to confirm, is that your fasting glucose level, or after meals?"
User: "Fasting"
Bot: "Got it. A fasting glucose of 150 mg/dL is higher than normal. Let's continue..."
```

### 3. Emotional Intelligence

```typescript
// Detect emotional state
const emotionPrompt = `
Detect user's emotional state from their messages:
- anxious
- motivated
- confused
- discouraged

Respond with appropriate empathy and encouragement.
`

// Example responses
if (emotion === 'anxious') {
  return "I understand this can feel overwhelming. Remember, this is just an assessment tool. Whatever the results, there are always steps you can take to improve your health. Let's focus on what we can control."
}
```

### 4. Personalized Advice

```typescript
// Generate custom recommendations
const advicePrompt = `
User profile:
- Risk score: ${riskScore}
- Primary factor: ${primaryFactor}
- Lifestyle: ${lifestyle}
- Goals: ${goals}

Provide 3 specific, actionable recommendations.
`
```

---

## 📊 Metrics & Monitoring

### Track Performance

```typescript
// Log AI interactions
interface AIMetrics {
  response_time: number
  tokens_used: number
  function_calls: string[]
  user_satisfaction: number
  intent_accuracy: number
}

// Monitor costs
const estimateCost = (tokens: number) => {
  const inputCost = 0.01 / 1000 // per 1K tokens
  const outputCost = 0.03 / 1000
  return (tokens * inputCost) + (tokens * outputCost)
}
```

### A/B Testing

```typescript
// Test AI vs. rule-based
const variant = Math.random() < 0.5 ? 'ai' : 'classic'

// Track which performs better
trackMetric('completion_rate', variant)
trackMetric('user_satisfaction', variant)
trackMetric('accuracy', variant)
```

---

## 💰 Cost Estimation

### GPT-4 Pricing
- **Input:** $0.01 per 1K tokens
- **Output:** $0.03 per 1K tokens

**Typical conversation:**
- System prompt: ~500 tokens
- User messages: ~50 tokens each
- AI responses: ~150 tokens each
- **Total per assessment:** ~2,500 tokens = $0.05

**Monthly for 1,000 users:**
- Cost: ~$50/month

### Cost Optimization

1. **Cache system prompts**
2. **Use GPT-3.5 for simple queries** ($0.0015/1K tokens)
3. **Implement rate limiting**
4. **Stream responses** for better UX
5. **Store common Q&A** locally

---

## 🚀 Launch Strategy

### Phase 1: Beta (Week 4)
- Enable for 10% of users
- Monitor performance
- Collect feedback
- Fix issues

### Phase 2: Gradual Rollout (Week 5-6)
- Increase to 50% of users
- A/B test results
- Optimize prompts
- Reduce costs

### Phase 3: Full Launch (Week 7+)
- Enable for all users
- Add advanced features
- Continuous improvement
- Scale infrastructure

---

## 🎯 Success Metrics

- **Completion Rate:** > 80% of users finish assessment
- **User Satisfaction:** > 4.5/5 stars
- **Intent Accuracy:** > 90% correct function calls
- **Response Time:** < 3 seconds
- **Cost per User:** < $0.10

---

## 🔐 Safety & Compliance

### Medical Disclaimers

```typescript
const DISCLAIMER = `
Important: I'm an AI assistant providing general health information. 
This is NOT medical advice. Always consult healthcare professionals 
for medical decisions.
`

// Add to every response about health advice
response = response + "\n\n" + DISCLAIMER
```

### Content Filtering

```typescript
// Block inappropriate requests
const BLOCKED_TOPICS = [
  'self-harm',
  'illegal-drugs',
  'extreme-diets'
]

// Use OpenAI moderation API
const moderation = await openai.moderations.create({
  input: userMessage
})

if (moderation.results[0].flagged) {
  return "I can't help with that. Please contact a healthcare professional."
}
```

---

## 📚 Resources

### Documentation
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

### Example Repos
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook)
- [LangChain](https://github.com/langchain-ai/langchain)
- [Vercel AI SDK](https://sdk.vercel.ai/)

---

## 🎉 Next Steps

1. **Choose your LLM provider** (OpenAI recommended for MVP)
2. **Set up API keys** in environment variables
3. **Implement Phase 1** (basic AI chat)
4. **Test with sample conversations**
5. **Gather user feedback**
6. **Iterate and improve**

**Ready to build?** Start with the basic OpenAI integration and expand from there!

**Questions?** The AI can handle them too! 😉
