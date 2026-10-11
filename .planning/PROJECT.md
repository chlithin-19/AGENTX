# Atlas — Campus Multi-Agent AI Application

## Project Overview
Atlas is a campus multi-agent artificial intelligence platform designed to serve higher-education institutions with complete data privacy, transparent reasoning, and grounded institutional intelligence. Built on top of the robust AGENTX runtime (Node.js/Express with local Ollama edge inference and cloud reasoning fallback), Atlas coordinates specialized campus agents (Academic, Campus Facilities, Events, and Official Communications) to deliver verifiable, hallucination-free assistance to students, faculty, and administrators.

## Core Mission
Bring Atlas from its current MVP state to a reliable, secure, fully integrated production-ready campus AI application while preserving 100% of the underlying AGENTX execution runtime, SSE streaming protocols, OAuth integrations, and background worker systems.

## Key Constraints & Architecture Invariants
- **Runtime:** Node.js/Express (`backend/server.js`) strictly preserved.
- **Protocol:** Server-Sent Events (SSE) `/api/chat` protocol preserved with non-breaking additive extensions.
- **Integrations:** Existing Google Calendar, Gmail, GitHub, LinkedIn OAuth flows and background task processing remain fully operational.
- **Orchestration:** Multi-agent coordinator (`backend/atlas/orchestrator/orchestrator.js`) orchestrates Academic, Campus, Event, and Communication agents with strict fault isolation.
- **Zero Hallucination:** Strict grounding in verified campus documents (`backend/atlas/knowledge/documents/`) with citation provenance chips.
- **Security:** Authenticated student/faculty identity context, role-based authorization (RBAC), and approval controls for side-effect operations.
- **Zero Unnecessary Packages:** Leverage native Node.js capabilities (including Node 25's native `node:test` and `node:assert`) before adding npm dependencies.

## Milestone Roadmap (8-Phase Full Product Completion)
- **Phase 1: Security and Authentication Hardening** — Audit security baseline (`71a70db`), harden cryptographic JWT validation (`alg`, `exp`, `iss`, `aud`), fail-closed production gates, point-of-access student isolation, department-scoped faculty RBAC, and replay-prevented confirmation actions. *(Active Phase)*
- **Phase 2: Dataset Discovery, Ingestion, and Data Architecture** — Ingest `archive.zip` (`student_placement_prediction_dataset_2026.csv`), validated schema, reproducible ingestion pipeline, data provenance, and strict separation between benchmark vs private student records.
- **Phase 3: Super-Agent Intelligence and Question Answering** — Intent understanding, multi-intent decomposition, evidence-grounded synthesis, tool selection, model-provider fallback, and safe handling of unsupported/ambiguous questions.
- **Phase 4: Multi-Agent Orchestration and Reliability** — Dependable task planning, typed inter-agent context handoffs, bounded execution timeouts via `AbortController`, cancellation, safe retries, partial-result recovery, and per-agent SSE progress streaming.
- **Phase 5: Institutional Knowledge and RAG** — Validated document ingestion, vector/lexical retrieval, verifiable citations, freshness tracking, and source-grounded policy/procedural answers.
- **Phase 6: Complete Campus Workflows and Integrations** — Connect Academic, Campus, Event, and Communication agents to real supported data and APIs, read/write workflows, and approval gates.
- **Phase 7: Premium Frontend and Performance** — Polish Atlas UI design system (built in Phase 01), live campus sub-views, streaming chat experience, accessibility (WCAG 2.1 AA), responsive layouts, and performance optimization.
- **Phase 8: Comprehensive Testing and Deployment Readiness** — Multi-layer test automation (regression, security, data, integration, SSE, E2E), system diagnostics, Nginx reverse-proxy hardening, and operational runbooks.
