## SnowHQ Studio — AI-Powered, Job-Application Artifact Generator

This document specifies the product, architecture, data model, prompts, security, and delivery plan for a "Studio" experience at a dedicated subdomain (proposed: `studio.snowhq.org`). The goal is to generate highly targeted application artifacts per job posting: resume text (ATS-safe), cover letter, tailored portfolio ordering, and a short personal note.

### Objectives

- Deliver personalized, application-centered artifacts with strong JD alignment and factual integrity.
- Keep the experience compliant and privacy-conscious (opt-in persistence, clear retention, deletion).
- Ship a lean MVP that fits the current repo, while paving the path to a dedicated subdomain/app later.

### Non-Goals (MVP)

- Automated LinkedIn profile scraping or DM automation.
- Full WYSIWYG resume layout engine (focus on ATS-safe text and simple exports).
- Complex user accounts/teams. A lightweight gated UI is sufficient initially.

---

## Product

### Inputs

- CV upload (PDF/DOCX) or pasted text
- Job post URL and/or pasted description
- Optional: portfolio URL(s), LinkedIn URL, target role/seniority, location preference
- Optional: tone/style presets (concise, friendly, metrics-forward)

### Outputs

1. Resume (ATS-safe, plain text) tailored to the job
2. Cover letter (concise; greeting → body paragraphs → closing)
3. Portfolio suggestions (ordering and 3–6 project bullets most relevant to JD)
4. Personal note (short message for email/LinkedIn, 60–100 words)

### Guardrails

- Strict factuality: only assert facts present in inputs; no fabrication.
- Prefer quantitative impact from the CV; otherwise neutral phrasing.
- Avoid sensitive data; request explicit consent for storage.
- Keep resume formatting simple: no tables, columns, or fancy glyphs.

### UX Flow (MVP)

1. Upload/provide inputs → parse & preview extracted facts
2. Configure options (tone, target role) → generate
3. Review/edit each artifact with inline suggestions
4. Export as Markdown/DOCX/plain text; copy-to-clipboard; optional email template
5. Optional: save session (if user opts in) for later download

---

## Architecture

### Hosting & Subdomain

- Proposed subdomain: `studio.snowhq.org`
  - Phase A (MVP): Dedicated app at `apps/studio` (Next.js). Routes: `/` (landing), `/studio` (main), `/auth` (token gate).
  - Phase B: Optional monorepo packages sharing (`packages/types`, `packages/ui`) and subdomain mapping.

### Data Flow (Server-first)

1. Client uploads CV / pastes JD → server processes parsing (Node runtime, not Edge)
2. Server normalizes to structured JSON (profile facts, jd requirements)
3. Server calls Vercel AI SDK with strict JSON schema for outputs
4. Server returns structured artifacts to client for review
5. Optional: persist request/outputs in CMS (Payload) under `applications` collection with user consent

### Tech Choices

- Frontend: Next.js (App Router, RSC + client components)
- API: Server Actions and/or tRPC BFF (preferred per repo convention)
- AI: Vercel AI SDK (provider-agnostic) with JSON schema and function call style
- Parsing:
  - PDF: `pdf-parse` (Node) or hosted parsing if reliability is critical
  - DOCX: `mammoth` or similar
- Storage (optional): Supabase Storage or R2 for uploads; short TTL
- Persistence (optional): Payload CMS collection `applications`

### Rate Limits & Cost

- Soft limit: 10 generations/day/IP in MVP
- Model strategy: use a smaller model for extraction; higher quality model for final copy; 1–2 calls per artifact (or single multi-artifact call)

---

## API & Routes (MVP)

### UI Routes (Next.js, under `apps/studio`)

- `/` — landing/info + link to Studio
- `/studio` — form and results (review & export inline)
- `/auth` — token gate for private access

### Endpoints (BFF)

- `POST /api/studio/generate-local` — calls local LM Studio (OpenAI-compatible) using `AI_BASE_URL` and `OPENAI_MODEL` (implemented)
- `POST /api/studio/generate` — hosted provider path (OpenAI/Groq/OpenRouter; implemented for OpenAI; fallbacks pending)
- `POST /api/studio/auth` — sets token cookie for private access (implemented)
- Future: `studio.parseCv`, `studio.parseJd`, `studio.exportDocx`, `studio.saveSession`

### CMS Integration (Optional)

- New collection: `applications`
  - Fields: `inputs` (json), `outputs` (json), `consent` (boolean + timestamp), `ownerEmail` (optional), `createdAt`
  - Access: private; write-only with server token; read via Admin

---

## Data Model (Runtime JSON)

```ts
type ProfileFacts = {
  headline: string
  coreSkills: string[]
  impactMetrics: string[]
  experience: Array<{
    company: string
    role: string
    bullets: string[]
    start?: string
    end?: string
  }>
  education?: Array<{ school: string; degree?: string; year?: string }>
}

type JdRequirement = { requirement: string; priority: 'high' | 'med' | 'low' }

type StudioArtifacts = {
  profile_summary: { headline: string; core_skills: string[]; impact_metrics: string[] }
  jd_requirements: JdRequirement[]
  match_analysis: { matches: string[]; gaps: string[] }
  resume: {
    summary: string
    skills: string[]
    experience: Array<{ company: string; role: string; bullets: string[] }>
    education: Array<{ school: string; degree?: string; year?: string }>
  }
  cover_letter: { greeting: string; body_paragraphs: string[]; closing: string }
  portfolio: { ordering_rationale: string; recommended_projects: string[] }
  personal_note: { channel: 'email' | 'linkedin'; message: string }
}
```

