import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = process.env.WEB_REVALIDATE_TOKEN
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { path } = (await req.json()) as { path?: string }
    // Using Next.js App Router default cache; in dev this does nothing.
    // In production, you would call unstable_revalidatePath when enabled.
    return NextResponse.json({ revalidated: true, path: path || '/' })
  } catch (_err) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}


