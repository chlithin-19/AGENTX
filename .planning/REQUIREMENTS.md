# Atlas Requirements & Gap Matrix (8-Phase Full Product Completion)

## Traceable Requirements Matrix

### A. Security and Authentication (Phase 1)
| ID | Requirement | Baseline State (`71a70db`) | Target State | Phase 1 Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-SEC-01** | Trusted Identity & Production Fail-Closed Gate | HMAC-SHA256 token verifier in `identity.js`; fails closed on dev headers in production. | Strict algorithm pinning (`alg === 'HS256'`), mandatory `exp`, optional `iss`/`aud`, minimum secret length (>= 32 chars). Rejects client dev simulation headers with 400; fails closed with 401 when unverified. | Audited & hardened in Phase 1. |
| **REQ-SEC-02** | Department-Scoped Faculty RBAC | `assertStudentAccess` checks `reqUser.department === targetStudent.branch`. | Strict department boundary enforcement (e.g. CSE faculty strictly cannot access IT students). Admin has institutional audit access. | Hardened & verified in Phase 1. |
| **REQ-SEC-03** | Point-of-Access Student Isolation | `assertStudentAccess` checks self-only access (`targetStudent.student_id === reqUser.studentId`). | Rejects cross-student access with HTTP 403 Forbidden (`FORBIDDEN_STUDENT_ISOLATION`) without leaking private data. | Hardened & verified in Phase 1. |
| **REQ-SEC-04** | Cryptographic Confirmation Lifecycle | 32-byte hex token binding `userId`, `actionType`, proposal hash, 5m TTL. | Executes **stored server proposal**, ignoring client execution arguments; atomic replay lock preventing concurrent races; handles expired tokens and user mismatches safely. | Hardened & verified in Phase 1. |
| **REQ-SEC-05** | Quarantined Dev Persona Simulator | `SettingsView.jsx` simulator card conditionally rendered under `import.meta.env.DEV`. | Strictly dead-code eliminated in Vite production bundles; warning banner present. | Verified in Phase 1. |
| **REQ-SEC-06** | Orchestrator Identity Invariance | `/api/atlas/orchestrate` accepts body `user`. | Remove any unauthenticated body override; enforce `req.user` from identity middleware. | Hardened in Phase 1. |

---

### B. Dataset Discovery, Ingestion, and Data Architecture (Phase 2)
| ID | Requirement | Current State | Target State | Phase 2 Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-DATA-01** | Kaggle Dataset Ingestion | `archive.zip` present in root (contains 100,000 rows CSV). | Automated, reproducible, validated ingestion pipeline for `student_placement_prediction_dataset_2026.csv`. | Planned in Phase 2. |
| **REQ-DATA-02** | Data Classification & Separation | Demo profiles extracted in `demoStudents.js`. | Clear architectural separation between benchmark placement data and private student records; data provenance preserved. | Planned in Phase 2. |
| **REQ-DATA-03** | Structured Relational Repository | 5 in-memory records in `demoStudents.js`. | SQLite/structured store with indexed queries (`student_id`, `branch`), parameterized queries, and point-of-access authorization checks. | Planned in Phase 2. |
| **REQ-DATA-04** | Data Validation & Health | Unverified manual extractions. | Automated integrity checks (ranges, null checks, unique constraints, type casting). | Planned in Phase 2. |

---

### C. Super-Agent Intelligence and Question Answering (Phase 3)
| ID | Requirement | Current State | Target State | Phase 3 Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-INT-01** | Multi-Intent Query Decomposition | Regex-based detection in `routeQuery`. | Hybrid intent parsing with support for multi-intent questions ("Check my attendance and library hours"). | Planned in Phase 3. |
| **REQ-INT-02** | Evidence-Grounded Synthesis | Template string concatenations. | Cohesive response synthesis cross-referencing agent findings and verified citations. | Planned in Phase 3. |
| **REQ-INT-03** | Contextual Conversation Handling | Stateless single-turn orchestrator. | Multi-turn contextual continuity for follow-up questions while isolating user identity. | Planned in Phase 3. |
| **REQ-INT-04** | Honest Limitation Handling | Generic fallback text. | Clear, honest explanations for unsupported queries, missing records, or denied permissions without hallucinations. | Planned in Phase 3. |

---

