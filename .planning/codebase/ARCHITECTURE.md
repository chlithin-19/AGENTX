---
last_mapped_commit: 5388507e9f3a5d5b9a16089055cce46b10c957a3
last_mapped_at: 2026-10-10
---
<!-- refreshed: 2026-10-10 -->

# Architecture

**Analysis Date:** 2026-10-10

## System Overview

Atlas Agent is a hybrid personal executive workstation and campus multi-agent intelligence layer. The architecture integrates an edge LLM (Google Gemma 4 E2B via Ollama) for instant intent classification, local privacy, and low-latency drafting with cloud multimodal reasoning (Google Gemini 3.8 Flash + Imagen 3 via `@google/genai`) for complex planning, audio processing, and visual asset generation.

The codebase is currently in transition between two major milestones:
1. **Core AGENTX Runtime:** A single-user executive assistant supporting email, calendar, proactive background routines, document generation (PDF/Excel/Word), and Server-Sent Events (SSE) streaming.
2. **Atlas Campus Intelligence Layer (Phase 2A/2B):** A modular, additive multi-agent system (`backend/atlas/`) hosting dedicated agents (`academic`, `campus`, `event`, `communication`), an orchestrator with task decomposition, knowledge retrieval (RAG), demo datasets, and relational PostgreSQL schemas.

## Architecture Pattern & Layers

The system follows a modular layered architecture with specialized subsystems:

```
[ Frontend: React 18 + Vite SPA ]
               │
               ▼ (HTTP / SSE / JSON)
[ Reverse Proxy: Nginx (SSL & Routing) ]
               │
               ▼
[ Backend Engine: Express 4.21.2 (backend/server.js) ]
  ├── 1. Streaming & Chat Pipeline (/api/chat, /api/stream)
  ├── 2. Background Autonomy & Scheduler (Cyclic cron loops, memory consolidation)
  ├── 3. Document Generation Engine (backend/docs.js: PDF, Word, Excel)
  ├── 4. Integration & OAuth Gateway (backend/oauth.js, backend/tools.js)
  └── 5. Atlas Campus Intelligence Subsystem (/api/atlas, backend/atlas/index.js)
        ├── Multi-Agent Orchestrator (backend/atlas/orchestrator/orchestrator.js)
        ├── Specialized Campus Agents (Academic, Campus, Event, Communication)
        ├── Knowledge Retriever & RAG (backend/atlas/knowledge/retriever.js)
        └── Campus Data & Schemas (backend/atlas/data/, backend/atlas/campus/schemas/)
```

### 1. Presentation Layer (`frontend/frontend/src/`)

- Single-page application built with React 18 and Vite.
- Core views: `ChatArea.jsx` (interactive chat stream, prompt chips, audio recorder), `Integrations.jsx` (OAuth connectors), `ThoughtLine.jsx` (reasoning visualization), `ImageCard.jsx` (visual generation display), `LatticeLoader.jsx` (loading animation), and `Sidebar.jsx` (navigation).
- Communicates with backend via `fetch` and Server-Sent Events (`EventSource`).

### 2. Primary Gateway & Runtime Layer (`backend/server.js`)

- Express web server (over 2,000 lines) managing HTTP routes, SSE streaming sessions, background autonomic intervals, model invocation, and Instagram webhook processing.
- Handles dual-mode AI reasoning:
  - Local edge inference via `queryOllama()` (`gemma4:e2b`).
  - Cloud reasoning via `reason()` and `genText()` using `@google/genai` (`gemini-3.8-flash`).
- Intercepts incoming messages: if `isAtlasQuery(message)` is true, requests are seamlessly delegated to the Atlas orchestrator.

### 3. Atlas Campus Intelligence Layer (`backend/atlas/`)

