import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { chatWithAI } from "@/lib/ai-services";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { message, conversation_history } = body;

    // Build message history
    const messages = [
      ...conversation_history,
      { role: "user", content: message },
    ];

    // Get AI response
    const aiResponse = await chatWithAI(messages, user?.id);

    if (aiResponse.type === "error") {
      return NextResponse.json(
        { error: aiResponse.message },
        { status: 500 }
      );
    }

    // Save conversation to database if user is authenticated
    if (user) {
      await supabase.from("chat_history").insert({
        user_id: user.id,
        role: "user",
        text: message,
      } as any);

      await supabase.from("chat_history").insert({
        user_id: user.id,
        role: "assistant",
        text: aiResponse.message,
      } as any);
    }

    // Return AI message
    return NextResponse.json({
      message: aiResponse.message,
      action: "continue_conversation",
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
