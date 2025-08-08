import { NextRequest } from 'next/server'
import { z } from 'zod'
import { renderResumeToPdf } from '@/pdf/PDFManager'

const ArtifactsSchema = z.object({
  enhanced_resume: z.string(),
  cover_letter: z.string(),
  portfolio: z.string(),
  personal_note: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const templateId = String(body?.templateId || 'classic')
    const artifacts = ArtifactsSchema.parse(body?.artifacts)

    const pdfBuffer = await renderResumeToPdf(artifacts, templateId as 'classic')
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${templateId}.pdf"`,
      },
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Failed to render PDF' }, { status: 500 })
  }
}
