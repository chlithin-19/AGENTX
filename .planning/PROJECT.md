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

## Milestone Roadmap
- **Phase 01: UI Redesign & Atlas Experience** — Payrot-inspired ethereal UI, 7-destination router, ThoughtLine reasoning, and sub-views. *(Executed & Verified)*
- **Phase 02: Security, Authentication & Student Data Isolation** — Session identity context, RBAC (Student/Faculty/Admin), student-level data isolation, and protected route middleware. *(Next Active Phase)*
- **Phase 03: Multi-Agent Orchestration & Reliability** — Task timeouts, inter-agent context handoffs, partial failure recovery, and real-time per-agent SSE progress streaming.
- **Phase 04: Institutional Data Persistence & Knowledge Governance** — Durable student-isolated database layer, maintenance ticket/event persistence, and document RAG ingestion pipeline.
- **Phase 05: Frontend Live API Integration & Experience Polish** — Sub-view connection to backend endpoints, loading skeletons, error states, and direct action triggers.
- **Phase 06: Full Test Automation & Production Deployment Hardening** — Native `node:test` regression suite, health checks, Nginx reverse-proxy hardening, and deployment runbooks.
