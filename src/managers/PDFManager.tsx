import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { Artifacts, TemplateProps, MarkdownBlock } from './PDFManager.type'

function parseMarkdownToBlocks(markdown: string): MarkdownBlock[] {
  const src = String(markdown || '').replace(/\r\n?/g, '\n')
  const lines = src.split('\n')
  const blocks: MarkdownBlock[] = []

  let paragraph: string[] = []
  let list: { ordered: boolean; items: string[] } | null = null
  let inFence = false

  const headingRe = /^(\s*)(#{1,6})\s+(.+)$/
  const ulRe = /^(\s*)[-*]\s+(.+)$/
  const olRe = /^(\s*)(\d+)[.)]\s+(.+)$/

  function flushParagraph() {
    if (paragraph.length) {
      const text = paragraph.join(' ').replace(/\s+/g, ' ').trim()
      if (text) blocks.push({ type: 'paragraph', text })
      paragraph = []
    }
  }
  function flushList() {
    if (list && list.items.length)
      blocks.push({ type: 'list', ordered: list.ordered, items: list.items })
    list = null
  }

  for (const raw of lines) {
    const line = raw
    if (/^```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) {
      paragraph.push(line)
      continue
    }
    if (!line.trim()) {
      flushParagraph()
      flushList()
      continue
    }
    const h = headingRe.exec(line)
    if (h) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'heading', level: h[2].length, text: h[3].trim() })
      continue
    }
    const ul = ulRe.exec(line)
    if (ul) {
      flushParagraph()
      if (!list || list.ordered) list = { ordered: false, items: [] }
      list.items.push(ul[2].trim())
      continue
    }
    const ol = olRe.exec(line)
    if (ol) {
      flushParagraph()
      if (!list || !list.ordered) list = { ordered: true, items: [] }
      list.items.push(ol[3].trim())
      continue
    }
    paragraph.push(line.trim())
  }
  flushParagraph()
  flushList()
  return blocks
}

function MarkdownRenderer({ markdown, color }: { markdown: string; color?: string }) {
  const blocks = parseMarkdownToBlocks(markdown)
  return (
    <View>
      {blocks.map((b, idx) => {
        if (b.type === 'heading') {
          const sizes = [18, 16, 14, 13, 12, 12]
          const size = sizes[Math.min(5, Math.max(0, b.level - 1))]
          return (
            <Text key={idx} style={[styles.heading, { fontSize: size, color }]}>
              {b.text}
            </Text>
          )
        }
        if (b.type === 'paragraph') {
          return (
            <Text key={idx} style={{ marginBottom: 6, lineHeight: 1.35, color }}>
              {b.text}
            </Text>
          )
        }
        return (
          <View key={idx} style={{ gap: 2, marginBottom: 6 }}>
            {b.items.map((it, i) => (
              <Text key={i} style={{ color }}>
                {b.ordered ? `${i + 1}. ` : '• '}
                {it}
              </Text>
            ))}
          </View>
        )
      })}
    </View>
  )
}

// Plain-text fallback kept for future use
function _convertMarkdownToPlain(input: string): string {
  if (!input) return ''
  let text = String(input)
  // Normalize line endings
  text = text.replace(/\r\n?/g, '\n')
  // Strip code fences
  text = text.replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, ''))
  // Inline code
  text = text.replace(/`([^`]+)`/g, '$1')
  // Headings: remove leading # and extra space
  text = text.replace(/^(\s*)#{1,6}\s*/gm, '$1')
  // Bold/italic
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  text = text.replace(/\*([^*]+)\*/g, '$1')
  text = text.replace(/__([^_]+)__/g, '$1')
  text = text.replace(/_([^_]+)_/g, '$1')
  // Links [text](url) -> text (url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
  // Images ![alt](url) -> alt (url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1 ($2)')
  // Blockquotes >
  text = text.replace(/^\s*>\s?/gm, '')
  // HR --- or *** -> blank line
  text = text.replace(/^\s*(?:-{3,}|\*{3,})\s*$/gm, '')
  // Bullets: - or * to •
  text = text.replace(/^(\s*)[-*]\s+/gm, '$1• ')
  // Numbered lists: 1. or 1) keep index
  text = text.replace(/^(\s*)(\d+)[.)]\s+/gm, '$1$2. ')
  // Collapse excessive blank lines
  text = text.replace(/\n{3,}/g, '\n\n')
  return text.trim()
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: 'Helvetica' },
  heading: { fontSize: 16, marginBottom: 8, fontWeight: 700 },
  section: { marginBottom: 16 },
  mono: { fontFamily: 'Helvetica' },
})

function ClassicTemplate({ artifacts }: TemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading}>Resume</Text>
          <MarkdownRenderer markdown={artifacts.enhanced_resume} />
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Cover Letter</Text>
          <MarkdownRenderer markdown={artifacts.cover_letter} />
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Personal Note</Text>
          <MarkdownRenderer markdown={artifacts.personal_note} />
        </View>
      </Page>
    </Document>
  )
}

