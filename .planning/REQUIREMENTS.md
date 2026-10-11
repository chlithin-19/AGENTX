# Atlas Requirements & Gap Matrix

## Traceable Requirements Matrix

### A. Frontend and Experience
| ID | Requirement | Current State | Target State | Gap / Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-FE-01** | Payrot-inspired Atlas UI Design System | Complete in Phase 01: CSS tokens, Inter font, glassmorphism, responsive navigation. | Fully maintained across all viewports. | Verified Pass ✓ (Plan 01-01, 01-02). |
| **REQ-FE-02** | 7-Destination View Router | Implemented in `App.jsx` (`home`, `chat`, `academics`, `campus`, `events`, `communication`, `settings`). | Clean URL sync, back/forward history handling. | Verified Pass ✓ (Plan 01-02). |
| **REQ-FE-03** | Chat Workstation & SSE Streaming | Light editorial UI in `ChatArea.jsx`, `ThoughtLine.jsx` reasoning indicators, real SSE streaming. | Real-time multi-agent step progress and token rendering. | Verified Pass ✓ (Plan 01-04). |
| **REQ-FE-04** | Campus Sub-Views Backend Integration | `AcademicsView`, `CampusView`, `EventsView`, `CommunicationView` display static demo arrays. | Fetch live records from `/api/atlas/*` and `/api/academics/*`. | Phase 05 will connect sub-views to live backend endpoints with loading skeletons and error recovery. |
| **REQ-FE-05** | Empty States & Error Recovery | Basic fallback text in views. | Structured empty state graphics, retry buttons, and degraded-mode banners. | Planned in Phase 05. |
| **REQ-FE-06** | Profile & Session Switcher | Settings embeds Integrations without active student identity switcher. | Add Student/Faculty session toggle in Settings for multi-persona verification. | Planned in Phase 02/05. |

---

### B. Multi-Agent Orchestration
| ID | Requirement | Current State | Target State | Gap / Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-OR-01** | Multi-Intent Query Decomposition | Implemented in `orchestrator.js` using regex domain detectors (`routeQuery`). | Decomposes single- and multi-intent inquiries into ordered execution DAG. | Verified functional. Phase 03 will add ambiguity scoring and LLM fallback intent parsing. |
| **REQ-OR-02** | Safe Fault Isolation | `try/catch` per agent execution prevents cascading crashes. | Partial execution returns completed agent data with degraded warning for failed agents. | Verified functional. |
| **REQ-OR-03** | Task Execution Timeouts | Agents execute synchronously without timeout limits. | Enforce 8-second execution timeout per agent using `AbortController`. | Planned in Phase 03. |
| **REQ-OR-04** | Inter-Agent Context Handoff | Agents receive raw initial query; no output sharing. | Typed context pipeline allows downstream agents to consume upstream agent outputs. | Planned in Phase 03. |
| **REQ-OR-05** | Granular SSE Step Streaming | Streams single initial step `"Routing to Atlas Campus Multi-Agent System"`. | Stream per-agent execution steps (e.g. `"Academic Agent inspecting attendance"`, `"Campus Agent querying Lab 204"`). | Planned in Phase 03. |
| **REQ-OR-06** | Grounded Response Synthesis | Merges agent text summaries and appends citations from knowledge retriever. | Response synthesis strictly cross-references verified citations and prevents hallucinations. | Verified functional. Planned enhancements in Phase 03. |

---

### C. Data and Knowledge
| ID | Requirement | Current State | Target State | Gap / Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-DATA-01** | Student Record Persistence | 5 in-memory demo profiles in `demoStudents.js`. | Persistent relational/document store scoped per student with attendance, CGPA, and skills. | Planned in Phase 04: durable store with student isolation. |
| **REQ-DATA-02** | Kaggle Dataset Classification | Labeled as `DEMO DATA · STUDENT PLACEMENT BENCHMARK`. | Kept as development benchmark data; isolated from real student records. | Enforced in code and UI labels. |
| **REQ-DATA-03** | Maintenance Ticketing Store | Mutates in-memory array `DEMO_MAINTENANCE_TICKETS`. | Persists tickets with UUID, status tracking, location, and reporter ID. | Planned in Phase 04. |
| **REQ-DATA-04** | Institutional Document RAG | 5 markdown documents scored via in-memory TF retriever (`retriever.js`). | Document ingestion CLI with chunk hashing, freshness timestamps, and section citations. | Planned in Phase 04. |
| **REQ-DATA-05** | Citation Provenance | Returns `[Doc: title #Section] (chunkId)`. | Verifiable citation chips rendered in UI with document preview modal. | Grounding verified; UI chips refined in Phase 04/05. |

