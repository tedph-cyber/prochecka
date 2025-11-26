'use client'

import { AuthComponent } from '@/components/ui/auth-component'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const Logo = () => (
  <div className="text-primary-foreground rounded-md p-1.5 text-3xl">
        <Image src="/images/logo.png" alt="Prochecka Logo" width={24} height={24} />{" "}
  </div>
)

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    // Wait a bit for the success animation, then redirect
    setTimeout(() => {
      router.push('/auth/setup-username')
      router.refresh()
    }, 3000)
  }

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  const handleGitHubSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  return (
    <AuthComponent 
      mode="signup"
      logo={<Logo />}
      brandName="Prochecka"
      onSubmit={handleSignUp}
      onGoogleAuth={handleGoogleSignUp}
      onGitHubAuth={handleGitHubSignUp}
    />
  )
}
