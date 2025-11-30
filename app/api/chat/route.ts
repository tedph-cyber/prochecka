import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

    const { data: messages, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Error fetching chat history:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Chat history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { role, text, is_final = false } = body

    if (!role || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: message, error } = await supabase
      .from('chat_history')
      .insert({
        user_id: user.id,
        role,
        text,
        is_final,
        timestamp: new Date().toISOString(),
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error saving message:', error)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Chat message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase.from('chat_history').delete().eq('user_id', user.id)

    if (error) {
      console.error('Error clearing chat:', error)
      return NextResponse.json({ error: 'Failed to clear chat' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