---

### D. Security and Identity
| ID | Requirement | Current State | Target State | Gap / Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-SEC-01** | Trusted Identity & Production Gate | Hardcoded `Alex Kumar (ID: 1)` in `server.js`. | Server-validated token/session in production; fail-closed gate rejecting client headers; quarantined dev simulation. | Critical Gap. Addressed in Phase 02 (Plan 02-01). |
| **REQ-SEC-02** | Department-Scoped RBAC | No role enforcement. | Roles: `student` (self-only), `faculty` (department-scoped only, e.g. CSE faculty only accesses CSE students), `admin` (institutional audit). | Critical Gap. Addressed in Phase 02 (Plan 02-01). |
| **REQ-SEC-03** | Point-of-Access Student Isolation | Any query can access any student in memory. | `assertStudentAccess` gate at repository access point. Cross-student or cross-department access returns 403 without data leakage. | Critical Gap. Addressed in Phase 02 (Plan 02-01). |
| **REQ-SEC-04** | Cryptographic Confirmation Lifecycle | `requiresConfirmation: true` returned without token. | Server-validated token binding `userId`, `actionType`, SHA-256 payload hash, 5m TTL, and single-use replay prevention. | Critical Gap. Addressed in Phase 02 (Plan 02-01). |
| **REQ-SEC-05** | Dev Simulator Environment Guard | No frontend persona switcher. | Dev simulator card in Settings with prominent testing banner; strictly omitted/disabled in production environments. | Critical Gap. Addressed in Phase 02 (Plan 02-01). |

---

### E. Campus Workflows
| ID | Requirement | Current State | Target State | Gap / Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-WF-01** | Academic Agent | Handles attendance audits, backlogs risk, CGPA, skills, placement packages. | Supports student academic standing and personalized recovery recommendations. | Functional in MVP. Deepen policy citations in Phase 03/04. |
| **REQ-WF-02** | Campus Facilities Agent | Facilities hours, room directory, maintenance issue filing. | Interactive ticket creation with status check and location navigation. | Functional in MVP. Connect live persistence in Phase 04. |
| **REQ-WF-03** | Event Agent | Hackathon 2026, GenAI workshop, placement fair schedules. | One-click "Add to Google Calendar" action integration via existing AGENTX tools. | Functional in MVP. Wire action chip in Phase 03/05. |
| **REQ-WF-04** | Communication Agent | Circulars feed (#104, #98, #22), formal email drafting. | Draft campus message with recipient approval and verified circular search. | Functional in MVP. Complete approval flow in Phase 03. |

---

### F. Reliability and Deployment
| ID | Requirement | Current State | Target State | Gap / Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-REL-01** | Automated Unit Tests | 0 automated unit tests. | Native `node:test` suite covering agents, retriever, orchestrator, and security. | Critical Gap. Planned in Phase 06. |
| **REQ-REL-02** | Integration Tests | 0 automated integration tests. | Tests for `/api/chat` SSE, `/api/atlas/orchestrate`, `/api/atlas/status`. | Critical Gap. Planned in Phase 06. |
| **REQ-REL-03** | Regression Testing | Manual tests only. | Regression test suite covering AGENTX tools (Calendar, Gmail, Background jobs, History). | Planned in Phase 06. |
| **REQ-REL-04** | Structured Logging | Basic `console.log`. | Structured JSON logging with request IDs, workflow IDs, execution latencies, and error codes. | Planned in Phase 06. |
| **REQ-REL-05** | Production Nginx & VM Runbook | `atlas-nginx.conf` and `setup_vm.sh` exist. | Validated reverse-proxy routing for `/api/atlas`, WebSocket/SSE buffering disabled, SSL runbook. | Planned in Phase 06. |
