# Atlas 8-Phase Completion Roadmap

## Strategic Execution Strategy
The full product completion initiative transitions Atlas from an in-memory campus multi-agent MVP to an enterprise-grade, secure, reliable, and data-connected institutional platform. Work is organized into eight sequential, dependency-aware phases that preserve 100% of the working AGENTX foundation (Express backend, Vite frontend, SSE chat streaming, tools, OAuth, history, and background jobs).

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 1: Security and Authentication Hardening (ACTIVE)         │
│ (Cryptographic JWT, Fail-Closed Gates, Student Isolation, RBAC) │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 2: Dataset Discovery, Ingestion, and Data Architecture    │
│ (archive.zip Ingestion, Validated Schema, Benchmark Separation) │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 3: Super-Agent Intelligence and Question Answering        │
│ (Intent Decomposition, Synthesis, Tool Selection, Safe Fallback)│
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 4: Multi-Agent Orchestration and Reliability              │
│ (Timeouts, Context Handoffs, Fault Recovery, Granular SSE)      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 5: Institutional Knowledge and RAG                        │
│ (Document Ingestion, Freshness Tracking, Grounded Citations)    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 6: Complete Campus Workflows and Integrations             │
│ (Academic, Campus, Event, Communication Live APIs & Writes)     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 7: Premium Frontend and Performance                       │
│ (Payrot UI Polish, Live Views, Streaming Chat, A11y, Metrics)   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 8: Comprehensive Testing and Deployment Readiness         │
│ (Regression Tests, SSE Verification, Nginx Config, Runbooks)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Foundation Traceability

- **Phase 01 UI Redesign Foundation (Completed & Verified in commits `c5202d3`, `96f2e59`):**
  - Ethereal Payrot-inspired design system (`App.css`).
  - Floating frosted header, mobile navigation, and 7-destination view router (`Header.jsx`, `MobileNav.jsx`, `App.jsx`).
  - Home hero, constellation SVG architecture, and interactive agent cards (`HomeView.jsx`).
  - Ask Atlas workstation with real `/api/chat` SSE streaming, ThoughtLine reasoning, and markdown rendering (`ChatArea.jsx`, `ThoughtLine.jsx`).
  - Campus sub-views layout foundation (`AcademicsView.jsx`, `CampusView.jsx`, `EventsView.jsx`, `CommunicationView.jsx`, `SettingsView.jsx`).
  - WCAG 2.1 AA accessibility and production build verification.
  - *These foundational accomplishments are fully carried forward into Phase 7 for live API wiring and polish.*

- **Security Baseline Foundation (Completed in commit `71a70db`):**
  - Core security modules created: `config.js`, `identity.js`, `authorization.js`, `confirmation.js`.
  - 21 automated tests passing via `node:test` (`backend/tests/security.test.js`).
  - Quarantined development persona simulator in `SettingsView.jsx`.
  - Stored-proposal confirmation execution lifecycle.
  - *This baseline forms the direct starting point for Phase 1 hardening.*

---

## 8-Phase Breakdown

### Phase 1 — Security and Authentication Hardening
- **Status:** ACTIVE EXECUTION.
- **Goal:** Audit the completed security baseline, close real cryptographic and parameter tampering gaps, enforce fail-closed production behavior, and verify student isolation, department-scoped faculty RBAC, and replay-prevented confirmation actions.
- **Key Deliverables:**
  - Audit and harden `verifyProductionToken`: enforce strict algorithm pinning (`alg === 'HS256'`), mandatory `exp` validation, optional issuer (`iss`) and audience (`aud`) checks, and minimum secret length enforcement.
  - Remove unsafe parameter fallback (`overrideUser` in `/api/atlas/orchestrate`).
  - Preserve fail-closed production gate (401 without verified token; 400 on dev simulation headers).
  - Enforce point-of-access student data isolation (`assertStudentAccess`) across all access paths.
  - Verify stored proposal confirmation execution with atomic replay lock.
  - Automated tests covering algorithm tampering, missing expiration, unauthorized confirmation, and spoofed headers.

### Phase 2 — Dataset Discovery, Ingestion, and Data Architecture
- **Status:** DEPENDS ON PHASE 1.
- **Goal:** Ingest the discovered Kaggle dataset archive (`archive.zip` containing `student_placement_prediction_dataset_2026.csv`), establish validated schemas, reproducible ingestion, data provenance, and strict separation between benchmark placement data and student records.
- **Key Deliverables:**
  - Automated reproducible extractor and parser for `archive.zip` (100,000 records).
  - Validated schema (departments, students, academic records, skill profiles, placement benchmarks).
  - Safe local relational/structured repository with parameterized access and indexing.
  - Clear provenance and classification tags: benchmark placement data vs private student records.
  - Point-of-access authorization integrated into repository query interfaces.
  - Automated unit and data integrity tests.