- Pure ES Module namespace mounted additively at `/api/atlas`.
- **Orchestrator (`backend/atlas/orchestrator/orchestrator.js`):** Inspects user intent, builds an execution plan, sequentially executes the relevant domain agents with fault isolation, aggregates knowledge citations, and formats unified markdown outputs.
- **Domain Agents (`backend/atlas/agents/`):**
  - `academic.js`: Evaluates student academic standing, CGPA, attendance thresholds (<75%, <65%), backlog risks, and placement readiness.
  - `campus.js`: Answers queries regarding campus buildings, rooms, services, operating hours, and accepts maintenance ticket submissions.
  - `event.js`: Discovers and details upcoming hackathons, tech workshops, cultural fests, and career fairs.
  - `communication.js`: Fetches administrative circulars and drafts formal campus communications with explicit side-effect confirmation requirements.
- **Knowledge Subsystem (`backend/atlas/knowledge/`):** Document repository and chunk scoring engine (`retriever.js`) providing grounded citations from authoritative Markdown policies.
- **Data & Schemas (`backend/atlas/data/`, `backend/atlas/campus/schemas/`):** In-memory demo data arrays representing students, campus buildings, events, and circulars; and PostgreSQL DDL definitions for future migration.

### 4. Integration & Persistence Layer (`backend/store.js`, `backend/tools.js`, `backend/oauth.js`)

- Persistence managed synchronously through a single JSON database file: `backend/data/store.json`.
- Integrations module manages Google Workspace token refreshing, Gmail querying, Calendar event creation, and web searching.

## Data Flow

### 1. Standard Executive Chat Flow

1. User sends prompt via React `ChatArea.jsx` to `POST /api/chat`.
2. `backend/server.js` evaluates intent using pattern matching / regex.
3. If tool execution is needed (e.g. read emails), `backend/tools.js` calls external APIs.
4. Prompt + tool context is fed to local Ollama (`gemma4:e2b`) or Gemini Flash 3.8.
5. Response tokens and status messages stream back to the UI via Server-Sent Events (SSE).

### 2. Campus Multi-Agent Query Flow

1. User submits a campus-related inquiry (e.g., "Check my attendance and upcoming hackathons").
2. `isAtlasQuery()` identifies campus keywords and delegates to `orchestrateAtlas()`.
3. Orchestrator calls `routeQuery()` to determine agent sequence (`academic` -> `event`).
4. Orchestrator queries `queryKnowledge()` for supporting markdown policy documentation.
5. Selected agents execute sequentially against the campus data/knowledge layers.
6. Orchestrator synthesizes agent outputs into a unified markdown response with citations.
7. Result is streamed back to the client or returned via `POST /api/atlas/orchestrate`.

## Key Abstractions

- `Agent Interface` (`backend/atlas/agents/`): Each agent exports `name`, `role`, `description`, `canHandle(query)`, and `execute(params)`.
- `Orchestrator Plan` (`backend/atlas/orchestrator/orchestrator.js`): Structured execution payload containing `plan`, `results`, `citations`, `actions`, and `response`.
- `Knowledge Retriever` (`backend/atlas/knowledge/retriever.js`): Semantic chunk retriever calculating term overlap and relevance scores across markdown sections.
- `Persistent Store` (`backend/store.js`): Atomically swaps writes via `.tmp` file and exports `get()`, `save()`, and `logEvent()`.

## Entry Points

- `backend/server.js` - Main backend server and Express app entry point.
- `backend/atlas/index.js` - Atlas campus intelligence module entry point.
- `frontend/frontend/src/main.jsx` - React application root mount.
- `frontend/backend/app/main.py` - Auxiliary FastAPI service entry point.

## Anti-Patterns & Technical Constraints

- **Monolithic Server (`backend/server.js`):** Contains over 2,000 lines combining HTTP routing, SSE streaming, cron loops, model switching, HTML templating, and webhook parsing in a single file.
- **Synchronous JSON Persistence (`backend/store.js`):** Entire database is read and written synchronously via `readFileSync`/`writeFileSync`. This works for single-user development but blocks event loops under concurrent access.
- **Absence of Centralized Authentication:** APIs lack session cookies or Bearer token validation; state is globally shared.
- **In-Memory Static Demo Stores:** Campus agents query hardcoded JS arrays in `backend/atlas/data/` rather than the PostgreSQL schema defined in `backend/atlas/campus/schemas/`.

---

*Architecture analysis: 2026-10-10*
