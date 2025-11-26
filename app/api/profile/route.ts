import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Get user profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get existing profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, create it (for users who signed up before this feature)
    if (error && error.code === 'PGRST116') {
      console.log('Profile not found, creating one for user:', user.id)
      
      // Generate a random username
      const randomUsername = `user_${user.id.substring(0, 8)}`
      
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          username: randomUsername,
          display_name: null,
        } as any)
        .select()
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      return NextResponse.json({ profile: newProfile })
    }

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update username
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { username, display_name } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      )
    }

    // Check if profile exists first
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, create it first
    if (!existingProfile) {
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          username,
          display_name,
        } as any)
        .select()
        .single()

      if (createError) {
        if (createError.code === '23505') {
          return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
        }
        console.error('Error creating profile:', createError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      // Fetch the newly created profile
      const { data: newProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return NextResponse.json({ profile: newProfile })
    }

    // Update existing profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update({
        username,
        display_name,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
      console.error('Error updating profile:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