### Phase 3 — Super-Agent Intelligence and Question Answering
- **Status:** DEPENDS ON PHASE 2.
- **Goal:** Deepen intent understanding, multi-intent decomposition, tool selection, contextual conversation handling, evidence-grounded synthesis, model provider fallback, and honest handling of unsupported questions.
- **Key Deliverables:**
  - Advanced intent classifier supporting compound multi-intent campus questions.
  - Contextual conversation memory preserving user topic across turns.
  - Honest boundary handling: clearly explain missing data, unsupported operations, or insufficient privileges without fabrication.
  - Grounded synthesis referencing collected agent evidence and knowledge citations.
  - Agent test suite verifying single-intent, multi-intent, out-of-scope, and ambiguous queries.

### Phase 4 — Multi-Agent Orchestration and Reliability
- **Status:** DEPENDS ON PHASE 3.
- **Goal:** Implement dependable task planning, authorized inter-agent context handoffs, bounded timeouts, cancellation, safe retries, partial fault recovery, and real-time per-agent SSE progress streaming.
- **Key Deliverables:**
  - Task execution plan DAG with dependency-aware ordering.
  - Per-agent execution timeouts (8s) via `AbortController` to prevent hanging workflows.
  - Typed inter-agent context handoffs propagating validated session identity and findings.
  - Fine-grained per-agent SSE progress event streaming (`step` events reflecting active agent activity).
  - Partial fault recovery: deliver completed agent results when non-critical agents fail.

### Phase 5 — Institutional Knowledge and RAG
- **Status:** DEPENDS ON PHASE 4.
- **Goal:** Implement validated document ingestion, lexical/semantic retrieval, source citations, freshness tracking, and source-grounded answers for campus policies and procedures.
- **Key Deliverables:**
  - Document ingestion pipeline with content hashing, chunking, and metadata extraction.
  - Ingestion validator checking document schema, sections, and chunk integrity.
  - Citation provenance generator returning verifiable chunk IDs, titles, and sections.
  - Policy QA answering attendance condonation, library borrowing, exam regulations, and support services.

### Phase 6 — Complete Campus Workflows and Integrations
- **Status:** DEPENDS ON PHASES 2 & 5.
- **Goal:** Connect Academic, Campus, Event, and Communication agents to real supported data and APIs. Complete relevant read/write workflows and confirmation gates.
- **Key Deliverables:**
  - Academic Agent: Real queries against ingested dataset (attendance, backlogs, CGPA, skills, placement).
  - Campus Agent: Facilities directory, operating hours, and durable maintenance ticketing.
  - Event Agent: Campus events calendar, registration, and AGENTX Google Calendar action wiring.
  - Communication Agent: Circulars search and draft broadcast approvals.
  - Consequential writes gated by the cryptographic confirmation lifecycle.

### Phase 7 — Premium Frontend and Performance
- **Status:** DEPENDS ON PHASE 6.
- **Goal:** Polish the existing Atlas Ethereal Editorial Tech UI, wire live data into campus sub-views, enhance the streaming chat experience, and optimize performance.
- **Key Deliverables:**
  - Connect `AcademicsView`, `CampusView`, `EventsView`, `CommunicationView` to live backend APIs.
  - Add polished loading skeletons, empty states, error retry banners, and degraded-mode notices.
  - Wire action confirmation modals in the frontend executing stored server proposals.
  - Performance optimization (sub-100ms UI interactions, optimized asset bundle, smooth streaming).
  - Maintain WCAG 2.1 AA accessibility and responsive layout across desktop, tablet, and mobile.

### Phase 8 — Comprehensive Testing and Deployment Readiness
- **Status:** COMPLETED & VERIFIED (Milestone 1).
- **Goal:** Build comprehensive multi-layer automated tests, optimize based on measurements, verify deployment configuration, and document operations.
- **Key Deliverables:**
  - Complete regression suite covering unit, integration, authorization, SSE streaming, and concurrency (91/91 tests passing).
  - Production build verified with Vite 5.4.
  - Production Nginx configuration with unbuffered SSE (`proxy_buffering off;`).
  - Baseline production deployment runbook in `DEPLOYMENT.md`.

---

