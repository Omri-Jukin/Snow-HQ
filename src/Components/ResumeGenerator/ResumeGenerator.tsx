'use client'
import React from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material'
import { Root, Row, Preview } from './ResumeGenerator.style'
import { DEFAULT_TEMPLATE_ID, MAX_UPLOAD_BYTES } from './ResumeGenerator.const'
import type { GeneratedArtifacts } from './ResumeGenerator.type'

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsText(file)
  })
}

async function postGenerate(
  form: FormData,
): Promise<{ artifacts?: GeneratedArtifacts; error?: string }> {
  const res = await fetch('/apps/studio/api/studio/generate-local', {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const err = await res.text()
    return { error: err }
  }
  return res.json()
}

async function postPdf(artifacts: GeneratedArtifacts, templateId: string): Promise<Blob> {
  const res = await fetch('/api/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artifacts, templateId }),
  })
  if (!res.ok) throw new Error('Failed to render PDF')
  return await res.blob()
}

export default function ResumeGenerator() {
  const [cvText, setCvText] = React.useState('')
  const [jdText, setJdText] = React.useState('')
  const [cvFile, setCvFile] = React.useState<File | null>(null)
  const [jdFile, setJdFile] = React.useState<File | null>(null)
  const [templateId, setTemplateId] = React.useState(DEFAULT_TEMPLATE_ID)
  const [artifacts, setArtifacts] = React.useState<GeneratedArtifacts | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const onSelectFile =
    (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null
      if (file && file.size > MAX_UPLOAD_BYTES) {
        setError('File too large')
        return
      }
      setter(file)
    }

  const handleGenerate = async () => {
    try {
      setError(null)
      setLoading(true)
      const form = new FormData()
      if (cvFile) form.append('cvFile', cvFile)
      if (jdFile) form.append('jdFile', jdFile)
      if (!cvFile) form.append('cvText', cvText)
      if (!jdFile) form.append('jdText', jdText)

      const result = await postGenerate(form)
      if (result.error || !result.artifacts) {
        setError(result.error || 'Generation failed')
        return
      }
      setArtifacts(result.artifacts)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!artifacts) return
    const blob = await postPdf(artifacts, templateId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resume-${templateId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Root>
      <Card>
        <CardHeader
          title="Resume & Cover Letter Generator"
          subheader="Upload files or paste text"
        />
        <CardContent>
          <Row>
            <Stack gap={1}>
              <FormLabel>CV (PDF/DOCX/TXT)</FormLabel>
              <input type="file" accept=".pdf,.docx,.txt" onChange={onSelectFile(setCvFile)} />
              <TextField
                label="Or paste CV text"
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                multiline
                minRows={6}
                placeholder="Paste your CV text here"
              />
            </Stack>
            <Stack gap={1}>
              <FormLabel>Job Description (PDF/DOCX/TXT)</FormLabel>
              <input type="file" accept=".pdf,.docx,.txt" onChange={onSelectFile(setJdFile)} />
              <TextField
                label="Or paste JD text"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                multiline
                minRows={6}
                placeholder="Paste the job description here"
              />
            </Stack>
          </Row>
          <Divider sx={{ my: 2 }} />
          <Row>
            <Stack gap={1}>
              <FormControl>
                <FormLabel>PDF Template</FormLabel>
                <Select
                  size="small"
                  value={templateId}
                  onChange={(e) => setTemplateId(String(e.target.value))}
                >
                  <MenuItem value="classic">Classic</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack gap={1}>
              <Button variant="contained" onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating…' : 'Generate'}
              </Button>
              <Button variant="outlined" onClick={handleDownloadPdf} disabled={!artifacts}>
                Download PDF
              </Button>
            </Stack>
          </Row>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {artifacts && (
        <Row>
          <Preview>
            <Typography variant="h6">Resume</Typography>
            <Typography component="pre" whiteSpace="pre-wrap">
              {artifacts.enhanced_resume}
            </Typography>
          </Preview>
          <Preview>
            <Typography variant="h6">Cover Letter</Typography>
            <Typography component="pre" whiteSpace="pre-wrap">
              {artifacts.cover_letter}
            </Typography>
          </Preview>
          <Preview>
            <Typography variant="h6">Personal Note</Typography>
            <Typography component="pre" whiteSpace="pre-wrap">
              {artifacts.personal_note}
            </Typography>
          </Preview>
        </Row>
      )}
    </Root>
  )
}