const registry = {
  classic: ClassicTemplate,
  ocean: function OceanTemplate({ artifacts }: TemplateProps) {
    return (
      <Document>
        <Page size="A4" style={[styles.page, { backgroundColor: '#E6F7F8' }]}>
          <View
            style={[styles.section, { backgroundColor: '#ffffff', padding: 16, borderRadius: 6 }]}
          >
            <Text style={[styles.heading, { color: '#087EA4' }]}>Resume</Text>
            <MarkdownRenderer markdown={artifacts.enhanced_resume} />
          </View>
          <View
            style={[styles.section, { backgroundColor: '#ffffff', padding: 16, borderRadius: 6 }]}
          >
            <Text style={[styles.heading, { color: '#087EA4' }]}>Cover Letter</Text>
            <MarkdownRenderer markdown={artifacts.cover_letter} />
          </View>
          <View
            style={[styles.section, { backgroundColor: '#ffffff', padding: 16, borderRadius: 6 }]}
          >
            <Text style={[styles.heading, { color: '#087EA4' }]}>Personal Note</Text>
            <MarkdownRenderer markdown={artifacts.personal_note} />
          </View>
        </Page>
      </Document>
    )
  },
  sunset: function SunsetTemplate({ artifacts }: TemplateProps) {
    return (
      <Document>
        <Page size="A4" style={[styles.page, { backgroundColor: '#FFF3E0' }]}>
          <View
            style={[
              styles.section,
              { borderLeftWidth: 6, borderLeftColor: '#FF7043', paddingLeft: 12 },
            ]}
          >
            <Text style={[styles.heading, { color: '#D84315' }]}>Resume</Text>
            <MarkdownRenderer markdown={artifacts.enhanced_resume} />
          </View>
          <View
            style={[
              styles.section,
              { borderLeftWidth: 6, borderLeftColor: '#FF7043', paddingLeft: 12 },
            ]}
          >
            <Text style={[styles.heading, { color: '#D84315' }]}>Cover Letter</Text>
            <MarkdownRenderer markdown={artifacts.cover_letter} />
          </View>
          <View
            style={[
              styles.section,
              { borderLeftWidth: 6, borderLeftColor: '#FF7043', paddingLeft: 12 },
            ]}
          >
            <Text style={[styles.heading, { color: '#D84315' }]}>Personal Note</Text>
            <MarkdownRenderer markdown={artifacts.personal_note} />
          </View>
        </Page>
      </Document>
    )
  },
  slate: function SlateTemplate({ artifacts }: TemplateProps) {
    return (
      <Document>
        <Page size="A4" style={[styles.page, { backgroundColor: '#F3F4F6' }]}>
          <View
            style={[styles.section, { backgroundColor: '#1F2937', padding: 16, borderRadius: 6 }]}
          >
            <Text style={[styles.heading, { color: '#93C5FD' }]}>Resume</Text>
            <MarkdownRenderer markdown={artifacts.enhanced_resume} color="#E5E7EB" />
          </View>
          <View
            style={[styles.section, { backgroundColor: '#1F2937', padding: 16, borderRadius: 6 }]}
          >
            <Text style={[styles.heading, { color: '#93C5FD' }]}>Cover Letter</Text>
            <MarkdownRenderer markdown={artifacts.cover_letter} color="#E5E7EB" />
          </View>
          <View
            style={[styles.section, { backgroundColor: '#1F2937', padding: 16, borderRadius: 6 }]}
          >
            <Text style={[styles.heading, { color: '#93C5FD' }]}>Personal Note</Text>
            <MarkdownRenderer markdown={artifacts.personal_note} color="#E5E7EB" />
          </View>
        </Page>
      </Document>
    )
  },
}

export async function renderResumeToPdf(artifacts: Artifacts, templateId: keyof typeof registry) {
  const Template = registry[templateId] || ClassicTemplate
  const doc = <Template artifacts={artifacts} />
  return await pdf(doc).toBuffer()
}

const sectionLabels: Record<keyof Artifacts, string> = {
  enhanced_resume: 'Resume',
  cover_letter: 'Cover Letter',
  portfolio: 'Portfolio',
  personal_note: 'Personal Note',
}

export async function renderSingleArtifactToPdf(
  artifacts: Artifacts,
  templateId: keyof typeof registry,
  only: keyof Artifacts,
) {
  const label = sectionLabels[only]
  const markdown = artifacts[only]

  function ClassicSingle() {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.heading}>{label}</Text>
            <MarkdownRenderer markdown={markdown} />
          </View>
        </Page>
      </Document>
    )
  }

  function OceanSingle() {
    return (
      <Document>
        <Page size="A4" style={[styles.page, { backgroundColor: '#E6F7F8' }]}>
          <View
            style={[styles.section, { backgroundColor: '#ffffff', padding: 16, borderRadius: 6 }]}
          >
            <Text style={[styles.heading, { color: '#087EA4' }]}>{label}</Text>
            <MarkdownRenderer markdown={markdown} />
          </View>
        </Page>
      </Document>
    )
  }

  function SunsetSingle() {
    return (
      <Document>
        <Page size="A4" style={[styles.page, { backgroundColor: '#FFF3E0' }]}>
          <View
            style={[
              styles.section,
              { borderLeftWidth: 6, borderLeftColor: '#FF7043', paddingLeft: 12 },
            ]}
          >
            <Text style={[styles.heading, { color: '#D84315' }]}>{label}</Text>
            <MarkdownRenderer markdown={markdown} />
          </View>
        </Page>
      </Document>
    )
  }

  function SlateSingle() {
    return (
      <Document>
        <Page size="A4" style={[styles.page, { backgroundColor: '#F3F4F6' }]}>
          <View
            style={[styles.section, { backgroundColor: '#1F2937', padding: 16, borderRadius: 6 }]}
          >
            <Text style={[styles.heading, { color: '#93C5FD' }]}>{label}</Text>
            <MarkdownRenderer markdown={markdown} color="#E5E7EB" />
          </View>
        </Page>
      </Document>
    )
  }

  const singleRegistry: Record<keyof typeof registry, React.FC> = {
    classic: ClassicSingle,
    ocean: OceanSingle,
    sunset: SunsetSingle,
    slate: SlateSingle,
  }

  const Template = singleRegistry[templateId] || ClassicSingle
  const doc = <Template />
  return await pdf(doc).toBuffer()
}
