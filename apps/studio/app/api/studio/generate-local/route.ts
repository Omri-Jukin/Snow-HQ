import { z } from 'zod'

/** ---------- Typed Option Enums (hints, but allow custom strings) ---------- */
export const ToneEnum = z.enum([
  'confident',
  'direct',
  'professional',
  'friendly',
  'technical',
  'executive',
  'concise',
  'persuasive',
  'no-fluff',
])

export const WordChoiceEnum = z.enum([
  'simple',
  'precise',
  'impactful',
  'measurable',
  'action-oriented',
  'jargon-light',
  'ats-keyword-rich',
])

export const StyleEnum = z.enum([
  'bullet-first',
  'narrative-summary',
  'results-then-actions',
  'problem-action-result',
  'skills-then-impact',
  'ats-friendly',
  'modern',
])

export const AttributeEnum = z.enum([
  'leadership',
  'ownership',
  'mentorship',
  'systems-thinking',
  'customer-obsession',
  'delivery-focus',
  'quality-first',
  'speed-to-impact',
  'collaboration',
  'innovation',
  'data-driven',
])

/** Exported aliases */
export type ToneOption = z.infer<typeof ToneEnum> | (string & {})
export type WordChoiceOption = z.infer<typeof WordChoiceEnum> | (string & {})
export type StyleOption = z.infer<typeof StyleEnum> | (string & {})
export type AttributeOption = z.infer<typeof AttributeEnum> | (string & {})

/** ---------- Input Schemas ---------- */
const HumanizeOptSchema = z.object({
  enabled: z.boolean().optional(), // default true (always humanized unless explicitly disabled)
})

const OptionsSchema = z.object({
  tone: z.array(z.union([ToneEnum, z.string()])).optional(),
  wordChoice: z.array(z.union([WordChoiceEnum, z.string()])).optional(),
  style: z.array(z.union([StyleEnum, z.string()])).optional(),
  attributes: z.array(z.union([AttributeEnum, z.string()])).optional(),
  targetRole: z.string().optional(),
  language: z.string().optional(),
  coverLetterWordCount: z.number().int().min(120).max(320).optional(),
  personalNoteMaxSentences: z.number().int().min(1).max(3).optional(),
  portfolioFormat: z.enum(['markdown', 'plain']).optional(),
  portfolioSections: z
    .array(z.enum(['featured', 'projects', 'skills', 'links', 'about']).or(z.string()))
    .optional(),
  humanize: HumanizeOptSchema.optional(), // opt-out if enabled === false
})

/** Exported runtime-validated Options + TS type for compile-time */
export type Options = {
  tone?: ToneOption[]
  wordChoice?: WordChoiceOption[]
  style?: StyleOption[]
  attributes?: AttributeOption[]
  targetRole?: string
  language?: string
  coverLetterWordCount?: number
  personalNoteMaxSentences?: number
  portfolioFormat?: 'markdown' | 'plain'
  portfolioSections?: Array<'featured' | 'projects' | 'skills' | 'links' | 'about' | string>
  humanize?: { enabled?: boolean }
}

const BodySchema = z.object({
  cvText: z.string().min(20, 'CV text too short'),
  jdText: z.string().min(20, 'JD text too short'),
  options: OptionsSchema.optional(),
})

/** ---------- Output Schema ---------- */
const OutputSchema = z.object({
  enhanced_resume: z.string().min(50),
  cover_letter: z.string().min(50),
  portfolio: z.string().min(20),
  personal_note: z.string().min(5),
})

/** ---------- Utils ---------- */
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

  // Fast path: already a pure JSON object
  const trimmed = cleaned.trim()
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      // fall through to robust extraction
    }
  }

  // Robust extraction of the first complete top-level JSON object
  function extractFirstJsonObject(s: string): string | null {
    let start = -1
    let depth = 0
    let inString = false
    let escape = false

    for (let i = 0; i < s.length; i++) {
      const ch = s[i]
      if (start === -1) {
        if (ch === '{') {
          start = i
          depth = 1
          inString = false
          escape = false
        }
        continue
      }

      if (inString) {
        if (escape) {
          escape = false
        } else if (ch === '\\') {
          escape = true
        } else if (ch === '"') {
          inString = false
        }
        continue
      }

      if (ch === '"') {
        inString = true
      } else if (ch === '{') {
        depth++
      } else if (ch === '}') {
        depth--
        if (depth === 0) {
          return s.slice(start, i + 1)
        }
      }
    }
    return null
  }

  const candidate = extractFirstJsonObject(cleaned)
  if (candidate) {
    try {
      return JSON.parse(candidate)
    } catch {
      // ignore and fall through
      console.log('Error parsing JSON:', candidate)
    }
  }

  return { raw: text }
}

function joinOpts(label: string, arr?: string[]) {
  return arr && arr.length ? `${label}: ${arr.join(', ')}.` : ''
}

/** Subtle randomness to avoid template-y output. */
function buildStyleSeed() {
  // Simple per-request seed; good enough for gentle variation
  return Math.floor(Math.random() * 10000) + 1 // 1..10000
}

