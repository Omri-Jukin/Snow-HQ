import { NextRequest } from 'next/server'
import { z } from 'zod'
import { renderResumeToPdf } from '@/pdf/PDFManager'

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

    const pdfBuffer = await renderResumeToPdf(
      artifacts,
      templateId as 'classic' | 'ocean' | 'sunset' | 'slate',
    )
    const suggestedName = extractNameFromResume(artifacts.enhanced_resume) || 'resume'
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${suggestedName.replace(/[^a-z0-9\-\_\s]/gi, '')}-${templateId}.pdf"`,
      },
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Failed to render PDF' }, { status: 500 })
  }
}
