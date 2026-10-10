---
last_mapped_commit: 5388507e9f3a5d5b9a16089055cce46b10c957a3
last_mapped_at: 2026-10-10
---
# External Integrations

**Analysis Date:** 2026-10-10

## APIs & External Services

**AI & Machine Learning:**
- Google Gemini API - Cloud reasoning, synthesis, multi-turn chat, and audio transcription (`/api/voice/transcribe`)
  - SDK/Client: `@google/genai`
  - Auth: `GEMINI_API_KEY`
- Google Imagen 3 API - Photorealistic and illustrative image generation (`/api/image/generate`)
  - SDK/Client: `@google/genai`
  - Auth: `GEMINI_API_KEY`
- Ollama API - Local edge LLM inference running Gemma 4 E2B on CPU
  - Client: Native `fetch` HTTP requests to `${OLLAMA_URL}/api/generate` and `${OLLAMA_URL}/api/chat`
  - Auth: None (local endpoint `http://127.0.0.1:11434`)
- Piper Neural TTS - Offline text-to-speech synthesis with ONNX models
  - Client: Pre-compiled CLI binary `tts/piper/piper` with ONNX models
  - Auth: None (local executable)

**Productivity & Social:**
- Google Workspace (Gmail API, Google Calendar API) - Email reading/drafting and calendar event synchronization (`backend/tools.js`)
  - SDK/Client: REST API via `fetch`
  - Auth: OAuth2 via `backend/oauth.js`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- GitHub API - Repository access and user identity (`backend/oauth.js`)
  - SDK/Client: REST API via `fetch`
  - Auth: OAuth2, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- LinkedIn API - Profile retrieval and ghostwriting (`backend/oauth.js`)
  - SDK/Client: REST API via `fetch`
  - Auth: OAuth2, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
- Instagram Graph API / Webhook - Direct message processing and webhook verification (`backend/server.js`)
  - Client: Webhook handler (`/webhook`)
  - Auth: `IG_VERIFY_TOKEN` (defaults to `atlas_ig_verify_2026`), `IG_PAGE_ACCESS_TOKEN`
- Hacker News Firebase API - Technology story retrieval for autonomous learning loops (`backend/server.js`)
  - Client: `https://hacker-news.firebaseio.com/v0/topstories.json` via `fetch`
  - Auth: None (public API)
- DuckDuckGo HTML Web Search - Live web search tool (`backend/tools.js`)
  - Client: `https://html.duckduckgo.com/html/?q=` via `fetch`
  - Auth: None (public scrape)

## Data Storage

**Databases:**
- Flat-file JSON Store - Primary persistent state for memories, messages, tasks, logs, OAuth credentials, and usage
  - File: `backend/data/store.json`
  - Client: `backend/store.js` using synchronous `node:fs` methods
- In-Memory Demo Campus Stores - Curated static datasets for the Atlas campus multi-agent system
  - Files: `backend/atlas/data/demoStudents.js`, `backend/atlas/data/demoCampus.js`, `backend/atlas/data/demoEvents.js`, `backend/atlas/data/demoCommunication.js`
  - Client: In-memory JavaScript array queries
- Relational Database (Scaffolded):
  - Target: PostgreSQL 14+
  - DDL: `backend/atlas/campus/schemas/001_initial_student_schema.sql` (defines 6 relational tables: `departments`, `students`, `academics`, `skill_assessments`, `portfolio_projects`, `placement_records`)
  - Status: Schema written, live database connection not yet configured in runtime

**File Storage:**
- Local filesystem only:
  - Document outputs: `backend/data/docs/`
  - Generated images: `/var/www/atlas/images/`
  - Local state: `backend/.localstorage`

**Caching:**
- In-memory caching:
  - Global `state` variable in `backend/store.js`
  - In-memory OAuth state mapping in `backend/oauth.js`
  - RAG document cache in `backend/atlas/knowledge/retriever.js`

## Authentication & Identity

**Auth Provider:**
- Custom Multi-Provider OAuth2 Authorization Code Flow (`backend/oauth.js`):
  - Supported Providers: Google, GitHub, LinkedIn
  - Implementation: PKCE support, token refresh loop (`ensureGoogleToken` in `backend/tools.js`), state token validation
- Application Access:
  - Currently unauthenticated - all clients share global `store.json` state
  - No user session management or JWT/session cookies on `/api/chat` or `/api/atlas/orchestrate`

## Monitoring & Observability

**Error Tracking:**
- None external - Local console logging via `console.error` and in-memory event log array (`logEvent` in `backend/store.js`)

**Logs:**
- Browser-accessible web logs UI mounted at `/logs` and `/usage` (`backend/server.js`)
- Persisted to `store.json` under `logs` array

## CI/CD & Deployment

**Hosting:**
- Linux Virtual Machine (Azure Standard D2s v3)
- Reverse proxy via Nginx (`atlas-nginx.conf`) forwarding port 80/443 to backend port 8080 and static frontend

**CI Pipeline:**
- None detected - No GitHub Actions workflows (`.github/workflows`) or CI/CD pipelines currently configured in repository

## Environment Configuration

**Required env vars:**
- `PORT`, `APP_BASE`, `FRONTEND_URL`
- `OLLAMA_URL`, `DEFAULT_MODEL`, `AGENT_MODEL`
- `GEMINI_API_KEY`, `GEMINI_MODEL`, `REASON_MODEL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`

**Secrets location:**
- Stored locally in `backend/.env` (excluded from version control via `.gitignore`)

## Webhooks & Callbacks

**Incoming:**
- `GET /webhook` - Instagram webhook challenge verification (`hub.challenge`)
- `POST /webhook` - Instagram direct message event receiver (`backend/server.js`)
- `GET /api/oauth/:provider/callback` - OAuth authorization redirect receiver (`backend/server.js`)

**Outgoing:**
- None - Atlas relies on polling and direct API requests rather than outbound webhooks

---

*Integration audit: 2026-10-10*
