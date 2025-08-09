import { z } from 'zod'

// Reuse the same schemas and logic as the studio endpoint to run from the root app

export type OptionType = z.infer<typeof OptionsSchema>

const OptionsSchema = z.object({
  tone: z.union([z.array(z.string()), z.string()]).optional(),
  wordChoice: z.array(z.string()).optional(),
  style: z.array(z.string()).optional(),
  attributes: z.array(z.string()).optional(),
  targetRole: z.string().optional(),
  language: z.union([z.array(z.string()), z.string()]).optional(),
  coverLetterWordCount: z.number().int().min(120).max(320).optional(),
  personalNoteMaxSentences: z.number().int().min(1).max(3).optional(),
  portfolioFormat: z.enum(['markdown', 'plain']).optional(),
  portfolioSections: z.array(z.string()).optional(),
  humanize: z.object({ enabled: z.boolean().optional() }).optional(),
})

const BodySchema = z.object({
  cvText: z.string().min(20, 'CV text too short'),
  jdText: z.string().min(20, 'JD text too short'),
  options: OptionsSchema.optional(),
})

const OutputSchema = z.object({
  enhanced_resume: z.string().min(1),
  cover_letter: z.string().min(1),
  portfolio: z.string().min(1),
  personal_note: z.string().min(1),
})

function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith('```')) {
    const firstFence = trimmed.indexOf('\n')
    if (firstFence !== -1) {
      const withoutFence = trimmed.slice(firstFence + 1)
      const lastFence = withoutFence.lastIndexOf('```')
      return lastFence !== -1 ? withoutFence.slice(0, lastFence).trim() : withoutFence.trim()
    }
  }
  return trimmed
}

function tryParseJson(text: string | null | undefined): unknown {
  if (!text) return null
  const cleaned = stripCodeFences(text)
  const trimmed = cleaned.trim()
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed)
    } catch {}
  }
  function extractFirstJsonObject(s: string): string | null {
    let start = -1,
      depth = 0,
      inString = false,
      escape = false
    for (let i = 0; i < s.length; i++) {
      const ch = s[i]
      if (start === -1) {
        if (ch === '{') {
          start = i
          depth = 1
        }
        continue
      }
      if (inString) {
        if (escape) escape = false
        else if (ch === '\\') escape = true
        else if (ch === '"') inString = false
        continue
      }
      if (ch === '"') inString = true
      else if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) return s.slice(start, i + 1)
      }
    }
    return null
  }
  const candidate = extractFirstJsonObject(cleaned)
  if (candidate) {
    try {
      return JSON.parse(candidate)
    } catch {}
  }
  return { raw: text }
}

function normalizeList(input: unknown): string[] {
  if (!input) return []
  if (Array.isArray(input))
    return input
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean)
  if (typeof input === 'string')
    return input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  return []
}