Persistence (if enabled) mirrors the above with metadata: request id, timestamps, consent flags.

---

## Prompts (Vercel AI SDK)

### System Prompt (core)

You are an assistant that produces application artifacts (resume text, cover letter, portfolio ordering, personal note) tailored to a specific job description and candidate CV. Only use facts present in the inputs. If a required fact is missing, either ask for it (when interactive) or omit it. Keep resume ATS-safe (plain text, no tables/columns/special glyphs). Prefer quantified impact that appears in the CV. Keep tone concise, specific, and professional.

### JSON Output Contract

Enforce a strict schema for `StudioArtifacts` using the SDK’s JSON mode or tool/function calling. Reject/repair non-conforming outputs. If the model is uncertain, surface a `gaps` entry.

### Generation Inputs

- Parsed CV text + `ProfileFacts`
- Parsed JD text + `JdRequirement[]`
- Options: tone, target role, seniority, channels

### Style Constraints

- Resume: 4–6 bullet points per recent role; single-line bullets; include metrics where present
- Cover letter: 120–200 words; one specific hook tied to JD; one proof; clear ask
- Personal note: 60–100 words; single ask; friendly but direct

---

## Security, Privacy, Compliance

- No scraping behind authentication; job text must be user-supplied (URL → fetch only if public and CORS-allowed).
- Consent: explicit opt-in to store inputs/outputs; default to ephemeral in-memory/session use.
- Retention: if stored, 30-day default retention unless user marks keep.
- PII handling: encrypt at rest if persisted; never log raw CV/JD; redact logs.
- Rate limiting and basic abuse protection (per-IP counters, backoff).

---

## Exports & Formatting

- Markdown and Plain Text always available.
- DOCX export via server-side template (no images/tables for MVP). Keep font and spacing simple.
- Copy-to-clipboard for each artifact.

---

## MVP Delivery Plan

1. UI skeleton (`/(frontend)/studio`): form for CV upload/paste, JD URL/paste, options
2. Server parsing endpoints (tRPC or Server Actions): `parseCv`, `parseJd`
3. Generation endpoint: `studio.generate` returning `StudioArtifacts`
4. Review UI: tabs for Resume, Cover Letter, Portfolio, Personal Note with editable textareas
5. Exporters: Markdown/plain text; DOCX minimal
6. Optional persistence: Payload `applications` collection + Admin read
7. Rate limiting + basic analytics/events

### Nice-to-haves (post-MVP)

- Templates library (role-specific tones/styles)
- Saved profiles (candidate baseline) to amortize parsing cost
- A/B variants (2–3 versions per artifact)
- Email integration (draft to Gmail/Outlook); manual send only

---

## Environment & Configuration

```
AI_PROVIDER=openai|groq|openrouter|together
AI_API_KEY=sk_***                 # required if using hosted provider
AI_BASE_URL=http://localhost:1234/v1  # LM Studio OpenAI-compatible server
OPENAI_MODEL=openai/gpt-oss-20b   # or llama/qwen model name in LM Studio

MAX_GENERATIONS_PER_DAY=10
UPLOAD_MAX_MB=8
PERSIST_APPLICATIONS=false        # set true to enable CMS persistence
NEXT_PUBLIC_STUDIO_ENABLED=true
STUDIO_ACCESS_TOKEN=secret-token  # enables token gating via /auth
```

If persistence is enabled:

```
CMS_SERVER_URL=https://cms.snowhq.org
CMS_SERVER_TOKEN=ptk_*** (server token)
```

---

## Open Questions (need input to finalize implementation)

1. Subdomain mapping: map `studio.snowhq.org` to `apps/studio` deployment when ready.
2. Persistence: default OFF or ON? If ON, confirm fields retained and retention window (suggest 30 days).
3. Model/provider preference: default to OpenAI (gpt-4.1/4o-mini) or Anthropic (Sonnet)? Budget constraints?
4. Upload policy: accept only PDF/DOCX, or also Markdown/Plain Text?
5. Authentication: keep public + rate-limited, or require simple email-based gating?

---

## Acceptance Criteria (MVP)

- User can input CV and JD, see parsed facts, and generate four artifacts in <15s typical latency.
- Artifacts adhere to schema and style constraints; no fabricated facts.
- Exports available (MD/TXT; DOCX minimal).
- Feature flag `NEXT_PUBLIC_STUDIO_ENABLED` gates UI.
- Optional persistence works when enabled; Admin can view records in Payload.
- Basic rate limits prevent abuse.

---

## Rollout & Metrics

- Track: submissions started/completed, time-to-first-artifact, export type usage, user edits per artifact, opt-in rate for persistence.
- Quality loop: collect anonymized deltas between generated and final edited text (opt-in), improve prompts.

---

## Future Directions

- Multi-language support.
- Skill taxonomy normalization for stronger JD matching.
- Portfolio page generator tied to SnowGen templates.
- Recruiter profiling (user-supplied public bios) to tune the personal note (manual copy only).
