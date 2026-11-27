import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { sanitizeClientError } from '@/lib/security/sanitizeClientError';

/**
 * Authenticated server-side proxy for the Dashboard AI Receptionist Sandbox.
 * Keeps GEMINI_API_KEY strictly on the server instead of bundling it into client JS.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const customPrompt = typeof body?.customPrompt === 'string' ? body.customPrompt.trim().slice(0, 2000) : '';
    const aiTone = typeof body?.aiTone === 'string' ? body.aiTone.trim().slice(0, 40) : 'Friendly';

    if (!message || message.length > 2000) {
      return NextResponse.json(
        { error: 'A valid test message (1-2000 characters) is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('your-')) {
      return NextResponse.json({ reply: null, configured: false }, { status: 200 });
    }

    const systemPrompt = `${customPrompt || 'You are a helpful assistant.'}\n\nIMPORTANT: Respond in a ${aiTone} tone. Keep replies concise (2-3 sentences max).`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ reply: null, configured: true }, { status: 200 });
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    return NextResponse.json({ reply, configured: true }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Sandbox execution failed') },
      { status: 500 }
    );
  }
}
