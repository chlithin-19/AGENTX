# ATLAS FINAL IMPLEMENTATION REPORT
## Comprehensive Technical Architecture, Subsystems & Implementation Details

**Date:** November 3, 2026  
**System:** ATLAS Campus Multi-Agent AI  
**Author:** Antigravity Engineering (Google DeepMind Pair Programming)  
**Target Environment:** Node.js (v22+), SQLite (v3.45+ WAL), Ollama (v0.18+), React (v18.3+), Vite (v5.4+)

---

### 1. Architectural Overview

ATLAS is built upon the robust asynchronous foundation of AGENTX and extends it into an enterprise campus assistance platform. The platform operates on a three-tier architecture:

```
[ React 18 / Vite 5.4 Client ]
              │  ▲
   HTTP / SSE │  │ Text & JSON Event Stream
              ▼  │
[ Express API Gateway (:8080) ]
   ├── Identity Gate (Fail-Closed RBAC)
   ├── Multi-Agent Orchestrator (DAG Decomposition)
   ├── Specialized Campus Agents (Academic, Campus, Event, Comm)
   ├── Hybrid LLM Provider Router (Gemini Cloud + Ollama Gemma 4 + Degraded)
   ├── RAG Knowledge Engine (Vectorless Lexical Chunking & Hashing)
   └── Consequential Action Security Executor (2-Phase Confirmation)
              │  ▲
              ▼  │
[ Persistence & Inference Layer ]
   ├── campus.db (SQLite WAL Mode: 10k Records, Benchmarks, Tickets, Events)
   ├── Ollama Local Daemon (:11434 with gemma4:e2b)
   └── Google Gemini REST API (gemini-3.5-flash-lite / gemini-3.5-flash)
```

---

### 2. Multi-Agent Orchestrator Subsystem

**Location:** `backend/atlas/orchestrator/orchestrator.js`

#### 2.1 Natural Language Decomposition & DAG Execution
The orchestrator converts freeform natural language queries into directed acyclic graph (DAG) execution plans:
1. **Intent Extraction:** Analyzes prompts for academic, facility, event, communication, and general knowledge intents using regex heuristics and token scoring.
2. **Contextual Query Expansion:** Handles follow-up conversational turns. When anaphoric or pronoun references ("What are its hours?", "Register me for it") are detected, the orchestrator inspects `recentTurn` history to expand sub-queries with the antecedent subject entity (e.g., `Central Library`).
3. **Dependency-Aware Scheduling:** Independent subtasks execute concurrently; dependent steps (e.g., checking academic eligibility before registering for a technical workshop) are sequenced in order.
4. **Resilient Aggregation:** Subtask failures do not crash the pipeline. Successful subtask outputs are aggregated into the response, while failed subtasks cleanly degrade.

---

### 3. Specialized Campus Agents

#### 3.1 Academic Agent (`backend/atlas/agents/academic.js`)
- **Capabilities:**
  - Queries student profile, cumulative GPA, semester grades, attendance percentage, backlogs, and recorded skills.
  - Generates comparative analytics against `cohort_benchmarks` (e.g., student CGPA 7.53 vs. department average 7.50).
  - RAG Integration: Queries `retriever.js` for institutional regulations (e.g., condonation policies, minimum attendance thresholds) and attaches SHA-256 chunk hash citations from `attendance.md`.
  - **Security Gate:** Enforces point-of-access isolation. A student request for a different `studentId` is rejected with `403 Forbidden`. Faculty access is restricted to students within their designated department.

#### 3.2 Campus Agent (`backend/atlas/agents/campus.js`)
- **Capabilities:**
  - Inquires about campus facilities (Central Library, Health Center, Cafeteria, Sports Complex, Computer Center).
  - Provides operating hours, locations, and access guidelines.
  - Consequential Actions: Handles maintenance ticket creation for broken infrastructure. Proposes tickets via single-use confirmation tokens.

#### 3.3 Event Agent (`backend/atlas/agents/event.js`)
- **Capabilities:**
  - Queries active and upcoming campus events (`campus_events` table).
  - Manages event registration with idempotency and duplicate registration protection (`event_registrations` unique index on `[event_id, user_id]`). Re-registration attempts return HTTP 409 `ALREADY_REGISTERED`.

#### 3.4 Communication Agent (`backend/atlas/agents/communication.js`)
- **Capabilities:**
  - Retrieves official administrative circulars, examination schedules, and campus announcements (`campus_circulars` table).
  - Supports category filtering (`academic`, `administrative`, `facility`, `event`).
  - Drafts administrative email notifications for review.