## Milestone 2: Verified Production Deployment Readiness Initiative

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 09: Priority A — Reliable AI Inference & Provider Routing │
│ (Native GenAI SSE Stream, Model Fallbacks, Zero Network Stalls) │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 10: Priority B — Complete Data & Agent Functionality      │
│ (SQLite Provenance, Kaggle Separation, RAG Citations, 4 Agents) │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 11: Priority C — Production-Grade Identity & Security     │
│ (Fail-Closed Token Gate, IdP Spec, Student Isolation, RBAC)     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 12: Priority D — Reliability, Performance & UX            │
│ (Live Views Audit, Sub-100ms UI, TTFT Measurements, WAL Safety) │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 13: Priority E — Operational Readiness & Final Acceptance │
│ (Hot WAL Backups, Nginx SSE Rules, Disaster Runbook, Full Matrix│
└─────────────────────────────────────────────────────────────────┘
```

### Phase 09 — Priority A: Reliable AI Inference & Provider Routing
- **Status:** ACTIVE EXECUTION.
- **Goal:** Establish robust, verified AI model connectivity. Migrate from the stalling OpenAI-compatible endpoint to native Google GenAI REST SSE streaming (`gemini-3.5-flash` with fallback to `gemini-3.5-flash-lite`). Maintain clean degraded local responses without timeout hangs when offline.
- **Key Deliverables:**
  - Update `streamLLM` and `reason` in `backend/server.js` to use verified native REST endpoints with SSE streaming.
  - Model reachability diagnostics and graceful fallback between cloud providers and local offline mode.
  - Test general-purpose reasoning requests and campus queries via `/api/chat` with measured latency.
  - Automated tests covering stream chunking, timeouts, provider failures, and degraded mode.

### Phase 10 — Priority B: Complete Data & Agent Functionality
- **Status:** DEPENDS ON PHASE 09.
- **Goal:** Verify Academic, Campus, Event, and Communication agents across live API routes and SQLite database. Ensure strict provenance separation between Kaggle benchmark data and official student records.
- **Key Deliverables:**
  - Verify all 4 specialized agents with real requests and parameterized SQLite queries.
  - Verify maintenance work orders durability in `maintenance_tickets` table.
  - Verify event registration durability and duplicate rejection in `event_registrations` table.
  - Verify RAG knowledge catalog SHA-256 chunk fingerprinting and authoritative citation emission.
  - Verify authorization gating for all consequential actions.

### Phase 11 — Priority C: Production-Grade Identity and Security
- **Status:** DEPENDS ON PHASE 10.
- **Goal:** Document and harden production identity integration. Specify exact OIDC/SAML token claims structure and verification. Enforce student-level isolation, faculty department RBAC, and single-use confirmation token locks.
- **Key Deliverables:**
  - Formal institutional IdP integration specification in `DEPLOYMENT.md`.
  - Fail-closed production gate verification (HTTP 401 without verified token; HTTP 400 on spoofed persona headers).
  - Student data isolation tests ensuring cross-student queries return 403.
  - Department-scoped faculty RBAC tests.
  - Two-phase confirmation protocol verification with atomic consumption and replay prevention.

### Phase 12 — Priority D: Reliability, Performance, and User Experience
- **Status:** DEPENDS ON PHASE 11.
- **Goal:** Verify every frontend view against live backend APIs. Test loading states, empty states, error banners, and degraded-mode notices. Measure representative latencies and ensure SQLite WAL concurrency under load.
- **Key Deliverables:**
  - End-to-end verification of `AcademicsView`, `CampusView`, `EventsView`, `CommunicationView`, and `SettingsView`.
  - Zero UI freezing or hanging states on network errors or slow responses.
  - Streaming SSE latency and time-to-first-token (TTFT) benchmarking.
  - SQLite WAL mode concurrency and non-blocking read verification.

### Phase 13 — Priority E: Deployment, Operational Runbooks & Acceptance
- **Status:** DEPENDS ON ALL PRECEDING PHASES.
- **Goal:** Validate environment variable enforcement, Nginx reverse-proxy unbuffered SSE configuration, automated SQLite hot backups (`VACUUM INTO`), disaster recovery procedures, and final acceptance criteria.
- **Key Deliverables:**
  - Startup security configuration validation test (`validateSecurityConfig()`).
  - Automated test verifying live hot backup creation via SQLite `VACUUM INTO`.
  - Comprehensive operations runbook in `DEPLOYMENT.md`.
  - Complete regression test suite execution (100% passing) and final acceptance report.

