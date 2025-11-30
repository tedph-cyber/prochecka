import OpenAI from "openai";

// Use OpenRouter as OpenAI-compatible endpoint
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "Prochecka Health Assistant",
  }
});

// System prompt for free-flowing diabetes chatbot
const SYSTEM_PROMPT = `You are Prochecka, a friendly and knowledgeable diabetes health assistant. Your role is to:

1. **General Health Conversations**: Engage naturally about diabetes, nutrition, exercise, and healthy living
2. **Personalized Advice**: Provide tailored diet plans, exercise routines, and health tips
3. **PIMA Assessment**: When asked, guide users through the PIMA diabetes risk assessment
4. **Support & Education**: Answer questions about diabetes management, symptoms, prevention

Guidelines:
- Be warm, empathetic, and encouraging
- Give evidence-based health information
- Ask clarifying questions when needed
- Suggest healthy lifestyle changes specific to diabetes prevention/management
- If medical emergency signs mentioned, urge immediate medical attention
- Never diagnose - only assess risk and provide general health guidance

When users want to take the PIMA test, explain you'll ask 8 questions about:
1. Pregnancies (number of times)
2. Glucose level (mg/dL)
3. Blood Pressure (mm Hg)
4. Skin Thickness (mm)
5. Insulin level (mu U/ml)
6. BMI (weight in kg/(height in m)^2)
7. Diabetes Pedigree Function (0.0-2.5)
8. Age (years)

**IMPORTANT**: After collecting all 8 answers, ALWAYS provide a clear risk assessment in this format:
"Based on your health metrics, your diabetes risk score is [NUMBER]/100."

Then provide personalized recommendations based on the risk level:
- Low Risk (0-39): Focus on prevention and maintaining healthy habits
- Moderate Risk (40-69): Emphasize lifestyle changes and monitoring
- High Risk (70-100): Urge medical consultation and immediate lifestyle interventions

For diet plans and routines, create detailed, practical plans customized to the user's needs.`;

export async function chatWithAI(
  messages: Array<{ role: string; content: string }>,
  userId?: string
) {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // or "anthropic/claude-3-sonnet", "meta-llama/llama-3-8b-instruct"
      messages: [{ role: "system" as const, content: SYSTEM_PROMPT }, ...messages] as any,
      temperature: 0.7,
      max_tokens: 800,
    });

    const choice = response.choices[0];

    return {
      type: "message",
      message: choice.message.content || "I'm here to help with your diabetes health questions!",
    };
  } catch (error: any) {
    console.error("AI Error:", error);
    console.error("Error details:", error.response?.data || error.message);
    return {
      type: "error",
      message: "Sorry, I encountered an error. Please try again.",
    };
  }
}

// Function to analyze PIMA inputs and generate personalized plan
export async function generatePersonalizedPlan(
  riskScore: number,
  userInputs: any,
  userId?: string
) {
  try {
    const prompt = `Based on these health metrics:
- Risk Score: ${riskScore}/100
- Glucose: ${userInputs.glucose} mg/dL
- BMI: ${userInputs.bmi}
- Blood Pressure: ${userInputs.bloodPressure} mm Hg
- Age: ${userInputs.age} years

Create a detailed, personalized health plan including:
1. Daily diet plan (breakfast, lunch, dinner, snacks)
2. Exercise routine (specific activities and duration)
3. Lifestyle modifications
4. Key focus areas

Make it practical, achievable, and diabetes-focused.`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system" as const, content: SYSTEM_PROMPT },
        { role: "user" as const, content: prompt }
      ] as any,
      temperature: 0.8,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Plan generation error:", error);
    return null;
  }
}
