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

Format for ALL artifacts is Markdown. Use clear headings (e.g., #, ##), bullet lists for responsibilities/achievements/skills, and short paragraphs. Do NOT use tables, images, or multi-column layouts.

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

    // Conservatively clip long inputs to avoid context overflow on local models
    function estimateTokensByChars(text: string): number {
      return Math.ceil(text.length / 4)
    }
    function clipByChars(text: string, maxChars: number): string {
      if (text.length <= maxChars) return text
      const head = Math.floor(maxChars * 0.7)
      const tail = maxChars - head
      return text.slice(0, head) + '\n...\n' + text.slice(-tail)
    }
    const CTX_LIMIT = Number(process.env.GEN_CONTEXT_TOKENS || 4096)
    const MAX_OUT_TOKENS = Number(process.env.GEN_MAX_OUTPUT_TOKENS || 900)
    const INPUT_TOKEN_BUDGET = Number(process.env.GEN_MAX_INPUT_TOKENS || 2400)
    const totalTokens = estimateTokensByChars(cvText) + estimateTokensByChars(jdText)
    let cvForPrompt = cvText
    let jdForPrompt = jdText
    if (totalTokens > INPUT_TOKEN_BUDGET) {
      const ratio = estimateTokensByChars(cvText) / totalTokens
      const cvMax = Math.max(800, Math.floor(INPUT_TOKEN_BUDGET * ratio * 4 * 0.9))
      const jdMax = Math.max(800, Math.floor(INPUT_TOKEN_BUDGET * (1 - ratio) * 4 * 0.9))
      cvForPrompt = clipByChars(cvText, cvMax)
      jdForPrompt = clipByChars(jdText, jdMax)
    }

    const systemPrompt = buildSystemPrompt(options, cvForPrompt, jdForPrompt)

    function calcMaxTokens(additionalPrompt: string): number {
      const basePromptTokens = estimateTokensByChars(systemPrompt)
      const extraTokens = estimateTokensByChars(additionalPrompt)
      const safety = 128
      const remain = CTX_LIMIT - (basePromptTokens + extraTokens) - safety
      return Math.max(256, Math.min(MAX_OUT_TOKENS, remain))
    }

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

    async function callJsonObject(
      messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
      maxTokens = 4000,
      temp = 0.25,
    ) {
      const payload = {
        model,
        messages,
        temperature: temp,
        top_p: 0.9,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' as const },
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

    async function callText(
      messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
      maxTokens = 4000,
      temp = 0.2,
    ) {
      const payload = { model, messages, temperature: temp, top_p: 0.9, max_tokens: maxTokens }
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) return null
      const data = await res.json()
      return data?.choices?.[0]?.message?.content as string | undefined
    }

    async function trySingleShot(): Promise<null | {
      enhanced_resume: string
      cover_letter: string
      portfolio: string
      personal_note: string
    }> {
      // Prefer json_object for wider compatibility with local servers
      const first = await callJsonObject(
        [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content:
              'Return ONLY a JSON object with the keys: enhanced_resume, cover_letter, portfolio, personal_note. No preamble, no code fences, no ellipses.',
          },
        ],
        calcMaxTokens('JSON object: enhanced_resume, cover_letter, portfolio, personal_note'),
        0.25,
      )
      let candidate = first
      if (!candidate) {
        // Fallback: no response_format, free-form, but ask for strict JSON
        candidate = await callText(
          [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content:
                'Return ONLY strict JSON with keys enhanced_resume, cover_letter, portfolio, personal_note. No backticks, no commentary.',
            },
          ],
          calcMaxTokens('strict JSON with keys for four fields'),
          0.2,
        )
      }
      if (!candidate) return null
      const parsed = tryParseJson(candidate) as Record<string, unknown>
      const obj = {
        enhanced_resume: String(parsed?.enhanced_resume || ''),
        cover_letter: String(parsed?.cover_letter || ''),
        portfolio: String(parsed?.portfolio || ''),
        personal_note: String(parsed?.personal_note || ''),
      }
      const ok =
        obj.enhanced_resume.length > 50 &&
        obj.cover_letter.length > 50 &&
        obj.portfolio.length > 30 &&
        obj.personal_note.length > 10
      return ok ? obj : null
    }

    async function generateField(
      key: 'enhanced_resume' | 'cover_letter' | 'portfolio' | 'personal_note',
      minChars: number,
      extraRules: string,
    ): Promise<string> {
      const schema = {
        type: 'object',
        additionalProperties: false,
        required: [key],
        properties: { [key]: { type: 'string', minLength: Math.max(1, Math.min(minChars, 2000)) } },
      }
      // Reordered attempts to favor simpler formats first and compute dynamic max_tokens
      const attempts: Array<{
        min: number
        prompt: string
        caller: 'object' | 'text' | 'schema'
        temp: number
      }> = [
        {
          min: Math.floor(minChars * 0.6),
          prompt: `Return ONLY a JSON object { "${key}": "..." }. No preamble. No code fences. No ellipses. Minimum ${Math.floor(minChars * 0.6)} characters. ${extraRules}`,
          caller: 'object',
          temp: 0.2,
        },
        {
          min: Math.floor(minChars * 0.45),
          prompt: `Return ONLY strict JSON: { "${key}": "..." }. No backticks. No commentary. Minimum ${Math.floor(minChars * 0.45)} characters. ${extraRules}`,
          caller: 'text',
          temp: 0.15,
        },
        {
          min: Math.floor(minChars * 0.8),
          prompt: `Return ONLY JSON with key ${key}. No preamble. No code fences. No ellipses. Minimum ${Math.floor(minChars * 0.8)} characters. ${extraRules}`,
          caller: 'schema',
          temp: 0.2,
        },
      ]

      for (const step of attempts) {
        let raw: string | null | undefined
        const maxTokens = calcMaxTokens(step.prompt)
        if (step.caller === 'schema') {
          raw = await callJsonSchema(
            [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: step.prompt },
            ],
            schema,
            maxTokens,
            step.temp,
          )
        } else if (step.caller === 'object') {
          raw = await callJsonObject(
            [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: step.prompt },
            ],
            maxTokens,
            step.temp,
          )
        } else {
          raw = await callText(
            [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: step.prompt },
            ],
            maxTokens,
            step.temp,
          )
        }
        if (!raw) continue
        const parsed = tryParseJson(raw) as Record<string, unknown>
        const value = String(parsed?.[key] || '')
        if (value && value.length >= step.min && !hasEllipsis(value)) return value
      }
      return ''
    }

    // Try a single-shot generation first to reduce token pressure and API calls
    // Run single-shot only when there is ample context budget
    let single: null | {
      enhanced_resume: string
      cover_letter: string
      portfolio: string
      personal_note: string
    } = null
    const singleShotBudget = calcMaxTokens('single-shot all fields')
    if (singleShotBudget >= 700) {
      single = await trySingleShot()
    }
    const enhanced_resume = single
      ? single.enhanced_resume
      : await generateField(
          'enhanced_resume',
          1400,
          'Use Markdown. Start with # Resume then ## Summary, ## Experience, ## Skills, ## Education, ## Projects (as applicable). Use bullet lists; no tables or images.',
        )
    const cover_letter = single
      ? single.cover_letter
      : await generateField(
          'cover_letter',
          500,
          'Use Markdown. Include a title (e.g., # Cover Letter), then concise paragraphs: intro fit, achievements aligned to JD, courteous closing. Use bullets if helpful.',
        )
    const portfolio = single
      ? single.portfolio
      : await generateField(
          'portfolio',
          400,
          'Use Markdown. Include requested sections (e.g., ## Featured, ## Projects, ## Skills, ## Links) with concise bullet points. Use existing links only.',
        )
    const personal_note = single
      ? single.personal_note
      : await generateField('personal_note', 80, 'Use Markdown. Two sentences, specific, no fluff.')

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
