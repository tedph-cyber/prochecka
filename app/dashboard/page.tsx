'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/ui/header'
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "@/components/ui/chat-input"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import GuestSignInPrompt from '@/components/GuestSignInPrompt'
import { 
  createOrGetGuestSession, 
  getGuestData, 
  setGuestData, 
  isGuestMode 
} from '@/lib/guest-session'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'

// Gradient background component (same as home/auth pages)
const GradientBackground = () => (
  <>
    <style>
      {`@keyframes float1 { 0% { transform: translate(0, 0); } 50% { transform: translate(-10px, 10px); } 100% { transform: translate(0, 0); } } @keyframes float2 { 0% { transform: translate(0, 0); } 50% { transform: translate(10px, -10px); } 100% { transform: translate(0, 0); } }`}
    </style>
    <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute top-0 left-0 w-full h-full">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: 'var(--color-primary)', stopOpacity:0.8}} /><stop offset="100%" style={{stopColor: 'var(--color-chart-3)', stopOpacity:0.6}} /></linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: 'var(--color-chart-4)', stopOpacity:0.9}} /><stop offset="50%" style={{stopColor: 'var(--color-secondary)', stopOpacity:0.7}} /><stop offset="100%" style={{stopColor: 'var(--color-chart-1)', stopOpacity:0.6}} /></linearGradient>
        <radialGradient id="grad3" cx="50%" cy="50%" r="50%"><stop offset="0%" style={{stopColor: 'var(--color-destructive)', stopOpacity:0.8}} /><stop offset="100%" style={{stopColor: 'var(--color-chart-5)', stopOpacity:0.4}} /></radialGradient>
        <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="35"/></filter>
        <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="25"/></filter>
        <filter id="blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="45"/></filter>
      </defs>
      <g style={{ animation: 'float1 20s ease-in-out infinite' }}>
        <ellipse cx="200" cy="500" rx="250" ry="180" fill="url(#grad1)" filter="url(#blur1)" transform="rotate(-30 200 500)"/>
        <rect x="500" y="100" width="300" height="250" rx="80" fill="url(#grad2)" filter="url(#blur2)" transform="rotate(15 650 225)"/>
      </g>
      <g style={{ animation: 'float2 25s ease-in-out infinite' }}>
        <circle cx="650" cy="450" r="150" fill="url(#grad3)" filter="url(#blur3)" opacity="0.7"/>
        <ellipse cx="50" cy="150" rx="180" ry="120" fill="var(--color-accent)" filter="url(#blur2)" opacity="0.8"/>
      </g>
    </svg>
  </>
)

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showActionPlan, setShowActionPlan] = useState(false)
  const [showGuestPrompt, setShowGuestPrompt] = useState(false)
  const [showPimaInfo, setShowPimaInfo] = useState(false)
  const [actionPlan, setActionPlan] = useState<any>(null)
  const [pimaAnswersCount, setPimaAnswersCount] = useState(0)
  const [isInPimaAssessment, setIsInPimaAssessment] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    initializeSession()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeSession = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (user) {
      // Authenticated user
      setUser(user)
      setIsGuest(false)
      loadChatHistory()
      loadActionPlan()
    } else {
      // Guest mode
      setIsGuest(true)
      await createOrGetGuestSession()
      loadGuestData()
    }
  }

  const loadGuestData = () => {
    const guestData = getGuestData()
    if (guestData?.messages && guestData.messages.length > 0) {
      // Convert old format to new if needed
      const convertedMessages = guestData.messages.map((msg: any) => ({
        id: msg.id || Date.now().toString(),
        role: msg.role,
        content: msg.text || msg.content,
        timestamp: msg.timestamp
      }))
      setMessages(convertedMessages)
      
      if (guestData.result) {
        setActionPlan(guestData.result)
      }
    } else {
      // Send welcome message
      sendWelcomeMessage()
    }
  }

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/chat')
      const data = await response.json()

      if (data.messages && data.messages.length > 0) {
        // Convert from database format
        const convertedMessages = data.messages.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          role: msg.role,
          content: msg.content || msg.text,
          timestamp: msg.timestamp || msg.created_at
        }))
        setMessages(convertedMessages)
      } else {
        // Send welcome message
        sendWelcomeMessage()
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      sendWelcomeMessage()
    }
  }

  const loadActionPlan = async () => {
    try {
      const response = await fetch('/api/action-plan')
      const data = await response.json()
      if (data.plan) {
        setActionPlan(data.plan)
      }
    } catch (error) {
      console.error('Error loading action plan:', error)
    }
  }

  const sendWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `👋 Hi! I'm **Prochecka**, your diabetes health assistant!\n\nI can help you with:\n\n✨ **General health conversations** about diabetes, nutrition, and wellness\n\n📊 **PIMA Diabetes Risk Assessment** - A quick, scientifically validated test that evaluates your Type 2 diabetes risk. <span class="pima-link" data-action="open-pima-info" style="color: var(--color-primary); text-decoration: underline; cursor: pointer;">Learn more about PIMA</span>\n\n🍽️ **Personalized meal plans** and exercise routines\n💡 **Health tips** tailored just for you\n\nWhat would you like to talk about today?`,
      timestamp: new Date().toISOString()
    }
    
    setMessages([welcomeMessage])
    
    if (isGuest) {
      saveGuestData({ messages: [welcomeMessage] })
    }
  }

  const saveGuestData = (data: any) => {
    const existingData = getGuestData() || {}
    const updatedData = {
      ...existingData,
      ...data,
      timestamp: new Date().toISOString()
    }
    setGuestData(updatedData)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    setLoading(true)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')

    // Create new abort controller for this request
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      // Build conversation history for AI
      const conversationHistory = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Call AI chat endpoint with abort signal
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_history: conversationHistory.slice(0, -1) // Exclude the message we just sent
        }),
        signal: abortController.signal
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      }

      const updatedMessages = [...newMessages, aiMessage]
      setMessages(updatedMessages)

      // Check if this is a PIMA assessment starting
      const isPimaStart = userMessage.content.toLowerCase().includes('pima') || 
                          userMessage.content.toLowerCase().includes('assessment') ||
                          userMessage.content.toLowerCase().includes('diabetes risk')
      
      if (isPimaStart && !isInPimaAssessment) {
        setIsInPimaAssessment(true)
        setPimaAnswersCount(0)
      }

      // Track PIMA answers for guests (count user answers, not AI responses)
      if (isGuest && isInPimaAssessment) {
        // Increment answer count for each user message during assessment
        const newCount = pimaAnswersCount + 1
        setPimaAnswersCount(newCount)

        // Check if assessment is complete (8 questions answered)
        if (newCount >= 8) {
          // Extract risk score from AI message or use default
          const riskScore = extractRiskScore(aiMessage.content) || 65
          
          // Save result and show prompt
          const result = {
            risk_score: riskScore,
            completed_at: new Date().toISOString(),
            factor: 'Based on your health assessment',
            plan_message: 'Sign in to view your personalized health plan and track your progress.'
          }
          saveGuestData({ messages: updatedMessages, result })
          setActionPlan(result)
          
          // Reset assessment state
          setIsInPimaAssessment(false)
          
          // Show sign-in prompt after a brief delay
          setTimeout(() => {
            setShowGuestPrompt(true)
          }, 1500)
        }
      }

      // Save to storage
      if (isGuest) {
        saveGuestData({ messages: updatedMessages })
      }

    } catch (error: any) {
      // Handle abort specifically
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        console.log('Request was aborted by user')
        // Don't show error message for user-initiated stops
      } else {
        console.error('Chat error:', error)
        toast.error(error.message || 'Failed to send message')
        
        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I encountered an error. Please make sure you've set up your OPENROUTER_API_KEY in the .env file. Check the console for more details.",
          timestamp: new Date().toISOString()
        }
        setMessages([...newMessages, errorMessage])
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setLoading(false)
    }
  }

  const handleChatSubmit = () => {
    handleSubmit()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/sign-in')
  }

  const handleResetChat = async () => {
    if (!confirm('Are you sure you want to start a new conversation? This will clear your chat history.')) {
      return
    }

    if (!isGuest) {
      await fetch('/api/chat', { method: 'DELETE' })
    }
    
    setMessages([])
    
    if (isGuest) {
      saveGuestData({ messages: [], inputs: {}, result: undefined })
    }
    
    sendWelcomeMessage()
  }

  const startPimaAssessment = () => {
    const pimaMessage = "I want to start the PIMA diabetes risk assessment"
    setInput(pimaMessage)
    setIsInPimaAssessment(true)
    setPimaAnswersCount(0)
    // Simulate user clicking submit
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }, 100)
  }

  const extractRiskScore = (message: string): number | null => {
    // Try to extract risk score from AI message
    const scoreMatch = message.match(/risk score[:\s]+([0-9]+)/i)
    if (scoreMatch) {
      return parseInt(scoreMatch[1])
    }
    // Look for percentage
    const percentMatch = message.match(/([0-9]+)%/)
    if (percentMatch) {
      return parseInt(percentMatch[1])
    }
    return null
  }

  // Format markdown-style text for display
  const formatMessageContent = (content: string) => {
    // Split by lines to preserve structure
    const lines = content.split('\n')
    
    return lines.map((line, lineIndex) => {
      // Check if line contains the PIMA link
      if (line.includes('data-action="open-pima-info"')) {
        // Parse and render the link as a clickable element
        const parts = line.split(/<span class="pima-link"[^>]*>|<\/span>/)
        return (
          <div key={lineIndex}>
            {parts[0]}
            {parts[1] && (
              <span 
                className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors"
                onClick={() => setShowPimaInfo(true)}
              >
                {parts[1]}
              </span>
            )}
            {parts[2]}
          </div>
        )
      }

      // Process each line for inline formatting
      const parts: React.ReactNode[] = []
      let currentIndex = 0
      
      // Match **bold**, *italic*, `code`, and bullet points
      const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|^[•\-\*]\s)/g
      let match
      
      while ((match = regex.exec(line)) !== null) {
        // Add text before match
        if (match.index > currentIndex) {
          parts.push(line.substring(currentIndex, match.index))
        }
        
        const matched = match[0]
        if (matched.startsWith('**') && matched.endsWith('**')) {
          // Bold text
          parts.push(<strong key={`${lineIndex}-${match.index}`}>{matched.slice(2, -2)}</strong>)
        } else if (matched.startsWith('*') && matched.endsWith('*') && !matched.startsWith('**')) {
          // Italic text
          parts.push(<em key={`${lineIndex}-${match.index}`}>{matched.slice(1, -1)}</em>)
        } else if (matched.startsWith('`') && matched.endsWith('`')) {
          // Code text
          parts.push(<code key={`${lineIndex}-${match.index}`} className="bg-muted px-1 rounded text-sm">{matched.slice(1, -1)}</code>)
        } else if (matched.match(/^[•\-\*]\s/)) {
          // Bullet point - already captured
          parts.push(matched)
        }
        
        currentIndex = match.index + matched.length
      }
      
      // Add remaining text
      if (currentIndex < line.length) {
        parts.push(line.substring(currentIndex))
      }
      
      return (
        <div key={lineIndex}>
          {parts.length > 0 ? parts : line}
        </div>
      )
    })
  }

  return (
    <div className="relative flex flex-col lg:flex-row h-screen overflow-hidden bg-background">
      {/* Gradient Background */}
      <div className="fixed inset-0 z-0">
        <GradientBackground />
      </div>

      {/* Main Chat Area */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <Header
          user={user}
          isGuest={isGuest}
          actionPlan={actionPlan}
          messagesLength={messages.length}
          onSignOut={handleSignOut}
          onResetChat={handleResetChat}
          onViewPlan={() => setShowActionPlan(true)}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 pb-28 sm:pb-32 md:pb-36 min-h-0">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
            {/* Quick Action Button - Show only if no messages yet or first message */}
            {messages.length <= 1 && (
              <div className="flex flex-col items-center gap-3 mb-6">
                <Button
                  onClick={startPimaAssessment}
                  className="backdrop-blur-md bg-primary/90 hover:bg-primary text-primary-foreground rounded-xl px-6 py-6 shadow-xl border border-primary/20"
                  disabled={loading}
                >
                  <span className="text-base sm:text-lg font-semibold">
                    🎯 Start PIMA Risk Assessment
                  </span>
                </Button>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Or just chat with me about diabetes health!
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] md:max-w-[75%] rounded-2xl sm:rounded-3xl px-4 sm:px-5 md:px-7 py-3 sm:py-4 md:py-5 ${
                    message.role === "user"
                      ? "bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-xl"
                      : "backdrop-blur-md bg-card/60 text-card-foreground shadow-lg border border-border/50"
                  }`}
                >
                  <div className="text-sm sm:text-base md:text-lg leading-relaxed space-y-1">
                    {formatMessageContent(message.content)}
                  </div>
                  <div
                    className={`text-xs sm:text-sm mt-2 sm:mt-2.5 opacity-70`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="backdrop-blur-md bg-card/60 rounded-2xl sm:rounded-3xl px-4 sm:px-5 md:px-7 py-3 sm:py-4 md:py-5 shadow-lg border border-border/50">
                  <div className="flex space-x-2 sm:space-x-2.5">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary/60 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Floating */}
        <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 px-4 sm:px-6 md:px-8 pointer-events-none z-20">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <div className="w-full backdrop-blur-md bg-card/70 rounded-2xl shadow-2xl border border-border/50">
              <ChatInput
                variant="default"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onSubmit={handleChatSubmit}
                loading={loading}
                onStop={handleStop}
              >
                <ChatInputTextArea placeholder="Ask me anything about diabetes health..." />
                <ChatInputSubmit />
              </ChatInput>
            </div>
          </div>
        </div>
      </div>

      {/* Action Plan Modal */}
      {showActionPlan && actionPlan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="backdrop-blur-xl bg-card/90 border border-border/50 w-full sm:w-[90%] sm:max-w-3xl sm:rounded-t-3xl rounded-t-3xl sm:rounded-b-3xl max-h-[85vh] sm:max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-5 sm:py-6 border-b border-border/50 shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  Your Action Plan
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
                  Risk Score:{" "}
                  <span className="font-semibold text-primary">
                    {actionPlan.risk_score}/100
                  </span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowActionPlan(false)}
                className="rounded-full"
              >
                <span className="text-2xl">×</span>
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 sm:py-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Risk Factor */}
                <div className="backdrop-blur-sm bg-primary/10 rounded-xl p-4 sm:p-5 border border-primary/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Primary Factor
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {actionPlan.factor}
                  </p>
                </div>

                {/* Plan Message */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3">
                    Personalized Plan
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {actionPlan.plan_message}
                  </p>
                </div>

                {/* Tasks */}
                {actionPlan.tasks && actionPlan.tasks.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3">
                      Daily Tasks
                    </h3>
                    <div className="space-y-2">
                      {actionPlan.tasks.map((task: any, index: number) => (
                        <div
                          key={index}
                          className="backdrop-blur-sm bg-card/40 rounded-lg p-3 sm:p-4 border border-border/30"
                        >
                          <p className="text-sm sm:text-base">{task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Sign-In Prompt */}
      {showGuestPrompt && isGuest && actionPlan && (
        <GuestSignInPrompt
          riskScore={actionPlan.risk_score || 65}
          onClose={() => setShowGuestPrompt(false)}
        />
      )}

      {/* PIMA Information Dialog */}
      <Dialog open={showPimaInfo} onOpenChange={setShowPimaInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📊 About the PIMA Diabetes Test</DialogTitle>
            <DialogDescription>
              Understanding your diabetes risk assessment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-sm sm:text-base">
            <p className="text-foreground leading-relaxed">
              The <strong>PIMA Diabetes Test</strong> is a scientifically validated assessment tool developed using data from the Pima Indian population, who have one of the highest rates of Type 2 diabetes in the world. This makes it an exceptionally accurate predictor of diabetes risk.
            </p>

            <div>
              <h4 className="font-semibold text-foreground mb-2">The Test Evaluates 8 Key Health Metrics:</h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-primary">🤰</span>
                  <div>
                    <strong>Pregnancies:</strong> Number of times pregnant (women only)
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">🩸</span>
                  <div>
                    <strong>Glucose Level:</strong> Plasma glucose concentration (mg/dL)
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">💓</span>
                  <div>
                    <strong>Blood Pressure:</strong> Diastolic blood pressure (mm Hg)
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">📏</span>
                  <div>
                    <strong>Skin Thickness:</strong> Triceps skin fold thickness (mm)
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">💉</span>
                  <div>
                    <strong>Insulin:</strong> 2-hour serum insulin (μU/mL)
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">⚖️</span>
                  <div>
                    <strong>BMI:</strong> Body mass index (weight in kg/(height in m)²)
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">🧬</span>
                  <div>
                    <strong>Diabetes Pedigree:</strong> Family history function score
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">🎂</span>
                  <div>
                    <strong>Age:</strong> Your current age in years
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">✨ What You'll Get:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Personalized diabetes risk score (0-100)</li>
                <li>• Identification of your primary risk factors</li>
                <li>• Actionable health recommendations</li>
                <li>• Customized meal and exercise plans</li>
                <li>• Ongoing support and tracking</li>
              </ul>
            </div>

            <p className="text-muted-foreground text-sm italic">
              <strong>Note:</strong> The assessment takes just 3-5 minutes. Don't worry if you don't know exact values - estimates work fine! This is a screening tool, not a diagnosis. Always consult with healthcare professionals for medical advice.
            </p>

            <Button 
              onClick={() => {
                setShowPimaInfo(false)
                startPimaAssessment()
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Start PIMA Assessment Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
