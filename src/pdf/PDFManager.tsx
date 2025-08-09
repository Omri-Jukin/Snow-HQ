import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

type Artifacts = {
  enhanced_resume: string
  cover_letter: string
  portfolio: string
  personal_note: string
}

type TemplateProps = {
  artifacts: Artifacts
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
          <Text>{artifacts.enhanced_resume}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Cover Letter</Text>
          <Text>{artifacts.cover_letter}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Personal Note</Text>
          <Text>{artifacts.personal_note}</Text>
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
            <Text>{artifacts.enhanced_resume}</Text>
          </View>
          <View
            style={[styles.section, { backgroundColor: '#ffffff', padding: 16, borderRadius: 6 }]}
          >
            <Text style={[styles.heading, { color: '#087EA4' }]}>Cover Letter</Text>
            <Text>{artifacts.cover_letter}</Text>
          </View>
          <View
            style={[styles.section, { backgroundColor: '#ffffff', padding: 16, borderRadius: 6 }]}
          >
            <Text style={[styles.heading, { color: '#087EA4' }]}>Personal Note</Text>
            <Text>{artifacts.personal_note}</Text>
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
            <Text>{artifacts.enhanced_resume}</Text>
          </View>
          <View
            style={[
              styles.section,
              { borderLeftWidth: 6, borderLeftColor: '#FF7043', paddingLeft: 12 },
            ]}
          >
            <Text style={[styles.heading, { color: '#D84315' }]}>Cover Letter</Text>
            <Text>{artifacts.cover_letter}</Text>
          </View>
          <View
            style={[
              styles.section,
              { borderLeftWidth: 6, borderLeftColor: '#FF7043', paddingLeft: 12 },
            ]}
          >
            <Text style={[styles.heading, { color: '#D84315' }]}>Personal Note</Text>
            <Text>{artifacts.personal_note}</Text>
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
            <Text style={{ color: '#E5E7EB' }}>{artifacts.enhanced_resume}</Text>
          </View>
          <View
            style={[styles.section, { backgroundColor: '#1F2937', padding: 16, borderRadius: 6 }]}
          >
            <Text style={[styles.heading, { color: '#93C5FD' }]}>Cover Letter</Text>
            <Text style={{ color: '#E5E7EB' }}>{artifacts.cover_letter}</Text>
          </View>
          <View
            style={[styles.section, { backgroundColor: '#1F2937', padding: 16, borderRadius: 6 }]}
          >
            <Text style={[styles.heading, { color: '#93C5FD' }]}>Personal Note</Text>
            <Text style={{ color: '#E5E7EB' }}>{artifacts.personal_note}</Text>
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