function buildSystemPrompt(opts: OptionType | undefined, cv: string, jd: string) {
  const coverLen = opts?.coverLetterWordCount ?? 180
  const portfolioFormat = opts?.portfolioFormat ?? 'markdown'
  const portfolioSections = opts?.portfolioSections?.length
    ? opts.portfolioSections.join(', ')
    : 'featured, projects, skills'
  const noteSentences = opts?.personalNoteMaxSentences ?? 2
  const toneList = normalizeList((opts as unknown as { tone?: unknown })?.tone)
  const languageList = normalizeList((opts as unknown as { language?: unknown })?.language)
  const styleList = normalizeList((opts as unknown as { style?: unknown })?.style)
  const targetRole = (opts as unknown as { targetRole?: string })?.targetRole
  return `
You are an expert job application writer and resume editor.

ALWAYS write in clear first-person voice across ALL artifacts.

Produce four fields: enhanced_resume, cover_letter (${coverLen - 30}-${coverLen + 30} words), portfolio (${portfolioFormat}, sections: ${portfolioSections}), personal_note (${noteSentences} sentence(s)).

${targetRole ? `Target role: ${targetRole}.` : ''}
${toneList.length ? `Tone: ${toneList.join(', ')}.` : ''}
${languageList.length ? `Write in ${languageList.join(', ')}.` : ''}
${styleList.length ? `Communication style/register: ${styleList.join(', ')}.` : ''}

Output JSON ONLY with keys: enhanced_resume, cover_letter, portfolio, personal_note.

Inputs:
CV:
"""${cv}"""

JD:
"""${jd}"""
`.trim()
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''

    async function fileToText(file: File): Promise<string> {
      const buffer = Buffer.from(await file.arrayBuffer())
      const lower = (file.name || '').toLowerCase()
      const mime = file.type || ''
      try {
        if (mime.includes('pdf') || lower.endsWith('.pdf')) {
          type PdfParse = (data: Buffer) => Promise<{ text?: string }>
          const modUnknown = (await import('pdf-parse')) as unknown
          const pdfParse: PdfParse =
            typeof modUnknown === 'function'
              ? (modUnknown as PdfParse)
              : (modUnknown as { default: PdfParse }).default
          const res = await pdfParse(buffer)
          return String(res.text || '')
        }
        if (mime.includes('word') || lower.endsWith('.docx')) {
          type Mammoth = {
            extractRawText: (opts: { buffer: Buffer }) => Promise<{ value?: string }>
          }
          const mammoth = (await import('mammoth')) as unknown as Mammoth
          const res = await mammoth.extractRawText({ buffer })
          return String(res.value || '')
        }
      } catch {}
      return buffer.toString('utf8')
    }

    function normalize(text: string): string {
      return text
        .replace(/\r\n?/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    }

    let assembled: unknown
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const cvFile = form.get('cvFile') as File | null
      const jdFile = form.get('jdFile') as File | null
      const cvTextRaw = String(form.get('cvText') || '')
      const jdTextRaw = String(form.get('jdText') || '')
      const optionsText = String(form.get('options') || '')
      const options = optionsText ? JSON.parse(optionsText) : undefined
      const cvText = normalize(cvFile ? await fileToText(cvFile) : cvTextRaw)
      const jdText = normalize(jdFile ? await fileToText(jdFile) : jdTextRaw)
      assembled = { cvText, jdText, options }
    } else {
      assembled = await req.json()
    }

    const parsed = BodySchema.safeParse(assembled)
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid payload', issues: parsed.error.flatten((issue) => issue.message) },
        { status: 400 },
      )
    }

    const baseUrl = process.env.AI_BASE_URL || 'http://localhost:1234/v1'
    const apiKey = process.env.AI_API_KEY || 'lm-studio'
    const model = process.env.OPENAI_MODEL || 'openai/gpt-oss-20b'

    const { cvText, jdText, options } = parsed.data
    const systemPrompt = buildSystemPrompt(options, cvText, jdText)

    const hasEllipsis = (s: string) => /\.\.\.|…/.test(s)

    async function callJsonSchema(
      messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
      schema: unknown,
      maxTokens = 4000,
      temp = 0.25,
    ) {
      const payload = {
        model,
        messages,
        temperature: temp,
        top_p: 0.9,
        max_tokens: maxTokens,
        response_format: { type: 'json_schema' as const, json_schema: { name: 'Output', schema } },
      }
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) return null
      const data = await res.json()
      return data?.choices?.[0]?.message?.content as string | undefined
    }

    async function generateField(
      key: 'enhanced_resume' | 'cover_letter' | 'portfolio' | 'personal_note',
      minChars: number,
      extraRules: string,
    ): Promise<string> {
      const baseUser = `Return ONLY JSON with key ${key}. No preamble. Hard rules: no ellipses or placeholders, never truncate, minimum ${minChars} characters. ${extraRules}`
      const schema = {
        type: 'object',
        additionalProperties: false,
        required: [key],
        properties: { [key]: { type: 'string', minLength: Math.max(1, Math.min(minChars, 2000)) } },
      }
      const first = await callJsonSchema(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: baseUser },
        ],
        schema,
        3400,
        0.25,
      )
      let value = ''
      if (first) {
        const parsed = tryParseJson(first) as Record<string, unknown>
        value = String(parsed?.[key] || '')
      }
      if (!value || value.length < minChars || hasEllipsis(value)) {
        const second = await callJsonSchema(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: baseUser },
            { role: 'assistant', content: first || '' },
            {
              role: 'user',
              content: `Expand and complete ${key}. Remove any ellipses. Keep first-person, ATS friendly. Return only JSON with key ${key}.`,
            },
          ],
          schema,
          3600,
          0.2,
        )
        if (second) {
          const parsed2 = tryParseJson(second) as Record<string, unknown>
          value = String(parsed2?.[key] || value)
        }
      }
      return value
    }

    const enhanced_resume = await generateField(
      'enhanced_resume',
      2000,
      'Structure with Summary, Experience, Skills, Education, Projects. Plain text, no tables.',
    )
    const cover_letter = await generateField(
      'cover_letter',
      800,
      'Three short paragraphs: intro fit, achievements aligned to JD, close courteously.',
    )
    const portfolio = await generateField(
      'portfolio',
      700,
      'Markdown allowed. Include requested sections with concise bullet points.',
    )
    const personal_note = await generateField(
      'personal_note',
      220,
      'Two sentences, specific, no fluff.',
    )

    const improvedJson = { enhanced_resume, cover_letter, portfolio, personal_note }
    const validated = OutputSchema.safeParse(improvedJson)
    if (!validated.success) {
      return Response.json(
        {
          error: 'Invalid model JSON shape',
          raw: improvedJson,
          issues: validated.error.flatten((i) => i.message),
        },
        { status: 502 },
      )
    }

    return Response.json({ artifacts: validated.data })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
