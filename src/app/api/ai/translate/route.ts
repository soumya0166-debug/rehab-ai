// Next.js Route Handler: POST /api/ai/translate
// Translates exercise guidance into Hindi and Odia

import { NextRequest, NextResponse } from 'next/server';
import { translateText } from '@/lib/ai/translation';
import { TranslationInputSchema } from '@/lib/ai/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = TranslationInputSchema.parse(body);
    const result = await translateText(validatedInput);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Invalid translation request payload.',
      },
      { status: 400 }
    );
  }
}
