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
}

export async function renderResumeToPdf(artifacts: Artifacts, templateId: keyof typeof registry) {
  const Template = registry[templateId] || ClassicTemplate
  const doc = <Template artifacts={artifacts} />
  return await pdf(doc).toBuffer()
}
