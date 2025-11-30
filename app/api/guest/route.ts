import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

// Create or get guest session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json()
    const { session_token } = body

    // If session token provided, try to get existing session
    if (session_token) {
      const { data: existingSession, error } = await supabase
        .from('guest_sessions')
        .select('*')
        .eq('session_token', session_token)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (!error && existingSession) {
        return NextResponse.json({ session: existingSession })
      }
    }

    // Create new guest session
    const newToken = uuidv4()
    const result: any = await (supabase
      .from('guest_sessions') as any)
      .insert({
        session_token: newToken,
        assessment_data: {},
      })
      .select()
      .single()
    
    const { data: session, error } = result

    if (error) {
      console.error('Error creating guest session:', error)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Guest session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update guest session with assessment data
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json()
    const { session_token, assessment_data, risk_score } = body

    if (!session_token) {
      return NextResponse.json({ error: 'Session token required' }, { status: 400 })
    }

    const result: any = await (supabase
      .from('guest_sessions') as any)
      .update({
        assessment_data,
        risk_score,
      })
      .eq('session_token', session_token)
      .select()
      .single()
    
    const { data: session, error } = result

    if (error) {
      console.error('Error updating guest session:', error)
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Guest session update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Convert guest session to user account
export async function PUT(request: NextRequest) {
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
    const { session_token } = body

    if (!session_token) {
      return NextResponse.json({ error: 'Session token required' }, { status: 400 })
    }

    // Get guest session
    const result: any = await supabase
      .from('guest_sessions')
      .select('*')
      .eq('session_token', session_token)
      .single()
    
    const { data: guestSession, error: fetchError } = result

    if (fetchError || !guestSession) {
      return NextResponse.json({ error: 'Guest session not found' }, { status: 404 })
    }

    // Mark session as converted
    await ((supabase
      .from('guest_sessions') as any)
      .update({ converted_to_user_id: user.id })
      .eq('session_token', session_token))

    // If there's assessment data, create action plan for user
    if (guestSession.assessment_data && guestSession.risk_score) {
      const assessmentData = guestSession.assessment_data as any

      // Check if action plan already exists
      const { data: existingPlan } = await supabase
        .from('action_plans')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!existingPlan && assessmentData.result) {
        // Create action plan from guest data
        await ((supabase.from('action_plans') as any).insert({
          user_id: user.id,
          risk_score: assessmentData.result.riskScore,
          factor: assessmentData.result.topFactor,
          plan_message: assessmentData.result.nudgeMessage,
          tasks: assessmentData.result.tasks || [],
        }))
      }

      // Transfer chat history if exists
      if (assessmentData.messages && Array.isArray(assessmentData.messages)) {
        const chatMessages = assessmentData.messages.map((msg: any) => ({
          user_id: user.id,
          role: msg.role,
          text: msg.text,
          timestamp: msg.timestamp || new Date().toISOString(),
          is_final: msg.is_final || false,
        }))

        await ((supabase.from('chat_history') as any).insert(chatMessages))
      }
    }

    return NextResponse.json({ success: true, converted: true })
  } catch (error) {
    console.error('Guest conversion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
