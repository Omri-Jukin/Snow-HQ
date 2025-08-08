export type GenerateOptions = {
  tone?: string[]
  targetRole?: string
  portfolioFormat?: 'markdown' | 'plain'
}

export type GeneratedArtifacts = {
  enhanced_resume: string
  cover_letter: string
  portfolio: string
  personal_note: string
}