---

### 4. Data Architecture & Dataset Ingestion

**Location:** `backend/atlas/data/` & `backend/data/campus.db`

#### 4.1 Kaggle 2026 Academic Dataset Reconciliation
- **Source File:** `student_placement_prediction_dataset_2026.csv` (100,000 synthetic placement benchmark records).
- **Ingestion Pipeline:** Validates schema bounds, normalizes department branches into 6 canonical codes (`CSE`, `ECE`, `MECH`, `CIVIL`, `IT`, `EEE`), and loads 10,000 verified cohort records into normalized SQLite tables:
  - `students`: Profile and demographic metadata.
  - `academic_records`: CGPA, attendance percentage, backlogs, internships, projects, and placement status.
  - `cohort_benchmarks`: Aggregated cohort metrics (mean CGPA, placement rates, average attendance) computed during ingestion.
- **SQLite Configuration:** Initialized in Write-Ahead Logging (`PRAGMA journal_mode = WAL`) and foreign key enforcement (`PRAGMA foreign_keys = ON`).

---

### 5. AI Model Infrastructure & Fault-Tolerant Routing

**Location:** `backend/server.js`

#### 5.1 Google Gemini Cloud Inference
- **Models:** `gemini-3.5-flash-lite` (default primary), `gemini-3.5-flash` (complex reasoning).
- **Protocol:** Direct REST SSE streaming via `https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse`.
- **Hardening:**
  - Alternate-turn validation: Automatically adjusts prompt sequences to prevent consecutive model turns or requests ending on model turns (avoiding HTTP 400 `INVALID_ARGUMENT`).
  - Bounded execution timeout: 10,000ms. If cloud inference stalls or encounters network rate limits (HTTP 429), it aborts cleanly and triggers immediate local fallback.

#### 5.2 Local Ollama Inference (Gemma 4)
- **Model:** `gemma4:e2b` (4.6 GB quantized local LLM).
- **Endpoint:** `http://127.0.0.1:11434/api/chat`.
- **Performance:** Warm inference latency ~700ms; cold initialization ~17s.
- **Fail-Safe Timeout:** 12,000ms.

#### 5.3 Bounded Degraded Offline Mode
- If both cloud and local LLM endpoints are unreachable, ATLAS fails gracefully within `<10ms` by serving structured, deterministic responses extracted directly from the verified database and RAG cache.

---

### 6. Security, Identity & OAuth Hardening

#### 6.1 Domain Hardening
- Complete removal of `https://atlas.oqens.me`.
- OAuth base URL is dynamically driven by `APP_BASE` (defaulting to `http://localhost:8080`).
- Local redirect URIs:
  - `http://localhost:8080/api/oauth/google/callback`
  - `http://localhost:8080/api/oauth/gmail/callback`
  - `http://localhost:8080/api/oauth/calendar/callback`

#### 6.2 Least-Privilege OAuth Scopes
- **Google Core:** `openid email profile`
- **Gmail:** `https://www.googleapis.com/auth/gmail.modify`
- **Calendar:** `https://www.googleapis.com/auth/calendar.events`

#### 6.3 Open Redirect Defense
- Strict origin whitelist: `ALLOWED_FRONTEND_ORIGINS` (`localhost:5173`, `localhost:5174`, `127.0.0.1:5173`, `127.0.0.1:5174`). All state parameters and return URLs are validated to prevent malicious external redirection.

#### 6.4 Consequential Action Gate
- Actions with durable side effects (sending emails, scheduling calendar events, filing campus maintenance tickets) cannot be invoked directly by chat models.
- The model must propose the action, causing ATLAS to mint a cryptographically signed, unguessable confirmation intent stored in server memory.
- Execution requires an explicit user confirmation POST to `/api/atlas/actions/confirm` bearing the single-use token. Replay attempts immediately return HTTP 409 `TOKEN_ALREADY_CONSUMED`.

---

### 7. Document Generation Subsystem

**Location:** `backend/server.js` (`POST /api/docs/generate`)
- **PDF Generation (`pdfkit`):** Renders academic transcripts, attendance reports, and circular summaries with institutional headers.
- **Excel Export (`exceljs`):** Generates structured spreadsheets containing student metrics, department comparisons, and attendance summaries.
- **Word Document Export (`docx`):** Generates styled `.docx` reports formatted for institutional administrative submission.
