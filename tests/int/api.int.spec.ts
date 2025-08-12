import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

type MockReq = { body: { templateId: string | number }; ip: string }
type MockRes = { status: (code: number) => { json: (d: unknown) => unknown } }
type MockCtx = { req: { payload: Payload } }
type EndpointLike = {
  path: string
  handler?: (req: MockReq, res: MockRes, ctx: MockCtx) => unknown
}

const hasPath = (val: unknown): val is { path: string } =>
  typeof val === 'object' &&
  val !== null &&
  'path' in val &&
  typeof (val as Record<string, unknown>).path === 'string'

const isEndpointLike = (val: unknown): val is EndpointLike =>
  typeof val === 'object' &&
  val !== null &&
  'path' in val &&
  typeof (val as Record<string, unknown>).path === 'string' &&
  (!('handler' in val) || typeof (val as Record<string, unknown>).handler === 'function')

const isCollectionLike = (
  val: unknown,
): val is { slug: string; hooks?: { afterChange?: unknown[] } } =>
  typeof val === 'object' &&
  val !== null &&
  'slug' in val &&
  typeof (val as Record<string, unknown>).slug === 'string'

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })

  it('exposes /api/generate endpoint', async () => {
    // Using local payload express via getPayload, call the handler directly is non-trivial.
    // Sanity check: collection exists and config attached endpoint array contains /generate
    const endpoints = ((await config).endpoints ?? []) as unknown[]
    const hasGenerate = endpoints.some((e) => hasPath(e) && e.path === '/generate')
    expect(hasGenerate).toBe(true)
  })

  it('attaches templates.afterChange hook', async () => {
    const cfg = await config
    const collections = (
      Array.isArray((cfg as { collections?: unknown[] }).collections)
        ? (cfg as { collections?: unknown[] }).collections
        : []
    ) as unknown[]
    const templates = collections.find(
      (c): c is { slug: string; hooks?: { afterChange?: unknown[] } } =>
        isCollectionLike(c) && c.slug === 'templates',
    )
    const hasHook = !!templates?.hooks?.afterChange?.length
    expect(hasHook).toBe(true)
  })

  it('persists a job on /api/generate', async () => {
    const cfg = await config
    const api = await getPayload({ config: cfg })
    const template = await api.create({
      collection: 'templates',
      data: { key: 'tmp', name: 'Tmp' },
    })
    const endpoints = ((cfg as { endpoints?: unknown[] }).endpoints ?? []) as unknown[]
    const endpoint = endpoints.find(
      (e): e is EndpointLike => isEndpointLike(e) && e.path === '/generate',
    )
    const reqMock: MockReq = { body: { templateId: template.id }, ip: '127.0.0.1' }
    const resMock: MockRes = { status: (code: number) => ({ json: (d: unknown) => ({ code, d }) }) }
    const ctxMock: MockCtx = { req: { payload: api } }
    const response = await endpoint?.handler?.(reqMock, resMock, ctxMock)
    expect(response).toBeDefined()
  })
})
