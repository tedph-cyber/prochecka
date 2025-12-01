'use client'

import { AuthComponent } from '@/components/ui/auth-component'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const Logo = () => (
  <div className="bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/'}>
    <Image 
      src="/images/logo.png" 
      alt="Prochecka Logo" 
      width={36} 
      height={36}
    />
  </div>
)

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    // Wait a bit for the success animation, then redirect
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 3000)
  }

  const handleGoogleSignIn = async () => {
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

  return (
    <AuthComponent 
      mode="signin"
      logo={<Logo />}
      brandName="Prochecka"
      onSubmit={handleSignIn}
      onGoogleAuth={handleGoogleSignIn}
    />
  )
}