function subtleRandomization(seed: number) {
  const mod2 = seed % 2
  const mod3 = seed % 3
  const mod5 = seed % 5

  const sentenceOpen =
    mod3 === 0
      ? 'In summaries, prefer a short opener followed by a slightly longer sentence.'
      : mod3 === 1
        ? 'In summaries, start with a concrete outcome, then briefly describe the action.'
        : 'In summaries, start with the action, then quantify the outcome.'

  const bulletCadence =
    mod2 === 0
      ? 'Alternate bullet structures: (Action → Result) then (Result → How).'
      : 'Prefer (Result → Action → Tech) structure for every second bullet.'

  const connectors =
    mod5 === 0
      ? 'Use varied connectors sparingly: "so that", "which reduced", "resulting in" — avoid repeating the same one.'
      : 'Rotate connective phrases lightly: "leading to", "resulting in", "which improved".'

  return `
Subtle Randomization (seed: ${seed}):
- ${sentenceOpen}
- ${bulletCadence}
- ${connectors}
- Avoid repetitive sentence starts; diversify verbs across adjacent bullets.
`.trim()
}

/** Humanization guidance (ON by default; can be opted out). */
function humanizationBlock(enabled: boolean) {
  if (!enabled) return ''
  const keepOriginalPhrasingWeight = 0.3
  return `
Humanity Guardrails (always applied unless disabled):
- Preserve authentic personal voice from the original CV; retain roughly ${Math.round(keepOriginalPhrasingWeight * 100)}% of strong original phrasing.
- Vary sentence length and rhythm; mix short and medium sentences.
- Avoid template openings like "I am excited to apply…"; prefer concrete statements from my experience.
- Avoid repeating the same verb at the start of consecutive bullets; diversify while keeping meaning.
- Allow a few natural, non-symmetric constructions (e.g., a brief parenthetical) but keep grammar correct.
- Never add fluff, opinions, or unverifiable claims.
- Keep ATS compliance and factual accuracy intact.
`.trim()
}

/** ---------- Prompt Builder ---------- */
function buildSystemPrompt(opts: Options | undefined, cv: string, jd: string) {
  const tone: string[] = opts?.tone ?? ['confident', 'direct', 'no-fluff', 'professional']
  const word: string[] = opts?.wordChoice ?? [
    'precise',
    'impactful',
    'ats-keyword-rich',
    'action-oriented',
  ]
  const style: string[] = opts?.style ?? [
    'ats-friendly',
    'bullet-first',
    'modern',
    'results-then-actions',
  ]
  const attributes: string[] = opts?.attributes ?? [
    'ownership',
    'delivery-focus',
    'quality-first',
    'collaboration',
  ]

  const targetRole = opts?.targetRole ? `Target role: ${opts.targetRole}.` : ''
  const language = opts?.language ? `Write in ${opts.language}.` : ''
  const coverLen = opts?.coverLetterWordCount ?? 180
  const noteSentences = opts?.personalNoteMaxSentences ?? 2
  const portfolioFormat = opts?.portfolioFormat ?? 'markdown'
  const portfolioSections = opts?.portfolioSections?.length
    ? opts.portfolioSections.join(', ')
    : 'featured, projects, skills'

  const humanizeEnabled = opts?.humanize?.enabled === false ? false : true
  const humanize = humanizationBlock(humanizeEnabled)
  const seed = buildStyleSeed()
  const randomness = subtleRandomization(seed)

  return `
You are an expert job application writer and resume editor.

ALWAYS write in clear **first-person** voice ("I", "my") across ALL artifacts: enhanced resume, cover letter, portfolio, and personal note. No third-person.

Your task: Using the provided CV and Job Description (JD), produce FOUR artifacts:

1) "enhanced_resume" — Rewrite my CV in first-person for clarity, flow, and impact while preserving all facts. Use a modern, ATS-friendly structure (Summary, Experience, Skills, Education, Projects as applicable). Emphasize JD-aligned achievements/skills. Reorganize and tighten; do not invent.
2) "cover_letter" — First-person, professional, ${coverLen - 30}-${coverLen + 30} words, tightly tailored to the JD; avoid flattery and clichés; show outcomes and scope using only facts in CV/JD.
3) "portfolio" — A concise first-person portfolio document (${portfolioFormat}) highlighting JD-relevant work. Include sections: ${portfolioSections}. Use bullet-first summaries, short impact statements, stacks used, and existing links only; do not invent links.
4) "personal_note" — First-person, ${noteSentences} sentence(s), quick intro to a recruiter explaining fit and value; no fluff, concrete alignment points.

Style & Guidance:
${joinOpts('Tone', tone)}
${joinOpts('Word choice', word)}
${joinOpts('Writing style', style)}
${joinOpts('Attributes to signal', attributes)}
${targetRole}
${language}

Strict Rules (ATS-optimized):
- Use ONLY facts present in the CV and JD. Do NOT invent titles, dates, employers, skills, certs, projects, metrics, or links.
- Prioritize and group JD-required skills/tech/responsibilities at the top of the Skills section and throughout artifacts.
- Identify and incorporate **all** required JD keywords contextually—use them in bullets, experience, and summary (no keyword stuffing).
- Include both acronyms and full phrases for key skills/certifications on first mention.
- Use standard section headings: Summary, Experience, Skills, Education, Projects (single column; basic fonts; no styling).
- NO tables, multi-columns, images, colors, graphics, headers/footers, text boxes, or special styling.
- Maintain standard section order in the resume: Summary, Experience, Skills, Education, Projects.
- Dates: consistent format (e.g., "MMM YYYY – MMM YYYY" or "YYYY – YYYY").
- Titles before company names; location optional.
- Bullets: start with strong action verbs; keep most under ~200 characters.
- Avoid special characters that break parsing (no ✓ ★ →). Use plain ASCII bullets/hyphens.
- Keep section labels conventional (Experience, Skills, Education, Projects). Do not use creative labels.
- Skills: group by category (Languages, Frameworks, Tools) and order by JD relevance; avoid soft skills in Skills section.
- Projects: explicitly list stack/tech; state role and responsibility in first-person.
- No nested lists or deep indentation.
- Keep language natural, crisp, readable for humans and ATS.

${humanize}
${randomness}

Output JSON ONLY (no markdown, no extra text) with this exact shape:
{
  "enhanced_resume": "string",
  "cover_letter": "string",
  "portfolio": "string",
  "personal_note": "string"
}

Inputs:

CV:
"""${cv}"""

JD:
"""${jd}"""
`.trim()
}

