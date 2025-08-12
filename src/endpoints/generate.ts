import type { Endpoint, PayloadHandler, Payload } from 'payload'

type ResLike = { status: (code: number) => { json: (data: unknown) => unknown } }

const recentByIp = new Map<string, number>()
const WINDOW_MS = 5_000

const generateEndpoint: Endpoint = {
  path: '/generate',
  method: 'post',
  handler: (async (...args: unknown[]) => {
    const req = args[0] as { body?: { templateId?: string }; ip?: string } | undefined
    const res = args[1] as ResLike
    const context = args[2] as { req?: { payload?: Payload } } | undefined

    const templateId = req?.body?.templateId
    if (!templateId) return res.status(400).json({ error: 'templateId is required' })

    const ip = (req as { ip?: string } | undefined)?.ip || 'unknown'
    const now = Date.now()
    const last = recentByIp.get(ip) || 0
    if (now - last < WINDOW_MS) return res.status(429).json({ error: 'Too Many Requests' })
    recentByIp.set(ip, now)

    try {
      const payloadApi = context?.req?.payload
      if (!payloadApi) return res.status(500).json({ error: 'Payload unavailable' })
      const numericTemplateId = typeof templateId === 'string' ? Number(templateId) : templateId
      const created = await payloadApi.create({
        collection: 'jobs',
        data: { template: numericTemplateId as number, status: 'queued' },
      })
      return res.status(200).json({
        message: 'Generation enqueued',
        jobId: (created as unknown as { id: string }).id,
        status: 'queued',
      })
    } catch (_err) {
      return res.status(500).json({ error: 'Failed to persist job' })
    }
  }) as unknown as PayloadHandler,
}

export default generateEndpoint
