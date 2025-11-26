import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { calculateRiskAndNudge, PimaInput } from '@/lib/risk-prediction'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { inputs } = body as { inputs: PimaInput }

    if (!inputs) {
      return NextResponse.json({ error: 'Missing inputs' }, { status: 400 })
    }

    // Calculate risk and generate nudge
    const result = calculateRiskAndNudge(inputs)

    // Create tasks array with unique IDs
    const tasks = result.routine.map((text, index) => ({
      id: `task-${Date.now()}-${index}`,
      text,
      completed: false,
    }))

    // Store action plan in Supabase (upsert to update existing or create new)
    const { data: actionPlan, error: planError } = await supabase
      .from('action_plans')
      .upsert(
        {
          user_id: user.id,
          risk_score: result.riskScore,
          factor: result.topFactor,
          plan_message: result.nudgeMessage,
          tasks,
          updated_at: new Date().toISOString(),
        } as any,
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single()

    if (planError) {
      console.error('Error storing action plan:', planError)
      return NextResponse.json({ error: 'Failed to store action plan' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        tasks,
      },
    })
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
