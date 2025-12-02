import { NextRequest, NextResponse } from "next/server";
import { calculatePimaRisk, type PimaInput } from "@/lib/pima-calculator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input } = body as { input: PimaInput };

    // Validate input
    if (!input || typeof input !== 'object') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Calculate risk
    const result = calculatePimaRisk(input);

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('PIMA calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate risk score' },
      { status: 500 }
    );
  }
}
