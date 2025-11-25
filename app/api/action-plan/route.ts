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

    const { data: plan, error } = await supabase
      .from('action_plans')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching action plan:', error)
      return NextResponse.json({ error: 'Failed to fetch action plan' }, { status: 500 })
    }

    return NextResponse.json({ plan: plan || null })
  } catch (error) {
    console.error('Action plan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const { taskId, completed } = body

    if (!taskId || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch current plan
    const { data: currentPlan, error: fetchError } = await supabase
      .from('action_plans')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !currentPlan) {
      console.error('Error fetching plan:', fetchError)
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Update the specific task
    const updatedTasks = ((currentPlan as any).tasks as any[]).map((task: any) =>
      task.id === taskId ? { ...task, completed } : task
    )

    // Save updated tasks
    const { data: updatedPlan, error: updateError } = await (supabase
      .from('action_plans')
      .update as any)({
        tasks: updatedTasks,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating plan:', updateError)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    return NextResponse.json({ plan: updatedPlan })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
