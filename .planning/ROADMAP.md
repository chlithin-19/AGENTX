# Atlas Completion Roadmap

## Strategic Execution Strategy
The full product completion initiative transitions Atlas from an in-memory campus multi-agent MVP to an enterprise-grade, secure, and reliable institutional platform. Work is partitioned into six dependency-aware phases that preserve 100% of the working AGENTX foundation.

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 01: UI Redesign & Atlas Experience (EXECUTED/VERIFIED)│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 02: Security, Authentication & Student Data Isolation │
│ (Auth Middleware, Session Context, RBAC, Cross-Tenant Guard)│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 03: Multi-Agent Orchestration & Reliability           │
│ (Timeouts, Handoffs, Fault Recovery, Granular SSE Progress) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 04: Institutional Data Persistence & Knowledge Engine │
│ (Durable Storage, Maintenance/Event Records, Document RAG)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 05: Frontend Live API Integration & Experience Polish │
│ (Sub-Views to Live APIs, Skeletons, Error Recovery, Actions)│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 06: Test Automation, Diagnostics & Deployment Hardening│
│ (Native node:test Suite, Health Checks, Nginx, Runbook)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase Breakdown

### Phase 01: UI Redesign & Atlas Experience
- **Status:** EXECUTED & COMMITTED (`c5202d3`, `96f2e59`).
- **Goal:** Transform single-page legacy dark AGENTX UI into the modern, ethereal, Payrot-inspired Atlas Campus Multi-Agent AI web application.
- **Plans:**
  - `01-01`: Design Tokens, Typography, Atmospheric Lighting (`App.css`).
  - `01-02`: Floating Frosted Header, Mobile Nav, 7-Destination Router (`Header.jsx`, `MobileNav.jsx`, `App.jsx`).
  - `01-03`: Payrot-Inspired Home Hero, Constellation SVG & Notched Architecture (`HomeView.jsx`).
  - `01-04`: Ask Atlas Chat Workstation, Real SSE Streaming & ThoughtLine Integration (`ChatArea.jsx`, `ThoughtLine.jsx`).
  - `01-05`: 5 Campus Sub-Views & Settings Integration (`AcademicsView.jsx`, `CampusView.jsx`, `EventsView.jsx`, `CommunicationView.jsx`, `SettingsView.jsx`).
  - `01-06`: Responsive Polish, WCAG 2.1 AA Accessibility & End-to-End Build Verification.

### Phase 02: Security, Authentication & Student Data Isolation
- **Status:** READY FOR PLANNING & EXECUTION (Next Active Phase).
- **Goal:** Close critical security and privacy deficits before real student data is exposed. Implement authentication middleware, session identity context, student-level data isolation, role-based authorization (Student vs Faculty vs Admin), and protected route guards.
- **Key Deliverables:**
  - `backend/atlas/security/config.js` and `identity.js`: Server-validated identity in production mode; fail-closed gate rejecting spoofed headers; isolated development simulation mode (`X-Atlas-Auth-Mode: development-simulation`).
  - `backend/atlas/security/authorization.js`: Point-of-access student isolation gate (`assertStudentAccess`) and department-scoped faculty RBAC (CSE faculty only accesses CSE students).
  - `backend/atlas/security/confirmation.js`: Cryptographic action confirmation lifecycle with SHA-256 payload hashing, 5m TTL, and single-use replay prevention for consequential operations.
  - Integration into `server.js`, `orchestrator.js`, and agents, replacing hardcoded Alex Kumar with dynamic `req.user`.
  - Frontend development persona simulator in `SettingsView.jsx`, strictly disabled and omitted in production.
  - Automated Node 25 native test suite (`backend/tests/security.test.js`) verifying all security and authorization invariants.

### Phase 03: Multi-Agent Orchestration & Reliability Hardening
- **Status:** DEPENDS ON PHASE 02.
- **Goal:** Harden the Atlas multi-agent orchestrator and agents for production reliability, transparent progress, and partial fault recovery.
- **Key Deliverables:**
  - Enforce per-agent execution timeouts (8s) using `AbortController` to prevent hanging workflows.
  - Implement typed inter-agent context handoffs allowing downstream agents to consume upstream findings.
  - Stream granular per-agent progress events over SSE (`data: {"step": "Academic Agent checking attendance profile..."}`).
  - Structured error isolation returning completed agent findings even when an individual agent experiences a failure.
  - Multi-intent execution tracing with elapsed milliseconds, intent confidence scores, and citation provenance.

### Phase 04: Institutional Data Persistence & Knowledge Governance
- **Status:** DEPENDS ON PHASES 02 & 03.
- **Goal:** Transition from transient in-memory demo data to a durable, student-isolated persistence layer and formalize the document ingestion & verification pipeline.
- **Key Deliverables:**
  - Durable persistence for maintenance tickets, event registrations, and campus communications.
  - Formal student repository layer respecting student isolation (`where student_id = ?`).
  - Document ingestion and validation CLI verifying markdown files in `backend/atlas/knowledge/documents/`.
  - Content hashing, chunk-level provenance, and automated citation link generation.
  - Clear governance policy isolating Kaggle benchmark data from authoritative institutional records.

### Phase 05: Frontend Live API Integration & Experience Polish
- **Status:** DEPENDS ON PHASES 02, 03 & 04.
- **Goal:** Wire the static sub-views in the frontend to live backend APIs with real loading skeletons, error recovery, empty states, and direct action triggers.
- **Key Deliverables:**
  - Connect `AcademicsView` to `/api/atlas/academics` with live data fetch and loading skeletons.
  - Connect `CampusView` to `/api/atlas/facilities` and maintenance ticket submission API.
  - Connect `EventsView` to live events API with "Add to Calendar" direct action trigger.
  - Connect `CommunicationView` to live circulars API with priority filters.
  - Add persona switcher in `SettingsView` (switch between Alex Kumar, Priya Sharma, Sneha Reddy) for easy testing and role validation.

### Phase 06: Test Automation, Diagnostics & Deployment Hardening
- **Status:** DEPENDS ON ALL PRECEDING PHASES.
- **Goal:** Establish a complete regression test suite using native Node.js capabilities and harden Atlas for production Azure VM deployment.
- **Key Deliverables:**
  - Automated unit test suite using Node 25's built-in `node:test` and `node:assert` (testing agents, retriever, orchestrator, auth guards).
  - Automated integration tests for `/api/chat` SSE streaming and `/api/atlas/orchestrate`.
  - Health check endpoint `/api/health` and `/api/atlas/status` diagnostic validations.
  - Nginx reverse-proxy configuration (`atlas-nginx.conf`) validation with disabled SSE buffering (`proxy_buffering off;`).
  - Complete production deployment runbook and environment checklist.
