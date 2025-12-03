'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Password validation
  const hasMinLength = newPassword.length >= 8
  const hasUpperCase = /[A-Z]/.test(newPassword)
  const hasDigit = /[0-9]/.test(newPassword)
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  const isPasswordValid = hasMinLength && hasUpperCase && hasDigit && hasSymbol
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  useEffect(() => {
    // Check if user came from a valid reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth/sign-in')
      }
    })
  }, [router, supabase.auth])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 8 characters with uppercase, digit, and symbol')
      setStatus('error')
      return
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match')
      setStatus('error')
      return
    }

    setLoading(true)
    setStatus('idle')

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setStatus('success')
      
      // Redirect to sign-in after 3 seconds
      setTimeout(() => {
        router.push('/auth/sign-in')
      }, 3000)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to reset password')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-card to-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div 
            className="bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push('/')}
          >
            <Image 
              src="/images/logo.png" 
              alt="Prochecka Logo" 
              width={36} 
              height={36}
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Reset Your Password</h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              New Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="Enter new password"
                disabled={loading || status === 'success'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Requirements */}
            {newPassword.length > 0 && (
              <div className="space-y-1 text-xs">
                <div className={hasMinLength ? 'text-green-500' : 'text-muted-foreground'}>
                  {hasMinLength ? '✓' : '○'} At least 8 characters
                </div>
                <div className={hasUpperCase ? 'text-green-500' : 'text-muted-foreground'}>
                  {hasUpperCase ? '✓' : '○'} One uppercase letter
                </div>
                <div className={hasDigit ? 'text-green-500' : 'text-muted-foreground'}>
                  {hasDigit ? '✓' : '○'} One number
                </div>
                <div className={hasSymbol ? 'text-green-500' : 'text-muted-foreground'}>
                  {hasSymbol ? '✓' : '○'} One special character
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="Confirm new password"
                disabled={loading || status === 'success'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {confirmPassword.length > 0 && (
              <div className={`text-xs ${passwordsMatch ? 'text-green-500' : 'text-destructive'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}
          </div>

          {/* Status Messages */}
          <AnimatePresence mode="wait">
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  Password reset successfully! Redirecting to sign in...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isPasswordValid || !passwordsMatch || status === 'success'}
            className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        {/* Back to Sign In */}
        <div className="text-center">
          <button
            onClick={() => router.push('/auth/sign-in')}
            className="text-sm text-primary hover:underline transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}
