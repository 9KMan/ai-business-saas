import type { AiInterpretationResult, SupportedLocale } from '@/types/database';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterMessage {
  role: 'system' | 'user';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function interpretTask(
  text: string,
  lang: SupportedLocale = 'en'
): Promise<AiInterpretationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }

  const systemPrompt = `You are a task parsing assistant. Parse natural language task descriptions into structured JSON.
Extract: title (short task name), description (additional details or null), priority (low/medium/high), due_date (ISO date string YYYY-MM-DD or null).

Examples:
- "Create 50 units of Product X ship by Dec 15" → {"title":"Create 50 units of Product X","description":"Ship by Dec 15","priority":"high","due_date":"2024-12-15"}
- "Review report by Friday high priority" → {"title":"Review report","description":null,"priority":"high","due_date":"[current-week-friday]"}
- "Buy groceries tomorrow" → {"title":"Buy groceries","description":null,"priority":"medium","due_date":"[tomorrow]"}
- "Call mom low priority" → {"title":"Call mom","description":null,"priority":"low","due_date":null}

Respond ONLY with valid JSON matching the schema. No markdown, no explanation.`;

  const userPrompt = `Parse this task description (language hint: ${lang}):\n${text}`;

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'AI Business SaaS',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
      messages,
      temperature: 0.3,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data: OpenRouterResponse = await response.json();
  const content = data.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('Empty response from AI');
  }

  // Strip markdown code blocks if present
  const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    const parsed = JSON.parse(cleaned) as AiInterpretationResult;
    // Validate fields
    if (!parsed.title || typeof parsed.title !== 'string') {
      throw new Error('AI response missing valid title');
    }
    if (!['low', 'medium', 'high'].includes(parsed.priority)) {
      parsed.priority = 'medium';
    }
    return parsed;
  } catch (err) {
    throw new Error(`Failed to parse AI response: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
  }
}