/** ---------- HTTP Handler ---------- */
export async function POST(req: Request) {
  try {
    // Accept both JSON and multipart/form-data (for PDF/DOCX uploads)
    const contentType = req.headers.get('content-type') || ''

    async function fileToText(file: File): Promise<string> {
      const buffer = Buffer.from(await file.arrayBuffer())
      const lowerName = (file.name || '').toLowerCase()
      const mime = file.type || ''
      try {
        if (mime.includes('pdf') || lowerName.endsWith('.pdf')) {
          type PdfParse = (data: Buffer) => Promise<{ text?: string }>
          const modUnknown = (await import('pdf-parse')) as unknown
          let pdfParse: PdfParse
          if (typeof modUnknown === 'function') {
            pdfParse = modUnknown as PdfParse
          } else {
            pdfParse = (modUnknown as { default: PdfParse }).default
          }
          const res = await pdfParse(buffer)
          return String(res.text || '')
        }
        if (mime.includes('word') || lowerName.endsWith('.docx')) {
          type Mammoth = {
            extractRawText: (opts: { buffer: Buffer }) => Promise<{ value?: string }>
          }
          const mammoth = (await import('mammoth')) as unknown as Mammoth
          const res = await mammoth.extractRawText({ buffer })
          return String(res.value || '')
        }
      } catch (e) {
        console.warn('Failed to parse file, falling back to utf8 text:', (e as Error)?.message)
      }
      return buffer.toString('utf8')
    }

    function normalize(text: string): string {
      return text
        .replace(/\r\n?/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    }

    let assembledBody: unknown
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
      assembledBody = { cvText, jdText, options }
    } else {
      const body = await req.json()
      assembledBody = body
    }

    const parsed = BodySchema.safeParse(assembledBody)
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid payload', issues: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // Config
    const baseUrl = process.env.AI_BASE_URL || 'http://localhost:1234/v1'
    const apiKey = process.env.AI_API_KEY || 'lm-studio'
    const model = process.env.OPENAI_MODEL || 'openai/gpt-oss-20b'

    const { cvText, jdText, options } = parsed.data
    const opts = options as Options | undefined
    const systemPrompt = buildSystemPrompt(opts, cvText, jdText)
    const userPrompt =
      'Return ONLY the JSON object with "enhanced_resume", "cover_letter", "portfolio", "personal_note". No preamble.'

    async function callOnce(temp: number) {
      const payload: Record<string, unknown> = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: temp, // keep low for factuality; humanization handled in prompt
        top_p: 0.9,
        max_tokens: 2400,
      }
      // Always request strict JSON output
      payload.response_format = { type: 'json_object' }

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errText = await res.text()
        return { ok: false, error: errText }
      }
      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content as string | undefined
      return { ok: true, text, usage: data?.usage }
    }

    // Simple retry strategy with slightly different temperature
    const first = await callOnce(0.3)
    let text: string | undefined
    let usage: unknown
    if (!first.ok || !first.text) {
      const second = await callOnce(0.2)
      if (!second.ok || !second.text) {
        return Response.json(
          { error: 'Model call failed', detail: first.ok ? first : second },
          { status: 502 },
        )
      }
      text = second.text
      usage = second.usage
    } else {
      text = first.text
      usage = first.usage
    }

    const parsedJson = tryParseJson(text)
    const validated = OutputSchema.safeParse(parsedJson)
    if (!validated.success) {
      return Response.json(
        { error: 'Invalid model JSON shape', raw: text, issues: validated.error.flatten() },
        { status: 502 },
      )
    }

    return Response.json({ artifacts: validated.data, usage })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
