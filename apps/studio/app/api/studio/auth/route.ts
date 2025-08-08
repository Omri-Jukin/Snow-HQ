import { cookies } from 'next/headers'

const TOKEN_COOKIE = 'studio_token'

export async function POST(req: Request) {
  const requiredToken = process.env.STUDIO_ACCESS_TOKEN
  if (!requiredToken) {
    return Response.json({ message: 'Auth not required' }, { status: 200 })
  }
  const body = (await req.json()) as { token?: string }
  if (!body?.token || body.token !== requiredToken) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_COOKIE, body.token, { httpOnly: true, sameSite: 'lax', path: '/' })
  return Response.json({ ok: true })
}
