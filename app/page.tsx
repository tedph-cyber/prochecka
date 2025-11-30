'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { MessageSquare, Activity, CheckCircle2, ArrowRight, Brain, Heart, Target, Sparkles, Shield, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

// Gradient background component (same as auth pages)
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

// Glass card component
const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    "relative backdrop-blur-sm bg-card/40 border border-border/50 rounded-2xl p-6 shadow-lg",
    "hover:bg-card/50 transition-all duration-300",
    className
  )}>
    {children}
  </div>
)

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-background">
      {/* Gradient Background */}
      <div className="fixed inset-0 z-0">
        <GradientBackground />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <nav className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="text-primary-foreground rounded-md p-1.5">
                <Image
                  src="/images/logo.png"
                  alt="Prochecka Logo"
                  width={32}
                  height={32}
                />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Prochecka
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/sign-in"
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground hover:text-primary transition-colors font-medium hidden sm:inline-block"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                AI-Powered Health Assistant
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Your Personalized{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-chart-3 to-chart-4">
                  Diabetes Prevention
                </span>{" "}
                Journey
              </h2>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Get instant diabetes risk assessment and AI-powered personalized
                action plans. Start your health journey today with our
                intelligent chatbot assistant.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
                <Link
                  href={user ? "/dashboard" : "/auth/sign-up"}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg"
                >
                  {user ? "Go to Dashboard" : "Start Free Assessment"}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 backdrop-blur-sm bg-card/40 border border-border/50 text-foreground rounded-xl hover:bg-card/50 transition-all font-semibold text-base sm:text-lg"
                >
                  Try as Guest
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                How Prochecka Works
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
                Simple, intelligent, and personalized health assessment in
                minutes
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <GlassCard>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                    <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                      Chat-Based Assessment
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Answer 8 simple questions through our friendly AI chatbot
                      interface
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-chart-3/10 text-chart-3 shrink-0">
                    <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                      AI Risk Analysis
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Advanced machine learning model analyzes your data
                      instantly
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-chart-4/10 text-chart-4 shrink-0">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                      Personalized Action Plan
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Get tailored daily tasks and routines based on your risk
                      factors
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-chart-1/10 text-chart-1 shrink-0">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                      Task Tracking
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Track your daily progress and build healthy habits over
                      time
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-chart-5/10 text-chart-5 shrink-0">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                      Health Monitoring
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Monitor your health metrics and see your progress
                      visualized
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-secondary/10 text-secondary shrink-0">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                      Privacy First
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Your health data is secure and private. Try as guest or
                      sign up
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto">
            <GlassCard className="p-8 sm:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                    8 Questions
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Quick & Easy Assessment
                  </div>
                </div>
                <div className="text-center border-t sm:border-t-0 sm:border-l border-border/50 pt-8 sm:pt-0">
                  <div className="flex items-center justify-center mb-3">
                    <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-chart-3" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                    AI Powered
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Advanced ML Model
                  </div>
                </div>
                <div className="text-center border-t sm:border-t-0 sm:border-l border-border/50 pt-8 sm:pt-0">
                  <div className="flex items-center justify-center mb-3">
                    <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-chart-4" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                    100% Free
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    No Hidden Costs
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
          <div className="max-w-7xl mx-auto">
            <GlassCard className="p-8 sm:p-12 lg:p-16 text-center">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6">
                Ready to Take Control of Your Health?
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8">
                Start your personalized diabetes prevention journey today. Get
                your risk score and action plan in under 5 minutes.
              </p>
              <Link
                href={user ? "/dashboard" : "/auth/sign-up"}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-base sm:text-lg shadow-lg"
              >
                {user ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </GlassCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-border/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="text-primary-foreground rounded-md p-1.5">
                  <Image
                    src="/images/logo.png"
                    alt="Prochecka Logo"
                    width={32}
                    height={32}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  Prochecka
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                © 2025 Prochecka. AI-Powered Health Assistant.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
