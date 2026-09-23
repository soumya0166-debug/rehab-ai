// Next.js Route Handler: POST /api/ai/session-summary
// Generates validated patient-friendly session summaries using Vercel AI SDK patterns

import { NextRequest, NextResponse } from 'next/server';
import { generateSessionSummary } from '@/lib/ai/session-summary';
import { SessionSummaryInputSchema } from '@/lib/ai/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = SessionSummaryInputSchema.parse(body);
    const summary = await generateSessionSummary(validatedInput);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Invalid session telemetry payload.',
      },
      { status: 400 }
    );
  }
}
