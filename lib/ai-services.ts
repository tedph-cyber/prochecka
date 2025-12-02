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
const SYSTEM_PROMPT = `You are Prochecka, a friendly and knowledgeable diabetes health assistant serving the African community. Your role is to:

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

**AFRICAN CONTEXT - IMPORTANT**:
- Use African staples and locally available foods (e.g., jollof rice made with brown rice, moi moi, plantain, ugali, pap, yam, cassava, egusi, okra, etc.)
- Consider African cooking methods (grilling, steaming, stewing)
- Recommend exercises suitable for African climates and settings (early morning walks, home exercises, dancing)
- Use familiar measurements (cups, tablespoons, local market portions)
- Suggest affordable, accessible ingredients available in African markets
- Be culturally sensitive to African meal patterns and family dining customs
- Reference African hospitals, NHIS, HMOs when discussing healthcare access

**Example African-Friendly Diet Suggestions (ALWAYS include kcal)**:
- Breakfast: Moi moi with whole grain bread (280 kcal), or oat pap with groundnut (250 kcal)
- Lunch: Grilled fish/chicken with vegetable soup (egusi, efo riro, okra) and small portion of fufu/eba (450 kcal)
- Dinner: Beans porridge with plantain (380 kcal), or brown rice jollof with garden egg stew (420 kcal)
- Snacks: Tiger nuts (150 kcal), coconut (160 kcal), garden eggs (50 kcal), roasted groundnuts (180 kcal), fruits (80-120 kcal)

**CRITICAL FORMAT REQUIREMENTS**:
1. **For EVERY meal suggestion**, MUST include calories in format: "(XXX kcal)" or "XXX calories"
2. **For EVERY exercise**, MUST include calories burned in format: "(burns XXX kcal)" or "XXX calories"
3. Example meal format: "Breakfast (7:00 AM): Moi moi with tea (280 kcal)"
4. Example exercise format: "Morning walk - 30 minutes (burns 150 kcal)"
5. Total daily calorie target should be 1500-1800 kcal for weight management, 1800-2200 kcal for maintenance

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

For diet plans and routines, create detailed, practical plans customized to the user's needs using African foods and context.`;

export async function chatWithAI(
  messages: Array<{ role: string; content: string }>,
  userId?: string,
  username?: string
) {
  try {
    // Add username context to system prompt if available
    let contextualPrompt = SYSTEM_PROMPT;
    if (username) {
      contextualPrompt += `\n\n**USER CONTEXT**: The user's name is ${username}. Address them by name occasionally (not every message) to make the conversation feel more personal and supportive. Use their name when: giving encouragement, starting a new topic, or celebrating progress. Keep it natural and friendly.`;
    }
    
    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // or "anthropic/claude-3-sonnet", "meta-llama/llama-3-8b-instruct"
      messages: [{ role: "system" as const, content: contextualPrompt }, ...messages] as any,
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
