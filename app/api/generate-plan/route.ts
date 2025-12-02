import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { type, userProfile, healthData } = await request.json()

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    let prompt = ''
    
    if (type === 'diet') {
      prompt = `Create a detailed, personalized diabetes-friendly meal plan for the following patient:

User Profile:
${JSON.stringify(userProfile, null, 2)}

Health Data:
${JSON.stringify(healthData, null, 2)}

Requirements:
1. Create 6 meals for a full day (breakfast, morning snack, lunch, afternoon snack, dinner, evening snack)
2. For each meal provide:
   - Time suggestion
   - Specific food items (3-5 items per meal)
   - Estimated calories
   - Brief nutritional note
3. Keep total daily calories between 1800-2200
4. Focus on low glycemic index foods
5. Balance macronutrients (40% carbs, 30% protein, 30% healthy fats)
6. Include variety and make it culturally appropriate
7. Avoid processed foods and added sugars

Format your response as a JSON object with this structure:
{
  "meals": [
    {
      "time": "7:00 AM",
      "name": "Breakfast",
      "items": ["item1", "item2", "item3"],
      "calories": 350,
      "note": "Brief nutritional note"
    },
    ...
  ],
  "totalCalories": 2000,
  "guidelines": ["guideline1", "guideline2", ...]
}`
    } else if (type === 'exercise') {
      prompt = `Create a personalized exercise routine for a diabetes patient with the following profile:

User Profile:
${JSON.stringify(userProfile, null, 2)}

Health Data:
${JSON.stringify(healthData, null, 2)}

Requirements:
1. Create 6-8 exercises suitable for diabetes management
2. For each exercise provide:
   - Exercise name
   - Duration
   - Sets and reps (if applicable)
   - Estimated calories burned
   - Brief safety note
3. Total routine should burn 400-600 calories
4. Mix cardio, strength training, and flexibility
5. Consider any physical limitations
6. Start with warm-up, end with cool-down
7. Make it achievable for beginners

Format your response as a JSON object with this structure:
{
  "exercises": [
    {
      "id": "1",
      "name": "Exercise name",
      "duration": "X minutes",
      "sets": "X sets" (optional),
      "reps": "X reps" (optional),
      "calories": 150,
      "note": "Safety tip"
    },
    ...
  ],
  "totalCalories": 500,
  "tips": ["tip1", "tip2", ...]
}`
    } else if (type === 'action_plan') {
      prompt = `Create a comprehensive diabetes action plan for the following patient:

User Profile:
${JSON.stringify(userProfile, null, 2)}

Health Data:
${JSON.stringify(healthData, null, 2)}

Requirements:
1. Assess diabetes risk level (Low/Moderate/High/Very High)
2. Identify primary risk factors
3. Provide 5-7 actionable recommendations
4. Create daily tasks for the first week
5. Set achievable health goals
6. Include monitoring guidelines

Format your response as a JSON object with this structure:
{
  "riskLevel": "Moderate",
  "riskScore": 65,
  "primaryRisks": ["risk1", "risk2"],
  "recommendations": ["rec1", "rec2", ...],
  "weeklyTasks": [
    {"day": "Monday", "task": "Check fasting blood sugar", "completed": false},
    ...
  ],
  "goals": ["goal1", "goal2", ...],
  "monitoringPlan": {
    "bloodSugar": "Check 2x daily (fasting, 2hr post-meal)",
    "weight": "Weekly",
    "bloodPressure": "Weekly"
  }
}`
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Prochecka Health App'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a professional diabetes educator and nutritionist. Provide evidence-based, personalized health guidance. Always respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate plan from AI')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from AI')
    }

    // Parse the JSON response
    let planData
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      planData = JSON.parse(cleanedContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      throw new Error('AI returned invalid JSON format')
    }

    return NextResponse.json({ 
      success: true,
      data: planData,
      type
    })

  } catch (error: any) {
    console.error('Error generating plan:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate plan' },
      { status: 500 }
    )
  }
}
