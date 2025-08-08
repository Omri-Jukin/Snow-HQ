import { z } from 'zod'

const BodySchema = z.object({
  cvText: z.string().min(20, 'CV text too short'),
  jdText: z.string().min(20, 'JD text too short'),
  options: z
    .object({
      tone: z.string().optional(),
      targetRole: z.string().optional(),
    })
    .optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid payload', issues: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const provider = process.env.AI_PROVIDER || 'openai'
    const apiKey = process.env.AI_API_KEY
    if (!apiKey) return Response.json({ error: 'AI_API_KEY not configured' }, { status: 500 })

    // Minimal single-call prompt returning a compact structure for MVP
    const systemPrompt = `You produce application artifacts from a CV and JD. Only use facts present.`
    const userPrompt = JSON.stringify({
      cvText: parsed.data.cvText,
      jdText: parsed.data.jdText,
      instruction:
        'Return JSON with resume.summary, cover_letter (3 short paragraphs), and personal_note (<=100 words).',
    })

    // Vercel AI SDK could be used here; to minimize deps for MVP, we call OpenAI-compatible APIs when provider=openai
    let responseJson: any
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        return Response.json({ error: 'Model call failed', detail: err }, { status: 502 })
      }
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content
      try {
        responseJson = JSON.parse(text)
      } catch {
        responseJson = { raw: text }
      }
    } else {
      // Future: implement Groq/OpenRouter/Together fallbacks
      return Response.json({ error: `Provider ${provider} not implemented yet` }, { status: 400 })
    }

    return Response.json({ artifacts: responseJson })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
