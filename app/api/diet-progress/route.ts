import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get diet progress for today
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle() as any

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error
    }

    return NextResponse.json({ 
      checkedMeals: data?.notes ? JSON.parse(data.notes) : []
    })
  } catch (error) {
    console.error('Error fetching diet progress:', error)
    return NextResponse.json({ error: 'Failed to fetch diet progress' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { checkedMeals } = await request.json()
    const today = new Date().toISOString().split('T')[0]

    // Upsert diet progress
    const { error } = await (supabase
      .from('health_logs')
      .upsert({
        user_id: user.id,
        log_date: today,
        meal_type: 'diet_progress',
        notes: JSON.stringify(checkedMeals)
      } as any, {
        onConflict: 'user_id,log_date'
      }) as any)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving diet progress:', error)
    return NextResponse.json({ error: 'Failed to save diet progress' }, { status: 500 })
  }
}
