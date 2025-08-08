import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const generationJobs = pgTable('generation_jobs', {
  id: text('id').primaryKey(),
  templateId: text('template_id').notNull(),
  status: text('status').notNull().default('queued'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type GenerationJob = typeof generationJobs.$inferSelect
export type NewGenerationJob = typeof generationJobs.$inferInsert
