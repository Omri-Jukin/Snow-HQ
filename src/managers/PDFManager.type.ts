export type Artifacts = {
  enhanced_resume: string
  cover_letter: string
  portfolio: string
  personal_note: string
}

export type TemplateProps = {
  artifacts: Artifacts
}

export type MarkdownBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
