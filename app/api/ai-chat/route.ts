import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { chatWithAI } from "@/lib/ai-service";
import { calculateRiskAndNudge } from "@/lib/risk-prediction";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { message, conversation_history, collected_metrics } = body;

    // Add user message to history
    const messages = [
      ...conversation_history,
      { role: "user", content: message },
    ];

    // Get AI response
    const aiResponse = await chatWithAI(messages, user?.id);

    // Handle function calls
    if (aiResponse.type === "function_call") {
      switch (aiResponse.function) {
        case "start_assessment":
          return NextResponse.json({
            message:
              aiResponse.message ||
              "Great! Let's begin your health assessment.",
            action: "start_assessment",
            state: "collecting_metrics",
          });

        case "record_health_metric":
          const { metric, value } = aiResponse.arguments;
          return NextResponse.json({
            message: "Got it! I've recorded that information.",
            action: "record_metric",
            metric,
            value,
            collected: { ...collected_metrics, [metric]: value },
          });

        case "calculate_risk":
          // Check if all metrics collected
          const required = [
            "pregnancies",
            "glucose",
            "blood_pressure",
            "bmi",
            "age",
          ];
          const hasAll = required.every(
            (m) => collected_metrics[m] !== undefined
          );

          if (hasAll) {
            const result = calculateRiskAndNudge(collected_metrics);
            return NextResponse.json({
              message: `Based on your health metrics, your diabetes risk score is ${result.riskScore}/100.`,
              action: "show_results",
              result,
            });
          }
          break;
      }
    }

    // Regular message response
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
