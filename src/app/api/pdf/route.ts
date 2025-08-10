import { NextRequest } from 'next/server'
import { z } from 'zod'
import { renderResumeToPdf, renderSingleArtifactToPdf } from '@/managers/PDFManager'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ArtifactsSchema = z.object({
  enhanced_resume: z.string(),
  cover_letter: z.string(),
  portfolio: z.string(),
  personal_note: z.string(),
})

function extractNameFromResume(resumeText: string): string | null {
  // Very simple heuristic: first non-empty line with at least 2 words
  const lines = String(resumeText || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (!lines.length) return null
  const first = lines[0]
  if (first.split(/\s+/).length >= 2 && first.length <= 80) return first
  // Fallback: find a line that looks like a name
  const candidate = lines.find((l) => /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(l))
  return candidate || null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const templateId = String(body?.templateId || 'classic')
    const artifacts = ArtifactsSchema.parse(body?.artifacts)
    const only = (body?.only || undefined) as
      | 'enhanced_resume'
      | 'cover_letter'
      | 'portfolio'
      | 'personal_note'
      | undefined

    const renderer = (body?.renderer || 'react-pdf') as 'react-pdf' | 'md-to-pdf'

    let pdfBuffer: Buffer
    const extraHeaders: Record<string, string> = {}
    if (renderer === 'md-to-pdf' && only) {
      try {
        const mod = (await import('md-to-pdf')) as unknown as Record<string, unknown>
        type MdToPdfFn = (
          input: { path?: string; content?: string },
          config?: Record<string, unknown>,
        ) => Promise<{ filename: string; content: Buffer } | undefined>
        const mdToPdf: MdToPdfFn =
          ((mod as Record<string, unknown>).mdToPdf as MdToPdfFn) ||
          ((((mod as Record<string, unknown>).default || {}) as Record<string, unknown>)[
            'mdToPdf'
          ] as MdToPdfFn) ||
          ((mod as Record<string, unknown>).default as unknown as MdToPdfFn)
        if (typeof mdToPdf !== 'function') throw new Error('md-to-pdf not available')
        const markdown = String(artifacts[only] || '').trim()
        const result = await mdToPdf({ content: markdown }, {
          pdf_options: { format: 'A4', printBackground: true, margin: '15mm' },
          document_title: `${only}`,
          launch_options: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new',
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
          },
        } as unknown as Record<string, unknown>)
        if (!result || !result.content) throw new Error('md-to-pdf failed')
        pdfBuffer = Buffer.from(result.content)
      } catch (e) {
        // Fallback to React-PDF for reliability, but surface error context
        const message = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
        console.error('md-to-pdf failed, falling back to react-pdf:', message)
        extraHeaders['X-MD-Error'] = message.slice(0, 200)
        pdfBuffer = await renderSingleArtifactToPdf(
          artifacts,
          templateId as 'classic' | 'ocean' | 'sunset' | 'slate',
          only,
        )
      }
    } else if (only) {
      pdfBuffer = await renderSingleArtifactToPdf(
        artifacts,
        templateId as 'classic' | 'ocean' | 'sunset' | 'slate',
        only,
      )
    } else {
      pdfBuffer = await renderResumeToPdf(
        artifacts,
        templateId as 'classic' | 'ocean' | 'sunset' | 'slate',
      )
    }
    const baseName = extractNameFromResume(artifacts.enhanced_resume) || 'resume'
    const suffix = only
      ? {
          enhanced_resume: 'resume',
          cover_letter: 'cover-letter',
          portfolio: 'portfolio',
          personal_note: 'personal-note',
        }[only]
      : `bundle`
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${baseName
          .replace(/[^a-z0-9\-\_\s]/gi, '')
          .trim()}-${suffix}-${templateId}.pdf"`,
        ...extraHeaders,
      },
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Failed to render PDF' }, { status: 500 })
  }
}
