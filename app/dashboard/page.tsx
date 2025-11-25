'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PIMA_FEATURES, PimaInput, validateInput } from '@/lib/risk-prediction'
import { useRouter } from 'next/navigation'
import ActionPlanSidebar from '@/components/ActionPlanSidebar'
import EmergencyButton from '@/components/EmergencyButton'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
  is_final?: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userInputs, setUserInputs] = useState<Partial<PimaInput>>({})
  const [predictionComplete, setPredictionComplete] = useState(false)
  const [actionPlan, setActionPlan] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    loadChatHistory()
    loadActionPlan()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/sign-in')
    } else {
      setUser(user)
    }
  }

  const loadChatHistory = async () => {
    const response = await fetch('/api/chat')
    const data = await response.json()

    if (data.messages && data.messages.length > 0) {
      setMessages(data.messages)
      // Determine current question based on user responses
      const userMessages = data.messages.filter((m: Message) => m.role === 'user')
      setCurrentQuestion(userMessages.length)

      // Reconstruct user inputs
      const inputs: Partial<PimaInput> = {}
      userMessages.forEach((msg: Message, idx: number) => {
        if (idx < PIMA_FEATURES.length) {
          const featureName = PIMA_FEATURES[idx].name as keyof PimaInput
          inputs[featureName] = parseFloat(msg.text)
        }
      })
      setUserInputs(inputs)

      // Check if prediction is complete
      const finalMessage = data.messages.find((m: Message) => m.is_final)
      if (finalMessage) {
        setPredictionComplete(true)
      }
    } else {
      // Start new conversation
      askFirstQuestion()
    }
  }

  const loadActionPlan = async () => {
    const response = await fetch('/api/action-plan')
    const data = await response.json()
    if (data.plan) {
      setActionPlan(data.plan)
    }
  }

  const askFirstQuestion = async () => {
    const firstQuestion = PIMA_FEATURES[0].question
    const botMessage = {
      role: 'assistant' as const,
      text: `Hello! I'm your Prochecka Health Assistant. I'll ask you 8 questions to assess your diabetes risk and create a personalized action plan. Let's begin:\n\n${firstQuestion}`,
      is_final: false,
    }

    await saveMessage(botMessage)
    setMessages((prev) => [
      ...prev,
      { ...botMessage, id: Date.now().toString(), timestamp: new Date().toISOString() },
    ])
  }

  const saveMessage = async (message: {
    role: 'user' | 'assistant'
    text: string
    is_final?: boolean
  }) => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      })
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || predictionComplete) return

    const value = parseFloat(input.trim())

    // Validate input
    if (isNaN(value) || !validateInput(currentQuestion, value)) {
      const feature = PIMA_FEATURES[currentQuestion]
      alert(`Please enter a valid number between ${feature.min} and ${feature.max}`)
      return
    }

    setLoading(true)

    // Save user message
    const userMessage = {
      role: 'user' as const,
      text: input.trim(),
      is_final: false,
    }

    await saveMessage(userMessage)
    setMessages((prev) => [
      ...prev,
      { ...userMessage, id: Date.now().toString(), timestamp: new Date().toISOString() },
    ])

    // Update user inputs
    const featureName = PIMA_FEATURES[currentQuestion].name as keyof PimaInput
    const updatedInputs = { ...userInputs, [featureName]: value }
    setUserInputs(updatedInputs)

    setInput('')

    // Check if we need to ask next question or run prediction
    if (currentQuestion < PIMA_FEATURES.length - 1) {
      // Ask next question
      const nextQuestion = PIMA_FEATURES[currentQuestion + 1].question
      const botMessage = {
        role: 'assistant' as const,
        text: nextQuestion,
        is_final: false,
      }

      setTimeout(async () => {
        await saveMessage(botMessage)
        setMessages((prev) => [
          ...prev,
          { ...botMessage, id: Date.now().toString(), timestamp: new Date().toISOString() },
        ])
        setCurrentQuestion((prev) => prev + 1)
        setLoading(false)
      }, 500)
    } else {
      // All questions answered, run prediction
      setTimeout(async () => {
        try {
          const response = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: updatedInputs }),
          })

          const data = await response.json()

          if (data.success) {
            const finalMessage = {
              role: 'assistant' as const,
              text: `🎯 **Risk Assessment Complete!**\n\n**Your Prochecka Risk Score: ${data.result.riskScore}/100**\n\n**Primary Factor: ${data.result.topFactor}**\n\n${data.result.nudgeMessage}\n\n✨ I've created a personalized daily routine for you! Check the Action Plan sidebar on the right to see your tasks and start tracking your progress.`,
              is_final: true,
            }

            await saveMessage(finalMessage)
            setMessages((prev) => [
              ...prev,
              {
                ...finalMessage,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
              },
            ])
            setPredictionComplete(true)
            setActionPlan({
              risk_score: data.result.riskScore,
              factor: data.result.topFactor,
              plan_message: data.result.nudgeMessage,
              tasks: data.result.tasks,
            })
          }
        } catch (error) {
          console.error('Prediction error:', error)
          const errorMessage = {
            role: 'assistant' as const,
            text: 'Sorry, there was an error processing your assessment. Please try again.',
            is_final: false,
          }
          await saveMessage(errorMessage)
          setMessages((prev) => [
            ...prev,
            {
              ...errorMessage,
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
            },
          ])
        }
        setLoading(false)
      }, 1000)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/sign-in')
  }

  const handleResetChat = async () => {
    if (!confirm('Are you sure you want to start a new assessment? This will clear your chat history.')) {
      return
    }

    await fetch('/api/chat', { method: 'DELETE' })
    setMessages([])
    setCurrentQuestion(0)
    setUserInputs({})
    setPredictionComplete(false)
    askFirstQuestion()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prochecka Health Assistant</h1>
              <p className="text-sm text-gray-600 mt-1">
                {user && (
                  <>
                    User ID: <span className="font-mono text-xs">{user.id}</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              {messages.length > 0 && (
                <button
                  onClick={handleResetChat}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  New Assessment
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-6 py-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || predictionComplete}
                placeholder={
                  predictionComplete
                    ? 'Assessment complete! Start a new assessment to continue.'
                    : 'Type your answer...'
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || predictionComplete || !input.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Send
              </button>
            </div>
            {currentQuestion < PIMA_FEATURES.length && !predictionComplete && (
              <div className="mt-3 text-sm text-gray-600">
                Question {currentQuestion + 1} of {PIMA_FEATURES.length} •{' '}
                {PIMA_FEATURES[currentQuestion].name}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Action Plan Sidebar */}
      <ActionPlanSidebar plan={actionPlan} onUpdate={loadActionPlan} />

      {/* Emergency Button */}
      <EmergencyButton />
    </div>
  )
}
