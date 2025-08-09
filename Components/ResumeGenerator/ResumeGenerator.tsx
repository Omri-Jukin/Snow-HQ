'use client'
import React from 'react'
import { Button } from '../Button'
import Typography from '../Typography'
import { BrokenGlass } from '../BrokenGlass'
import Snackbar from '../Snackbar'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material'
import {
  Root,
  Row,
  Preview,
  Panel,
  PanelHeader,
  PanelBody,
  Label,
  TextArea,
  SelectEl,
  Field,
  Separator,
} from './ResumeGenerator.style'
import { DEFAULT_TEMPLATE_ID, MAX_UPLOAD_BYTES } from './ResumeGenerator.const'
import type { GeneratedArtifacts } from './ResumeGenerator.type'

async function postGenerate(
  form: FormData,
): Promise<{ artifacts?: GeneratedArtifacts; error?: string }> {
  const res = await fetch('/api/studio/generate-local', {
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
  const [targetRole, setTargetRole] = React.useState('Software Engineer')
  const TONE_OPTIONS = [
    'confident',
    'concise',
    'professional',
    'direct',
    'friendly',
    'technical',
    'executive',
    'persuasive',
    'no-fluff',
  ]
  const STYLE_OPTIONS = ['corporate', 'legal', 'academic', 'marketing', 'casual', 'formal']
  const [toneChoices, setToneChoices] = React.useState<string[]>(['confident', 'concise'])
  const [styleChoices, setStyleChoices] = React.useState<string[]>([])

  // no longer used after switching to MUI Select multiple; keep for reference if needed
  const [artifacts, setArtifacts] = React.useState<GeneratedArtifacts | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snackSeverity, setSnackSeverity] = React.useState<'success' | 'error'>('error')

  const onSelectFile =
    (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null
      if (file && file.size > MAX_UPLOAD_BYTES) {
        setError('File too large')
        return
      }
      setter(file)
    }

  // Provide comprehensive example CV and JD text generators for high-tech resumes.
  const getExampleCvText = (): string => {
    return `
Jane Smith
Senior Software Engineer

Contact:
- Email: jane.smith@email.com
- Phone: +1-555-123-4567
- LinkedIn: linkedin.com/in/janesmith

Summary:
Results-driven Senior Software Engineer with 8+ years of experience designing, developing, and deploying scalable web applications. Expert in JavaScript, TypeScript, React, Node.js, and cloud technologies. Proven leader with a passion for mentoring teams and delivering high-quality solutions in fast-paced environments.

Technical Skills:
- Languages: JavaScript (ES6+), TypeScript, Python, Java
- Frameworks: React, Next.js, Node.js, Express, Redux, Jest
- Cloud: AWS (Lambda, S3, EC2, CloudFormation), GCP
- DevOps: Docker, Kubernetes, CI/CD (GitHub Actions, Jenkins)
- Databases: PostgreSQL, MongoDB, Redis
- Tools: Git, Webpack, Babel, Figma, Jira, Agile/Scrum

Professional Experience:

Senior Software Engineer, TechNova Solutions, Tel Aviv, Israel
2019–Present
- Led a team of 5 engineers to build a SaaS analytics platform serving 100k+ users.
- Architected and implemented a microservices backend using Node.js, TypeScript, and AWS Lambda.
- Developed a real-time dashboard in React and Redux, improving client engagement by 30%.
- Introduced automated testing and CI/CD pipelines, reducing deployment time by 50%.
- Mentored junior developers and conducted code reviews to ensure best practices.

Full Stack Developer, Cloudify Ltd., Herzliya, Israel
2016–2019
- Built and maintained RESTful APIs and web applications using Node.js and React.
- Migrated legacy systems to modern cloud infrastructure (AWS), improving reliability and scalability.
- Collaborated with product managers and designers to deliver new features on schedule.

Education:
B.Sc. in Computer Science, Technion – Israel Institute of Technology, 2012–2016

Certifications:
- AWS Certified Solutions Architect – Associate
- Scrum Master Certified (SMC)

Languages:
- English (Fluent)
- Hebrew (Native)
    `.trim()
  }

  const getExampleJdText = (): string => {
    return `
We are looking for a Senior Software Engineer to join our dynamic R&D team.

Responsibilities:
- Design, develop, and maintain scalable web applications using React and Node.js.
- Lead architecture discussions and mentor junior engineers.
- Collaborate with cross-functional teams to define, design, and ship new features.
- Ensure code quality through code reviews, testing, and best practices.
- Work with DevOps to optimize CI/CD pipelines and cloud deployments.

Requirements:
- 5+ years of experience in software development, preferably in high-tech environments.
- Strong proficiency in JavaScript, TypeScript, React, and Node.js.
- Experience with AWS or other cloud platforms.
- Familiarity with Docker, Kubernetes, and CI/CD tools.
- Excellent communication and teamwork skills.
- B.Sc. or higher in Computer Science or related field.
    `.trim()
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

      const options: Record<string, unknown> = { portfolioFormat: 'markdown' }
      if (targetRole) options.targetRole = targetRole
      if (toneChoices.length) options.tone = toneChoices.join(', ')
      if (styleChoices.length) options.style = styleChoices
      form.append('options', JSON.stringify(options))

      const result = await postGenerate(form)
      if (result.error || !result.artifacts) {
        setError(result.error || 'Generation failed')
        setSnackSeverity('error')
        setSnackOpen(true)
        return
      }
      setArtifacts(result.artifacts)
      setSnackSeverity('success')
      setSnackOpen(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error')
      setSnackSeverity('error')
      setSnackOpen(true)
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
    <Root id="resume-generator">
      <BrokenGlass id="resume-generator-panel" intensity="high" animation={false}>
        <Panel id="resume-generator-panel-content">
          <PanelHeader id="resume-generator-panel-header">
            <Typography id="resume-generator-panel-header-title" variant="h6">
              Compose from CV + JD
            </Typography>
            <Typography id="resume-generator-panel-header-subtitle" variant="body2">
              Upload files or paste text
            </Typography>
          </PanelHeader>
          <PanelBody id="resume-generator-panel-body">
            <Row id="resume-generator-panel-row-1">
              <Field id="resume-generator-panel-field-1">
                <Label id="resume-generator-panel-label-1">CV (PDF/DOCX/TXT)</Label>
                <input type="file" accept=".pdf,.docx,.txt" onChange={onSelectFile(setCvFile)} />
                <TextArea
                  id="resume-generator-panel-text-area-1"
                  placeholder="Paste your CV text here"
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                />
                {/* expiremental button to insert example CV text */}
                <Button
                  id="resume-generator-panel-button-1"
                  onClick={() => setCvText(getExampleCvText())}
                >
                  Insert example CV
                </Button>
              </Field>
              <Field id="resume-generator-panel-field-2">
                <Label id="resume-generator-panel-label-2">Job Description (PDF/DOCX/TXT)</Label>
                <input
                  id="resume-generator-panel-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={onSelectFile(setJdFile)}
                />
                <TextArea
                  id="resume-generator-panel-text-area-2"
                  placeholder="Paste the job description here"
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
                {/* expiremental button to insert example JD text */}
                <Button
                  id="resume-generator-panel-button-2"
                  onClick={() => setJdText(getExampleJdText())}
                >
                  Insert example JD
                </Button>
              </Field>
            </Row>
            <Separator id="resume-generator-panel-separator" />
            <Row id="resume-generator-panel-row-2">
              <Field id="resume-generator-panel-field-3">
                <Label>Target role (optional)</Label>
                <TextArea
                  style={{ minHeight: 40 }}
                  placeholder="e.g., Senior Frontend Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
                <Label>Tone</Label>
                <FormControl size="small" fullWidth>
                  <InputLabel id="tone-multi-label">Select tones</InputLabel>
                  <Select
                    labelId="tone-multi-label"
                    multiple
                    value={toneChoices}
                    onChange={(e) =>
                      setToneChoices(
                        typeof e.target.value === 'string'
                          ? e.target.value.split(',')
                          : (e.target.value as string[]),
                      )
                    }
                    input={<OutlinedInput label="Select tones" />}
                    renderValue={(selected) => (selected as string[]).join(', ')}
                  >
                    {TONE_OPTIONS.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox checked={toneChoices.indexOf(name) > -1} />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Label>Style / Register (optional)</Label>
                <FormControl size="small" fullWidth>
                  <InputLabel id="style-multi-label">Select styles</InputLabel>
                  <Select
                    labelId="style-multi-label"
                    multiple
                    value={styleChoices}
                    onChange={(e) =>
                      setStyleChoices(
                        typeof e.target.value === 'string'
                          ? e.target.value.split(',')
                          : (e.target.value as string[]),
                      )
                    }
                    input={<OutlinedInput label="Select styles" />}
                    renderValue={(selected) => (selected as string[]).join(', ')}
                  >
                    {STYLE_OPTIONS.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox checked={styleChoices.indexOf(name) > -1} />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Label id="resume-generator-panel-label-3">PDF Template</Label>
                <SelectEl
                  value={templateId}
                  onChange={(e) => setTemplateId(String((e.target as HTMLSelectElement).value))}
                >
                  <option value="classic">Classic</option>
                  <option value="ocean">Ocean</option>
                  <option value="sunset">Sunset</option>
                  <option value="slate">Slate</option>
                </SelectEl>
              </Field>
              <Field id="resume-generator-panel-field-4">
                <Button
                  id="resume-generator-panel-button-3"
                  variant="gradient"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? 'Generating…' : 'Generate'}
                </Button>
                <Button
                  id="resume-generator-panel-button-4"
                  onClick={handleDownloadPdf}
                  disabled={!artifacts}
                >
                  Download PDF
                </Button>
              </Field>
            </Row>
            <Snackbar
              open={snackOpen}
              severity={snackSeverity}
              message={
                snackSeverity === 'success'
                  ? 'Artifacts generated'
                  : error || 'Something went wrong'
              }
              onClose={() => setSnackOpen(false)}
              autoHideDuration={5000}
            />
          </PanelBody>
        </Panel>
      </BrokenGlass>

      {artifacts && (
        <Row>
          <Preview>
            <Typography variant="h6">Resume</Typography>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{artifacts.enhanced_resume}</pre>
          </Preview>
          <Preview>
            <Typography variant="h6">Cover Letter</Typography>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{artifacts.cover_letter}</pre>
          </Preview>
          <Preview>
            <Typography variant="h6">Personal Note</Typography>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{artifacts.personal_note}</pre>
          </Preview>
        </Row>
      )}
    </Root>
  )
}
