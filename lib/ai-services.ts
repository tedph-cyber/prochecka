import OpenAI from "openai";
import { SYSTEM_PROMPT, AI_FUNCTIONS } from "./ai-prompts";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function chatWithAI(
  messages: Array<{ role: string; content: string }>,
  userId?: string
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      functions: AI_FUNCTIONS,
      function_call: "auto",
      temperature: 0.7,
      max_tokens: 500,
    });

    const choice = response.choices[0];

    // Check if function was called
    if (choice.message.function_call) {
      return {
        type: "function_call",
        function: choice.message.function_call.name,
        arguments: JSON.parse(choice.message.function_call.arguments),
        message: choice.message.content,
      };
    }

    return {
      type: "message",
      message: choice.message.content,
    };
  } catch (error) {
    console.error("AI Error:", error);
    return {
      type: "error",
      message: "Sorry, I encountered an error. Please try again.",
    };
  }
}
