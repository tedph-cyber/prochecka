import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if user profile exists, create if not
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        // Profile doesn't exist, create one
        const randomUsername = 'user_' + Math.random().toString(36).substring(2, 10)
        const result: any = await (supabase
          .from('user_profiles') as any)
          .insert({
            id: data.user.id,
            username: randomUsername,
            display_name: data.user.email?.split('@')[0] || randomUsername
          })
        
        const { error: insertError } = result
        if (insertError) {
          console.error('Error creating user profile:', insertError)
          // Continue anyway - user can create profile later
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
