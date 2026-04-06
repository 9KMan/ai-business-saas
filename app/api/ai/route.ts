import { NextRequest, NextResponse } from 'next/server';
import { interpretTask } from '@/lib/ai';
import type { SupportedLocale } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, lang = 'en' } = body as { text: string; lang: SupportedLocale };

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 1000) {
      return NextResponse.json({ error: 'Text too long (max 1000 characters)' }, { status: 400 });
    }

    const result = await interpretTask(text.trim(), lang);
    return NextResponse.json(result);
  } catch (err) {
    console.error('AI interpretation error:', err);
    const message = err instanceof Error ? err.message : 'Failed to interpret task';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
