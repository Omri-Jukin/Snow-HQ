import type { Endpoint, PayloadHandler } from 'payload'
import crypto from 'node:crypto'
import { db } from '../lib/db'
import { generationJobs } from '../lib/schema'

type ResLike = {
  status: (code: number) => { json: (data: unknown) => unknown }
}

// This will be mounted under /api because Payload prefixes `endpoints`
// so path '/generate' => '/api/generate'
const generateEndpoint: Endpoint = {
  path: '/generate',
  method: 'post',
  handler: (async (...args: unknown[]) => {
    const req = args[0] as { body?: { templateId?: string } } | undefined
    const res = args[1] as ResLike
    try {
      const templateId = req?.body?.templateId
      if (!templateId) {
        return res.status(400).json({ error: 'templateId is required' })
      }

      const id = crypto.randomUUID()
      await db.insert(generationJobs).values({ id, templateId, status: 'queued' })
      return res.status(200).json({ message: 'Generation enqueued', jobId: id, templateId })
    } catch (error: unknown) {
      console.error('Error in generate endpoint:', error)
      return res.status(500).json({ error: 'Failed to enqueue generation' })
    }
  }) as unknown as PayloadHandler,
}

export default generateEndpoint