### D. Multi-Agent Orchestration and Reliability (Phase 4)
| ID | Requirement | Current State | Target State | Phase 4 Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-OR-01** | Task Execution Timeouts | Unbounded synchronous calls. | 8-second execution timeout per agent using `AbortController` preventing orchestrator hangs. | Planned in Phase 4. |
| **REQ-OR-02** | Inter-Agent Context Handoff | Agents receive isolated queries. | Typed context pipeline allowing downstream agents to consume upstream agent outputs. | Planned in Phase 4. |
| **REQ-OR-03** | Granular SSE Progress Streaming | Single initial step sent over SSE. | Granular per-agent SSE progress events (`agent_start`, `agent_step`, `agent_done`) streamed in real time. | Planned in Phase 4. |
| **REQ-OR-04** | Partial Fault Recovery | Try/catch per agent. | Structured degraded execution returning completed agent findings with warning for failed non-critical agents. | Planned in Phase 4. |

---

### E. Institutional Knowledge and RAG (Phase 5)
| ID | Requirement | Current State | Target State | Phase 5 Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-RAG-01** | Document Ingestion & Validation | 5 markdown documents read directly. | Ingestion pipeline with content hashing, chunking, and metadata validation. | Planned in Phase 5. |
| **REQ-RAG-02** | Citation Provenance | Basic chunk tags. | Verifiable citation provenance with chunk ID, document title, section heading, and freshness timestamp. | Planned in Phase 5. |
| **REQ-RAG-03** | Grounded Policy Question Answering | Basic lexical matching. | Precision retrieval for attendance condonation, library borrowing rules, exam schedules, and services. | Planned in Phase 5. |

---

### F. Complete Campus Workflows and Integrations (Phase 6)
| ID | Requirement | Current State | Target State | Phase 6 Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-WF-01** | Academic Agent Live Workflows | Queries in-memory demo data. | Real queries against ingested dataset (attendance, backlogs, CGPA, skills, placement). | Planned in Phase 6. |
| **REQ-WF-02** | Campus Facilities & Ticketing | In-memory maintenance tickets. | Durable ticketing workflow with status tracking, room directory, and confirmation gates. | Planned in Phase 6. |
| **REQ-WF-03** | Events & Calendar Integration | Static events array. | Live campus events search and direct "Add to Google Calendar" action via existing AGENTX tool integration. | Planned in Phase 6. |
| **REQ-WF-04** | Official Communications Workflow | In-memory circulars. | Search official circulars and draft formal campus broadcast with multi-step confirmation. | Planned in Phase 6. |

---

### G. Premium Frontend and Performance (Phase 7)
| ID | Requirement | Current State | Target State | Phase 7 Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-FE-01** | Ethereal Atlas UI & Design System | Implemented in Phase 01 (`App.css`). | Polished tokens, glassmorphism, responsive navigation across all viewports. | Baseline verified; polish in Phase 7. |
| **REQ-FE-02** | Live Campus Sub-Views | Static demo arrays rendered. | Wire `AcademicsView`, `CampusView`, `EventsView`, `CommunicationView` to live backend APIs with loading skeletons and error retry. | Planned in Phase 7. |
| **REQ-FE-03** | Chat Workstation & ThoughtLine | Working SSE streaming in `ChatArea.jsx`. | Real-time multi-agent step indicators, action confirmation modals, and markdown tables. | Planned in Phase 7. |
| **REQ-FE-04** | Accessibility & Performance | WCAG 2.1 AA compliant. | Audited keyboard navigation, color contrast, and sub-100ms UI interaction latencies. | Planned in Phase 7. |

---

### H. Comprehensive Testing and Deployment Readiness (Phase 8)
| ID | Requirement | Current State | Target State | Phase 8 Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-TEST-01** | Multi-Layer Regression Suite | 21 security tests. | Comprehensive unit, integration, authorization, SSE streaming, and concurrency test suites. | Planned in Phase 8. |
| **REQ-TEST-02** | Performance & Latency Benchmarks | Unmeasured. | Benchmarked latency, time-to-first-token, dataset query times, and memory footprint. | Planned in Phase 8. |
| **REQ-TEST-03** | Production Deployment & Nginx | Draft configs. | Hardened Nginx configuration (`proxy_buffering off`), SSL setup, and complete operational runbook. | Planned in Phase 8. |
