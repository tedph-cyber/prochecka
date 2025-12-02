import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get exercise progress for today
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle() as any

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ 
      completedExercises: data?.notes ? JSON.parse(data.notes) : []
    })
  } catch (error) {
    console.error('Error fetching exercise progress:', error)
    return NextResponse.json({ error: 'Failed to fetch exercise progress' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { completedExercises } = await request.json()
    const today = new Date().toISOString().split('T')[0]

    // Upsert exercise progress
    const { error } = await (supabase
      .from('health_logs')
      .upsert({
        user_id: user.id,
        log_date: today,
        exercise_type: 'routine_progress',
        notes: JSON.stringify(completedExercises)
      } as any, {
        onConflict: 'user_id,log_date'
      }) as any)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving exercise progress:', error)
    return NextResponse.json({ error: 'Failed to save exercise progress' }, { status: 500 })
  }
}
