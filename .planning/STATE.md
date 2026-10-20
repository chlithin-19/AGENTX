# Atlas Project State

**Active Milestone:** Milestone 2 — Verified Production Deployment Readiness Initiative  
**Current Phase:** Phase 09: Priority A — Reliable AI Inference & Provider Routing  
**Phase Status:** ACTIVE EXECUTION  
**Completed Milestones:** Milestone 1 (Phases 1-8 verified, commits `c5202d3`..`f86fd16`, reality check audit `4c132a3`)  

## Milestone 2 Dashboard (Production Readiness Priorities A–E)
- [x] **Phase 09: Priority A — Reliable AI Inference & Provider Routing** — 1/1 Plan Executed & Verified (100%)
- [ ] **Phase 10: Priority B — Complete Data & Agent Functionality** (NEXT)
- [ ] **Phase 11: Priority C — Production-Grade Identity and Security** (Pending Phase 10)
- [ ] **Phase 12: Priority D — Reliability, Performance, and User Experience** (Pending Phase 11)
- [ ] **Phase 13: Priority E — Deployment and Operational Readiness** (Pending Phase 12)

## Reality Check & Baseline Audit Findings (Phase 0)
- **Baseline Git HEAD:** `c40200c` (91/91 baseline tests passing; frontend built in 5.22s).
- **Phase 09 Inference Fix Verified:**
  - Migrated `server.js` from stalling OpenAI endpoint to native Google GenAI REST SSE (`gemini-3.5-flash-lite`, `gemini-3.5-flash`).
  - General chat streaming verified live: TTFT **1,471 ms** (zero stalls).
  - Immediate local offline degraded mode verified if cloud & local providers are unavailable.
  - Automated test suite `reliable_inference.test.js` added (7 new tests).
- **Core Server Route Status:** All `/api/atlas/*`, `/api/health`, and `/api/actions/confirm` operational.
- **Remaining Production Gate:** Institutional IdP provisioning required for live token issuance.

## Key Metrics & Service Status
- **Backend Service:** Running (`http://localhost:8080`, `atlas-backend`)
- **Frontend Dev Server:** Running (`http://localhost:5173`, Vite)
- **Production Build:** Passing cleanly (`npm --prefix frontend/frontend run build` in 5.22s)
- **Test Suite:** 98 tests passing across 41 suites via `npm --prefix backend test` (100% pass rate in ~955ms)
- **Database Engine:** Native `node:sqlite` in WAL mode (`backend/data/campus.db`) with 10,000 verified student records and 6 cohort benchmarks

## Active Directives & Principles
- **Fail-Closed Production:** Development simulation disabled in production; genuine verified token or 401.
- **Strict Data Isolation:** Point-of-access student checks; department-scoped faculty RBAC.
- **Data Provenance:** Kaggle benchmark data strictly separated from student records; real dataset ingested from `archive.zip`.
- **Zero NPM Dependencies:** Native Node.js `node:sqlite`, `node:crypto`, and `node:test` used across all core modules.
