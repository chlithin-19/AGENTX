# AGENTX → ATLAS Architecture

**Status:** Architecture baseline / implementation contract  
**Purpose:** Define how the existing AGENTX runtime should evolve into the Atlas campus multi-agent application described in the project PPT.

---

## 1. Executive Summary

The existing AGENTX repository is a general-purpose autonomous assistant runtime. The inspected repository already provides a React/Vite UI, Node.js/Express backend, SSE chat/streaming, local Ollama inference, cloud reasoning/model integrations, memory/history, tasks/background jobs, tool execution, OAuth integrations, Gmail/Calendar capabilities, and document-generation/action workflows.

The Atlas PPT describes a campus-focused multi-agent system in which an Orchestrator understands a campus request, decomposes it into tasks, delegates to specialized agents, retrieves campus knowledge/data, coordinates tools, verifies results, and returns or executes an actionable result.

### Core architectural decision

> **Reuse AGENTX as the execution/runtime foundation. Build the Atlas campus intelligence layer on top of it. Do not rewrite the AGENTX runtime merely to match the PPT's illustrative technology stack.**

Separate the system into:

1. **AGENTX Runtime** — LLM execution, streaming, tools, integrations, memory, jobs.
2. **Atlas Campus Intelligence** — orchestration, specialized agents, campus knowledge, campus data, verification, workflows.
3. **Atlas Application** — authentication, roles, UI, APIs, institutional service workflows.

---

# 2. Source-of-Truth Rules

The PPT is the functional/reference architecture. The GitHub repository is the implementation source of truth for what currently exists.

Never assume a PPT component is already implemented.

Classify every component as:

- `IMPLEMENTED`
- `PARTIAL`
- `PLANNED`
- `MISSING`
- `BLOCKED`
- `DEPRECATED`

The PPT's technology diagram is a target/reference, not a reason to replace working AGENTX components.

---

# 3. Current AGENTX Architecture

```text
                 React / Vite UI
                       │
                       ▼
                Node.js / Express
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Chat/SSE      Tasks       Integrations
          │            │            │
          ▼            ▼            ▼
     Atlas runtime   Jobs       OAuth / APIs
          │
     ┌────┴─────────────┐
     ▼                  ▼
 Local Ollama      Cloud reasoning
     │                  │
     └────────┬─────────┘
              ▼
        Tool / action layer
              │
       ┌──────┼─────────┐
       ▼      ▼         ▼
     Gmail Calendar    Web/API
              │
              ▼
       Persistent JSON store
```

### Confirmed runtime characteristics

- Node.js + Express backend.
- React/Vite frontend.
- SSE-based chat/streaming.
- Local Ollama model execution with cloud reasoning support/fallback.
- Persistent JSON runtime store containing memory/history/tasks/logs/integrations and related state.
- Tool layer for read and side-effect operations.
- OAuth/integration infrastructure.
- Gmail and Calendar functionality.
- Background tasks/jobs.
- Action approval/confirmation flows.
- Document-generation utilities.

The current backend is **not** the PPT's Python/FastAPI/LangGraph/PostgreSQL/LanceDB implementation. Those are target/reference components in the PPT, not evidence that they exist in the repository.

---

# 4. Canonical Atlas Target Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                    ATLAS APPLICATION                     │
│             Student / Faculty / Admin UI                 │
└──────────────────────────────┬───────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────┐
│                  APPLICATION API LAYER                   │
│ Authentication / Authorization / Validation / Sessions   │
└──────────────────────────────┬───────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────┐
│                ATLAS CAMPUS ORCHESTRATOR                │
│ Intent → Plan → Route → Execute → Verify → Respond      │
│ Structured workflow/task state                           │
└───────────────┬──────────────┬──────────────┬────────────┘
                │              │              │
                ▼              ▼              ▼
        ┌────────────┐ ┌────────────┐ ┌───────────────┐
        │  Academic  │ │   Campus   │ │ Communication │
        │   Agent    │ │   Agent    │ │     Agent     │
        └──────┬─────┘ └──────┬─────┘ └───────┬───────┘
               │              │               │
               └──────────────┼───────────────┘
                              ▼
                       ┌────────────┐
                       │ Event Agent│
                       └─────┬──────┘
                             │
                 ┌───────────┴───────────┐
                 ▼                       ▼
        Campus Knowledge            Campus Tools
             / RAG                  and Services
                 │                       │
                 ▼                       ▼
        Vector Store / RAG       PostgreSQL / APIs
                 │                       │
                 └───────────┬───────────┘
                             ▼
                    Verification Layer
                             │
                             ▼
                    AGENTX Runtime
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
        LLMs              Tools             Jobs
```

### Canonical responsibilities

**Orchestrator:** intent, planning, routing, dependency management, state, intermediate-result exchange, verification, final response, action approval.

**Academic Agent:** attendance, subjects, timetable, academic calendar, course information, academic analysis.

**Campus Agent:** buildings, rooms, labs, facilities, campus services, maintenance/service requests.

**Communication Agent:** student helpdesk, notifications, institutional communications, email/message workflows.

**Event Agent:** event planning, venue/capacity, availability, resources, budget estimation, event requests.

**Knowledge/RAG:** campus documents, policies, handbooks, notices, procedures, FAQs, semantic retrieval, source references.

---

# 5. Agent Boundary Decision

The PPT uses slightly different names in its ecosystem table, architecture diagram, and live demo. Use this canonical implementation:

```text
Orchestrator
 ├── Academic Agent
 ├── Campus Agent
 ├── Communication Agent
 └── Event Agent
```

Supporting capabilities are not automatically separate agents:

```text
Intent understanding  → Orchestrator capability
Knowledge retrieval   → Shared RAG/Knowledge capability
Resource planning     → Event/Campus capability
Availability          → Tool capability
Verification          → Shared orchestration capability
```

Create a new permanent agent only when it has independent domain ownership, reasoning, tools, permissions, state, or lifecycle.

---

# 6. Component Mapping

| Atlas requirement | Current AGENTX | Status / action |
|---|---|---|
| Web chat | React/Vite | IMPLEMENTED — reuse |
| Streaming | SSE chat/stream | IMPLEMENTED — reuse |
| LLM inference | Ollama/cloud reasoning | IMPLEMENTED — reuse |
| Tool calling | Tool layer | IMPLEMENTED/PARTIAL — extend |
| Memory | Existing runtime store | IMPLEMENTED/PARTIAL — extend for workflow state |
| Conversation history | Existing backend | IMPLEMENTED — reuse |
| Tasks | Existing task APIs | PARTIAL — extend for agent workflow state |
| Background jobs | Existing jobs/workers | IMPLEMENTED — reuse |
| Calendar | Existing integration | IMPLEMENTED — reuse |
| Email | Existing Gmail integration | IMPLEMENTED — reuse |
| OAuth | Existing OAuth layer | IMPLEMENTED — reuse |
| Document generation | Existing docs utilities | IMPLEMENTED — reuse where needed |
| Academic Agent | No campus-specific implementation identified | MISSING — build |
| Campus Agent | No campus-specific implementation identified | MISSING — build |
| Communication Agent | Generic communication exists | PARTIAL — adapt to campus |
| Event Agent | No campus-specific implementation identified | MISSING — build |
| Campus RAG | Not established in inspected runtime | MISSING — build |
| Vector DB | Not established in inspected runtime | MISSING — add when justified |
| Campus relational DB | Not established in inspected runtime | MISSING — add |
| Authentication/roles | Not established as campus RBAC | MISSING — build |
| Verification layer | General error/fallback behavior exists | PARTIAL — build explicit verifier |
| Campus maintenance | Not established | MISSING — build |
| Attendance data | Not established | MISSING — build |
| Event/resource data | Not established | MISSING — build |
| Institutional observability | Not established as PPT stack | PLANNED — add incrementally |

---

# 7. Reuse Rules

1. **Preserve working AGENTX functionality.** Do not remove working functionality merely to rename it.
2. **Extend before replacing.** Search for an existing capability before creating a parallel subsystem.
3. **Separate runtime from campus intelligence.** Keep generic LLM/tools/jobs separate from campus domain logic.
4. **Do not use conversational memory as authoritative campus data.** Attendance, policies, room availability, tickets, etc. belong in authoritative sources.
5. **Keep RAG separate from relational data.** RAG serves unstructured knowledge; databases/services serve transactional facts.
6. **Separate read tools from write tools.** Side effects require permissions and, where appropriate, confirmation.
7. **Never expose secrets to agents.** Agents receive scoped tool capabilities, not API keys.
8. **Agents do not execute arbitrary SQL.** Agents call typed services/tools.
9. **Keep model-provider abstraction.** Do not hard-code Atlas to one model provider.
10. **Preserve model fallback behavior** where technically appropriate.
11. **Avoid unnecessary agent proliferation.** A capability is not automatically an agent.
12. **Do not claim a PPT component exists until verified in code.**
13. **Do not change licensing as part of architecture work.**
14. **Avoid unrelated dependency upgrades.**
15. **Separate large refactors from feature work.**

---

# 8. Explicit DO-NOT-REWRITE Rules

These rules are mandatory for Antigravity and implementation agents.

### DO NOT REWRITE 1
Do not rewrite the AGENTX backend from scratch.

### DO NOT REWRITE 2
Do not replace the existing model/runtime system merely to match the PPT.

### DO NOT REWRITE 3
Do not replace SSE streaming unless a demonstrated requirement demands it.

### DO NOT REWRITE 4
Do not replace the existing tool infrastructure wholesale. Extend it.

### DO NOT REWRITE 5
Do not replace OAuth/integration code without proving the current implementation cannot satisfy the requirement.

### DO NOT REWRITE 6
Do not migrate the entire application to Python merely because the PPT lists Python + REST APIs.

### DO NOT REWRITE 7
Do not introduce LangGraph merely for appearance. Introduce a graph/state framework only if workflow complexity justifies it.

### DO NOT REWRITE 8
Do not replace the JSON runtime store before the campus requirements justify a database migration.

### DO NOT REWRITE 9
Do not remove existing API endpoints without a compatibility/migration plan.

### DO NOT REWRITE 10
Do not put campus business rules into the generic runtime when a campus module can own them.

### DO NOT REWRITE 11
Do not create an agent for every capability.

### DO NOT REWRITE 12
Do not assume PPT components are implemented.

### DO NOT REWRITE 13
Do not change the project license or distribution model as part of feature implementation.

### DO NOT REWRITE 14
Do not perform broad dependency upgrades unrelated to the current milestone.

### DO NOT REWRITE 15
Do not combine a large refactor with a new feature in one uncontrolled change.

---

# 9. API Contracts

## 9.1 Chat

Existing `/api/chat` and streaming behavior should remain backward compatible.

Conceptual Atlas request:

```json
{
  "message": "My attendance in Data Structures is 62%. What classes should I attend?",
  "conversationId": "conv_123",
  "userId": "user_456",
  "role": "student",
  "mode": "campus"
}
```

## 9.2 Streaming events

The transport may remain SSE. Atlas may emit structured events such as:

```text
workflow.started
plan.created
agent.started
agent.progress
agent.completed
verification.started
verification.completed
response.delta
workflow.completed
workflow.failed
```

The normal user UI should show a simple conversation. Internal agent details belong in developer/debug views.

## 9.3 Orchestrator input

```json
{
  "requestId": "req_123",
  "conversationId": "conv_123",
  "user": {
    "id": "user_456",
    "role": "student"
  },
  "message": "Report the broken projector in Lab 204",
  "context": {},
  "permissions": []
}
```

## 9.4 Orchestrator output

```json
{
  "workflowId": "wf_123",
  "intent": "campus_maintenance",
  "status": "planned",
  "tasks": [
    {
      "id": "task_1",
      "agent": "campus",
      "action": "verify_location",
      "dependsOn": []
    },
    {
      "id": "task_2",
      "agent": "campus",
      "action": "create_maintenance_request",
      "dependsOn": ["task_1"]
    },
    {
      "id": "task_3",
      "agent": "communication",
      "action": "send_confirmation",
      "dependsOn": ["task_2"]
    }
  ]
}
```

## 9.5 Agent interface

```typescript
interface CampusAgent {
  id: string;
  description: string;
  capabilities: string[];
  canHandle(input: AgentInput): Promise<AgentMatch>;
  execute(task: AgentTask, context: AgentContext): Promise<AgentResult>;
}
```

## 9.6 Agent result

```json
{
  "taskId": "task_1",
  "agent": "academic",
  "status": "completed",
  "result": {},
  "sources": [],
  "toolCalls": [],
  "warnings": [],
  "errors": []
}
```

Never coordinate agents by parsing free-form natural-language output when structured fields can be used.

## 9.7 Tool contract

```typescript
interface CampusTool {
  name: string;
  description: string;
  inputSchema: object;
  outputSchema: object;
  sideEffect: boolean;
  requiredPermissions: string[];
  execute(input: unknown, context: ToolContext): Promise<unknown>;
}
```

Initial campus tools should include, as required:

```text
get_attendance
get_timetable
find_room
check_room_availability
create_maintenance_request
get_maintenance_status
create_event_request
send_notification
search_campus_knowledge
```

---

# 10. Agent State Schema

## 10.1 Workflow state

```typescript
interface WorkflowState {
  workflowId: string;
  requestId: string;
  conversationId: string;

  user: {
    id: string;
    role: "student" | "faculty" | "admin";
  };

  intent: {
    name: string;
    confidence?: number;
    entities: Record<string, unknown>;
  };

  status:
    | "received"
    | "planning"
    | "running"
    | "waiting"
    | "verification"
    | "approval"
    | "completed"
    | "failed"
    | "cancelled";

  tasks: TaskState[];
  sharedContext: Record<string, unknown>;
  results: AgentResult[];
  pendingApprovals: ApprovalRequest[];
  verification: VerificationState;
  errors: WorkflowError[];

  createdAt: string;
  updatedAt: string;
}
```

## 10.2 Task state

```typescript
interface TaskState {
  id: string;
  agent: "academic" | "campus" | "communication" | "event";
  action: string;
  status: "pending" | "ready" | "running" | "waiting" | "completed" | "failed" | "skipped";
  dependsOn: string[];
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  sourceRefs?: string[];
  toolCalls?: string[];
  retryCount: number;
  startedAt?: string;
  completedAt?: string;
  error?: WorkflowError;
}
```

## 10.3 Verification state

```typescript
interface VerificationState {
  required: boolean;
  status: "pending" | "passed" | "failed" | "partial";
  checks: VerificationCheck[];
  warnings: string[];
  verifiedAt?: string;
}
```

---

# 11. Dependency-Aware Execution

Support dependency graphs rather than only linear task lists.

Example:

```text
Task A: Find Lab 204
       ↓
Task B: Check availability
       ↓
Task C: Create maintenance request
       ↓
Task D: Notify user
```

Independent tasks may run in parallel:

```text
              ┌── Find venue
Request ──────┼── Calculate capacity
              ├── Estimate resources
              └── Check event calendar
```

A task is executable only when required dependencies have completed successfully.

---

# 12. RAG Design

## 12.1 Purpose

Use RAG for institution-specific knowledge such as:

- student handbooks
- academic regulations
- attendance policy
- examination rules
- campus maps
- department procedures
- facility guidelines
- event policies
- notices
- FAQs
- administrative procedures

## 12.2 Ingestion

```text
Campus Document
      ↓
Validation
      ↓
Text extraction
      ↓
Cleaning
      ↓
Chunking
      ↓
Metadata extraction
      ↓
Embedding
      ↓
Vector store
```

## 12.3 Metadata

```json
{
  "documentId": "doc_123",
  "title": "Attendance Policy",
  "department": "Academic Affairs",
  "category": "policy",
  "version": "2026-01",
  "effectiveFrom": "2026-01-01",
  "page": 4,
  "chunkId": "chunk_004",
  "accessLevel": "student",
  "updatedAt": "2026-01-10T10:00:00Z"
}
```

## 12.4 Retrieval

```text
User Request
    ↓
Intent analysis
    ↓
Knowledge query
    ↓
Vector retrieval
    ↓
Metadata/access filtering
    ↓
Optional reranking
    ↓
Context assembly
    ↓
Agent reasoning
    ↓
Source-aware response
```

### RAG rules

1. Prefer authoritative campus sources.
2. Preserve version/effective-date metadata.
3. Do not silently mix expired and current policies.
4. Apply access controls before returning content.
5. Preserve source references.
6. Similarity is not proof of correctness.
7. Verify transactional facts against authoritative databases/APIs.
8. Keep RAG separate from conversational memory.

---

# 13. Database Design

## 13.1 Structured campus database

Use a relational database for authoritative transactional campus data.

Conceptual schema:

```text
users
roles
user_roles

students
faculty
departments

courses
course_sections
enrollments

attendance_records
timetable_entries
academic_calendars

buildings
rooms
labs
room_resources

maintenance_requests
maintenance_updates

events
event_resources
event_requests

notifications
communication_requests

workflow_runs
workflow_tasks
workflow_results

audit_logs
```

## 13.2 Core tables

### users

```text
id
external_id
name
email
status
created_at
updated_at
```

### students

```text
id
user_id
student_number
department_id
program
semester
section
```

### courses

```text
id
code
name
department_id
credits
```

### attendance_records

```text
id
student_id
course_id
date
status
period
source
created_at
```

### rooms

```text
id
building_id
name
type
capacity
status
```

### maintenance_requests

```text
id
reported_by
location_id
category
description
priority
status
assigned_to
created_at
updated_at
resolved_at
```

### events

```text
id
created_by
title
description
start_time
end_time
venue_id
capacity
status
budget_estimate
```

### workflow_runs

```text
id
request_id
conversation_id
user_id
intent
status
started_at
completed_at
```

### workflow_tasks

```text
id
workflow_id
agent
action
status
depends_on
input_json
output_json
started_at
completed_at
```

---

# 14. Database vs RAG Boundary

Use the relational database for transactional questions:

```text
"Is Lab 204 available at 2 PM?"
"What is my attendance?"
"Has ticket #123 been resolved?"
"How many students registered?"
```

Use RAG for institutional knowledge:

```text
"What is the attendance policy?"
"What is the event-organizing procedure?"
"What are the rules for booking a laboratory?"
```

Hybrid questions can use both:

```text
"Can I organize a workshop in Lab 204 according to university rules?"
             ↓
       Policy RAG + Room DB + Calendar + Event Agent
```

---

# 15. Authentication and Authorization

Minimum roles:

```text
Student
Faculty
Administrator
```

Permissions must be enforced outside the LLM.

The model may request an operation; the application/service layer decides whether that operation is permitted.

Example:

```text
Student:
  - own attendance
  - permitted campus information
  - permitted service requests
  - event requests

Faculty:
  - permitted academic information
  - event workflows
  - service requests

Admin:
  - campus operations
  - service management
  - event administration
  - permitted reporting
```

---

# 16. Verification Architecture

```text
Agent result
     ↓
Schema validation
     ↓
Permission validation
     ↓
Source/data validation
     ↓
Business-rule validation
     ↓
Action validation
     ↓
Final result
```

Example:

```text
Event Agent says:
"Lab 204 is available."
        ↓
Calendar/availability tool verifies it.
        ↓
Conflict → reject proposal.
No conflict → continue.
```

Distinguish clearly between:

- model-generated claims
- database facts
- tool results
- retrieved evidence
- user-provided information

---

# 17. Error and Failure Handling

Classify failures as:

### Transient

API timeout, rate limit, temporary network issue.

```text
retry → fallback → report if unresolved
```

### Permanent

Invalid ID, unauthorized user, unavailable service.

```text
stop affected task → explain → preserve workflow state
```

### Partial

Example: event created but notification failed.

Return an explicit partial-success state instead of claiming full success.

---

# 18. Approval Model

```text
READ
 ↓
safe to execute automatically

WRITE / SIDE EFFECT
 ↓
permission check
 ↓
policy check
 ↓
confirmation if required
 ↓
execute
 ↓
verify
```

Examples:

| Action | Classification |
|---|---|
| Search attendance | Read |
| Search policy | Read |
| Find room | Read |
| Create maintenance request | Write |
| Send notification | Write |
| Create event request | Write |
| Send institutional email | Write |
| Cancel event | High-impact write |

---

# 19. Target Repository Structure

This is conceptual. Do not reorganize the existing repository until the actual structure has been audited.

```text
AGENTX/
├── backend/
│   ├── server.js
│   ├── tools.js
│   ├── oauth.js
│   ├── store.js
│   ├── runtime/
│   │   ├── llm/
│   │   ├── streaming/
│   │   ├── memory/
│   │   └── jobs/
│   ├── atlas/
│   │   ├── orchestrator/
│   │   │   ├── planner/
│   │   │   ├── router/
│   │   │   ├── state/
│   │   │   └── verifier/
│   │   ├── agents/
│   │   │   ├── academic/
│   │   │   ├── campus/
│   │   │   ├── communication/
│   │   │   └── event/
│   │   ├── knowledge/
│   │   │   ├── ingestion/
│   │   │   ├── retrieval/
│   │   │   └── citations/
│   │   ├── campus/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── schemas/
│   │   └── workflows/
│   └── tests/
├── frontend/
│   ├── chat/
│   ├── campus/
│   ├── components/
│   └── services/
└── docs/
    ├── AGENTX_TO_ATLAS_ARCHITECTURE.md
    ├── API.md
    ├── AGENTS.md
    └── RUNBOOK.md
```

---

# 20. Phased Implementation Plan

## Phase 0 — Repository Audit

Inspect the complete repository before changing architecture.

Deliver:

```text
CURRENT_ARCHITECTURE.md
CURRENT_API.md
DEPENDENCY_AUDIT.md
```

No feature refactor during this phase.

## Phase 1 — Atlas Integration Boundary

Create a clean Atlas namespace and a campus chat/API entry point while preserving existing `/api/chat` behavior.

Success: existing AGENTX remains runnable and Atlas can be enabled independently.

## Phase 2 — Orchestrator + State

Implement:

- intent classification
- plan generation
- task schema
- dependency resolution
- agent routing
- workflow state
- result aggregation

Start with deterministic high-confidence routes.

```text
attendance → Academic
maintenance → Campus
helpdesk → Communication
event → Event
```

## Phase 3 — Academic Agent

Implement attendance, timetable, courses, academic calendar, and analysis.

Demo:

```text
"My attendance is low in three subjects. What should I attend to improve it?"
```

## Phase 4 — Campus Agent

Implement campus locations, rooms/labs, facilities, maintenance requests, and ticket status.

Demo:

```text
"The projector in Lab 204 is not working. Report it and tell me what happens next."
```

## Phase 5 — Communication Agent

Adapt existing communication/email capabilities into campus helpdesk and notification workflows.

## Phase 6 — Event Agent

Implement event creation, venue/capacity, availability, resource planning, budget estimation, and event requests.

Demo:

```text
"Organize a coding workshop for 100 students."
```

Expected orchestration:

```text
Event Agent
 ├── Campus Agent → venue
 ├── Calendar → availability
 ├── Resource capability → requirements
 └── Budget capability → estimate
```

## Phase 7 — Campus RAG

Implement ingestion, chunking, embeddings, vector retrieval, metadata/access filtering, source references, and document versioning.

Start with a small authoritative corpus.

## Phase 8 — PostgreSQL Campus Data

Add/migrate authoritative campus data, prioritizing:

```text
users
students
courses
attendance
buildings
rooms
maintenance
events
notifications
workflow state
```

Do not migrate unrelated AGENTX runtime state until necessary.

## Phase 9 — Verification and Safety

Add schema validation, permissions, source validation, business rules, action verification, retries, partial-success handling, and audit logging.

## Phase 10 — Observability

Add metrics, logs, traces, workflow history, agent latency, tool failures, retrieval quality, and model usage. Introduce Prometheus/Grafana only when justified by operational requirements.

## Phase 11 — Production Hardening

Authentication, authorization, secrets management, rate limiting, validation, backups, versioned knowledge, timeouts, retries, idempotency, observability, security testing, license/dependency audit, and disaster recovery.

---

# 21. Implementation Priority

```text
1. Audit existing AGENTX
        ↓
2. Integration boundary
        ↓
3. Orchestrator + state
        ↓
4. Academic Agent
        ↓
5. Campus Agent
        ↓
6. Communication Agent
        ↓
7. Event Agent
        ↓
8. RAG
        ↓
9. PostgreSQL
        ↓
10. Verification
        ↓
11. Observability
        ↓
12. Production hardening
```

Do not build all infrastructure simultaneously.

---

# 22. Testing Strategy

### Unit tests

Test routing, dependency resolution, schemas, tools, permissions, retrieval filters, and service methods.

### Agent tests

Example:

```text
Input: "My attendance in DBMS is 61%."
Expected: Academic Agent selected.
```

### Workflow tests

Example:

```text
Event request
 → venue
 → availability
 → resources
 → budget
 → verification
```

### Failure tests

Simulate tool timeout, database failure, invalid room, unauthorized user, model failure, empty RAG result, calendar conflict, and notification failure.

### Regression tests

Every existing AGENTX capability must continue to pass after Atlas changes.

---

# 23. Observability Requirements

Every workflow should capture:

```text
request_id
workflow_id
user_id
intent
selected_agent
task_id
tool_calls
model_calls
latency
status
errors
verification_status
```

Never log API keys, OAuth secrets, access tokens, passwords, or unnecessary personal data.

---

# 24. Security Principles

1. Authentication is an application responsibility.
2. Authorization is a service/application responsibility.
3. The LLM is not an authority.
4. Tools enforce permissions.
5. Database access is service-mediated.
6. RAG retrieval respects access controls.
7. Side effects require explicit authorization.
8. Credentials never enter prompts.
9. User content is untrusted input.
10. Important actions are auditable.

---

# 25. Atlas MVP Definition of Done

A campus request is considered successfully supported when the system can:

1. receive the request
2. identify intent
3. create a task plan
4. select the correct agent
5. retrieve authoritative campus data/knowledge
6. execute required tools
7. pass structured intermediate results
8. handle failures
9. verify the result
10. return a clear response
11. execute an authorized action when required
12. preserve workflow state

Minimum demonstrations:

### Academic

```text
"My attendance in three subjects is below the required percentage. Analyze my situation."
```

### Campus maintenance

```text
"The projector in Lab 204 is not working. Report it and tell me what happens next."
```

### Event

```text
"Organize a coding workshop for 100 students."
```

---

# 26. Architectural Non-Goals

The first implementation must not attempt to:

- replace every AGENTX subsystem
- migrate every persistence mechanism
- create an agent for every feature
- build unrestricted autonomous execution
- give agents unrestricted database access
- bypass verification
- implement every PPT infrastructure component before proving core workflows
- optimize distributed infrastructure before the functional architecture is stable

---

# 27. Architecture Decision Record

## Decision

Use AGENTX as the runtime foundation and add Atlas as the campus-specific multi-agent intelligence layer.

## Reason

AGENTX already provides valuable execution infrastructure. The PPT primarily adds campus-specific orchestration, specialized agents, knowledge, data, verification, and workflows.

## Consequence

The final implementation may differ from the PPT's exact infrastructure diagram while still satisfying its functional architecture.

The success criteria are:

> **Functional alignment with Atlas requirements + preservation of working AGENTX capabilities + clean modular boundaries + verifiable workflows.**

---

# 28. Antigravity Implementation Contract

Antigravity must follow:

```text
INSPECT
  ↓
MAP
  ↓
PLAN
  ↓
IMPLEMENT ONE MILESTONE
  ↓
TEST
  ↓
VERIFY REGRESSION
  ↓
DOCUMENT
  ↓
NEXT MILESTONE
```

For every proposed change, answer:

1. Does AGENTX already provide this capability?
2. Can it be extended?
3. Does the change preserve existing API behavior?
4. Does it avoid unnecessary duplication?
5. Does it create a clean Atlas/AGENTX boundary?
6. How will it be tested?
7. What happens if the new component fails?

If an existing capability can be reused, reuse it.

---

# 29. Change Control

Any proposal to replace the runtime, primary backend framework, model system, SSE, tool infrastructure, OAuth, or all persistence must explicitly document:

```text
Problem
Current limitation
Options considered
Chosen solution
Migration impact
Backward compatibility
Testing plan
Rollback plan
```

---

# 30. Final Implementation Principle

```text
                 ATLAS
        Campus Intelligence Layer
                  │
     ┌────────────┼────────────┐
     │            │            │
  Agents        RAG        Workflows
     │            │            │
     └────────────┼────────────┘
                  ▼
              AGENTX
          Runtime / Engine
                  │
     ┌────────────┼────────────┐
     │            │            │
    LLM          Tools       Jobs
```

**Build Atlas around AGENTX. Do not rebuild AGENTX to build Atlas.**

Preserve the existing runtime wherever possible. Add the smallest clean abstraction necessary for campus orchestration, specialized agents, campus knowledge, campus data, structured workflows, verification, and campus actions.

Every milestone must leave the repository runnable, testable, and documented.

---

# 36. Concrete API Examples

This section turns the conceptual contracts above into concrete JSON examples. These examples are implementation contracts, not requirements that every field must be exposed directly to the frontend.

The examples use a consistent correlation model:

```text
requestId
   ↓
workflowId
   ↓
taskId
   ↓
agent execution
   ↓
tool calls / RAG retrieval
   ↓
verification
   ↓
final response
```

## 36.1 Orchestrator Request

### Endpoint

```http
POST /api/atlas/orchestrate
Content-Type: application/json
Authorization: Bearer <access-token>
```

### Request

```json
{
  "requestId": "req_01JATLAS0001",
  "conversationId": "conv_01JATLAS0001",
  "user": {
    "id": "user_1024",
    "role": "student"
  },
  "message": "The projector in Lab 204 is not working. Please report it and tell me what happens next.",
  "context": {
    "currentPage": "campus",
    "locale": "en-IN"
  },
  "options": {
    "stream": true,
    "includeDebugEvents": false
  }
}
```

### Orchestrator response

For a non-streaming implementation:

```http
HTTP/1.1 202 Accepted
Content-Type: application/json
```

```json
{
  "requestId": "req_01JATLAS0001",
  "workflowId": "wf_01JATLAS0001",
  "status": "running",
  "intent": {
    "name": "campus_maintenance",
    "confidence": 0.97,
    "entities": {
      "location": "Lab 204",
      "issue": "projector_not_working"
    }
  },
  "plan": {
    "tasks": [
      {
        "id": "task_01",
        "agent": "campus",
        "action": "verify_location",
        "dependsOn": []
      },
      {
        "id": "task_02",
        "agent": "campus",
        "action": "create_maintenance_request",
        "dependsOn": ["task_01"]
      },
      {
        "id": "task_03",
        "agent": "communication",
        "action": "prepare_confirmation",
        "dependsOn": ["task_02"]
      }
    ]
  }
}
```

### Design rule

The orchestrator response should expose the workflow identifier immediately so the client can correlate later stream events, task updates, and final results.

---

# 37. Agent Handoff API

Agent handoffs must be structured. An agent should not hand another agent a free-form paragraph when the information can be represented as typed fields.

## 37.1 Handoff request

```http
POST /api/atlas/workflows/wf_01JATLAS0001/tasks/task_01/handoff
Content-Type: application/json
```

```json
{
  "workflowId": "wf_01JATLAS0001",
  "fromAgent": "orchestrator",
  "toAgent": "campus",
  "task": {
    "id": "task_01",
    "action": "verify_location",
    "input": {
      "locationName": "Lab 204",
      "issueCategory": "projector",
      "issueDescription": "Projector is not working"
    },
    "dependsOn": []
  },
  "context": {
    "user": {
      "id": "user_1024",
      "role": "student"
    },
    "permissions": [
      "maintenance_request:create"
    ]
  },
  "expectedOutput": {
    "locationId": "string",
    "buildingId": "string",
    "locationExists": "boolean"
  }
}
```

## 37.2 Agent handoff response

```json
{
  "workflowId": "wf_01JATLAS0001",
  "taskId": "task_01",
  "fromAgent": "campus",
  "status": "completed",
  "result": {
    "locationExists": true,
    "locationId": "room_204",
    "buildingId": "academic_block_a",
    "locationName": "Lab 204",
    "locationType": "laboratory"
  },
  "sources": [
    {
      "type": "database",
      "source": "rooms",
      "recordId": "room_204"
    }
  ],
  "toolCalls": [
    {
      "tool": "find_room",
      "status": "completed"
    }
  ],
  "warnings": [],
  "errors": []
}
```

## 37.3 Handoff to a dependent task

The orchestrator then creates the next task using the structured result rather than asking the next agent to reinterpret the original conversation.

```json
{
  "workflowId": "wf_01JATLAS0001",
  "taskId": "task_02",
  "agent": "campus",
  "action": "create_maintenance_request",
  "dependsOn": ["task_01"],
  "input": {
    "locationId": "room_204",
    "category": "projector",
    "description": "Projector is not working"
  }
}
```

This prevents the common failure mode:

```text
Agent A → natural-language explanation → Agent B → reinterpretation
```

and prefers:

```text
Agent A → typed result → Orchestrator → typed task input → Agent B
```

---

# 38. Agent Result API

## 38.1 Completion

```http
POST /api/atlas/workflows/wf_01JATLAS0001/tasks/task_01/result
Content-Type: application/json
```

```json
{
  "taskId": "task_01",
  "agent": "campus",
  "status": "completed",
  "result": {
    "locationExists": true,
    "locationId": "room_204"
  },
  "sources": [
    {
      "type": "database",
      "source": "rooms",
      "recordId": "room_204"
    }
  ],
  "toolCalls": [
    {
      "tool": "find_room",
      "arguments": {
        "name": "Lab 204"
      },
      "status": "completed"
    }
  ],
  "warnings": [],
  "errors": []
}
```

## 38.2 Failure

```json
{
  "taskId": "task_01",
  "agent": "campus",
  "status": "failed",
  "result": null,
  "sources": [],
  "toolCalls": [
    {
      "tool": "find_room",
      "status": "failed",
      "errorCode": "CAMPUS_DB_TIMEOUT"
    }
  ],
  "warnings": [
    "Campus location service did not respond."
  ],
  "errors": [
    {
      "code": "DEPENDENCY_UNAVAILABLE",
      "retryable": true
    }
  ]
}
```

The orchestrator should use `retryable` and task policy to decide whether to retry, fall back, or terminate the workflow.

---

# 39. Task State API

## 39.1 Get workflow state

```http
GET /api/atlas/workflows/wf_01JATLAS0001
Authorization: Bearer <access-token>
```

### Response

```json
{
  "workflowId": "wf_01JATLAS0001",
  "requestId": "req_01JATLAS0001",
  "conversationId": "conv_01JATLAS0001",
  "status": "running",
  "intent": {
    "name": "campus_maintenance",
    "confidence": 0.97,
    "entities": {
      "location": "Lab 204",
      "issue": "projector_not_working"
    }
  },
  "tasks": [
    {
      "id": "task_01",
      "agent": "campus",
      "action": "verify_location",
      "status": "completed",
      "dependsOn": [],
      "input": {
        "locationName": "Lab 204"
      },
      "output": {
        "locationId": "room_204"
      },
      "retryCount": 0
    },
    {
      "id": "task_02",
      "agent": "campus",
      "action": "create_maintenance_request",
      "status": "running",
      "dependsOn": ["task_01"],
      "input": {
        "locationId": "room_204",
        "category": "projector"
      },
      "retryCount": 0
    },
    {
      "id": "task_03",
      "agent": "communication",
      "action": "prepare_confirmation",
      "status": "pending",
      "dependsOn": ["task_02"],
      "input": {},
      "retryCount": 0
    }
  ],
  "verification": {
    "required": true,
    "status": "pending",
    "checks": []
  },
  "errors": [],
  "createdAt": "2026-10-03T08:00:00Z",
  "updatedAt": "2026-10-03T08:01:14Z"
}
```

## 39.2 Task transition

A task must follow a controlled state machine:

```text
pending
   ↓
ready
   ↓
running
   ├───────────────┐
   ↓               ↓
completed        failed
                   │
             retryable?
               /     \
             yes      no
              ↓        ↓
           ready      failed
```

A task must not jump arbitrarily from `pending` to `completed`.

---

# 40. Task Update API

```http
PATCH /api/atlas/workflows/wf_01JATLAS0001/tasks/task_02
Content-Type: application/json
```

```json
{
  "status": "completed",
  "output": {
    "maintenanceRequestId": "MR-2026-00142",
    "status": "submitted",
    "priority": "medium"
  },
  "toolCalls": [
    {
      "tool": "create_maintenance_request",
      "status": "completed"
    }
  ]
}
```

### Response

```json
{
  "taskId": "task_02",
  "workflowId": "wf_01JATLAS0001",
  "status": "completed",
  "nextTasksReady": [
    "task_03"
  ]
}
```

The orchestration engine, rather than the agent itself, should determine which dependent tasks become ready.

---

# 41. Verification API

Verification is a separate stage from agent reasoning.

## 41.1 Start verification

```http
POST /api/atlas/workflows/wf_01JATLAS0001/verify
Content-Type: application/json
```

```json
{
  "workflowId": "wf_01JATLAS0001",
  "checks": [
    {
      "id": "check_location",
      "type": "database",
      "description": "Confirm that Lab 204 exists"
    },
    {
      "id": "check_request",
      "type": "database",
      "description": "Confirm maintenance request was created"
    },
    {
      "id": "check_permission",
      "type": "authorization",
      "description": "Confirm user was permitted to create the request"
    }
  ]
}
```

## 41.2 Verification response

```json
{
  "workflowId": "wf_01JATLAS0001",
  "status": "passed",
  "checks": [
    {
      "id": "check_location",
      "status": "passed",
      "evidence": {
        "source": "rooms",
        "recordId": "room_204"
      }
    },
    {
      "id": "check_request",
      "status": "passed",
      "evidence": {
        "source": "maintenance_requests",
        "recordId": "MR-2026-00142"
      }
    },
    {
      "id": "check_permission",
      "status": "passed",
      "evidence": {
        "permission": "maintenance_request:create"
      }
    }
  ],
  "warnings": []
}
```

## 41.3 Failed verification

```json
{
  "workflowId": "wf_01JATLAS0001",
  "status": "failed",
  "checks": [
    {
      "id": "check_request",
      "status": "failed",
      "reason": "Maintenance service returned a request ID, but the record could not be retrieved for confirmation."
    }
  ],
  "warnings": [
    "The system must not report the maintenance request as fully confirmed."
  ]
}
```

The final response should then use a partial-success status rather than claiming success.

---

# 42. Verification Rules

The verifier should distinguish at least four evidence classes:

```text
MODEL_CLAIM
TOOL_RESULT
DATABASE_RECORD
RAG_SOURCE
```

Example:

```json
{
  "claim": "Lab 204 exists",
  "evidence": [
    {
      "type": "DATABASE_RECORD",
      "source": "rooms",
      "recordId": "room_204"
    }
  ],
  "status": "verified"
}
```

A model-generated statement without supporting evidence should not automatically become a verified fact.

---

# 43. RAG Retrieval API

## 43.1 Retrieval request

```http
POST /api/atlas/rag/retrieve
Content-Type: application/json
Authorization: Bearer <access-token>
```

```json
{
  "query": "What is the minimum attendance requirement for students?",
  "user": {
    "id": "user_1024",
    "role": "student"
  },
  "filters": {
    "department": null,
    "category": "policy",
    "effectiveOnly": true
  },
  "topK": 5,
  "options": {
    "rerank": true,
    "includeContent": true,
    "includeMetadata": true
  }
}
```

## 43.2 RAG response

```json
{
  "query": "What is the minimum attendance requirement for students?",
  "results": [
    {
      "chunkId": "chunk_attendance_004",
      "documentId": "doc_attendance_policy_2026",
      "score": 0.93,
      "rerankScore": 0.97,
      "content": "Attendance requirements are defined in the current academic regulations...",
      "metadata": {
        "title": "Academic Attendance Policy",
        "category": "policy",
        "department": "Academic Affairs",
        "version": "2026-01",
        "effectiveFrom": "2026-01-01",
        "page": 4,
        "accessLevel": "student"
      },
      "source": {
        "type": "document",
        "documentId": "doc_attendance_policy_2026",
        "page": 4
      }
    }
  ],
  "retrieval": {
    "topK": 5,
    "returned": 1,
    "reranked": true
  }
}
```

The retrieval service may return fewer than `topK` results when only a smaller number of results meet the relevance/access criteria.

---

# 44. RAG Retrieval With Agent Context

Agents should not have to reconstruct authorization and workflow context themselves.

Example:

```json
{
  "query": "Can this student organize an event in a laboratory?",
  "user": {
    "id": "user_1024",
    "role": "student"
  },
  "workflow": {
    "workflowId": "wf_event_001",
    "intent": "event_creation"
  },
  "filters": {
    "category": [
      "event_policy",
      "facility_policy"
    ],
    "effectiveOnly": true
  },
  "topK": 8
}
```

The RAG service applies access filters before returning results.

---

# 45. RAG Citation Contract

A final answer that relies on institutional documents should retain source references.

Example internal answer structure:

```json
{
  "answer": "The current attendance policy requires students to meet the minimum attendance threshold defined in the academic regulations.",
  "citations": [
    {
      "documentId": "doc_attendance_policy_2026",
      "title": "Academic Attendance Policy",
      "page": 4,
      "chunkId": "chunk_attendance_004"
    }
  ]
}
```

The exact policy value should be populated from the authoritative retrieved source, not guessed by the model.

---

# 46. Combined Orchestrator + RAG Example

User request:

```text
"What are the attendance rules, and based on my current attendance,
which subjects need attention?"
```

Expected plan:

```text
                 User Request
                      │
                      ▼
                Orchestrator
                      │
             ┌────────┴────────┐
             ▼                 ▼
        RAG Retrieval     Academic Agent
             │                 │
             ▼                 ▼
       Attendance Policy   Student Attendance
             │                 │
             └────────┬────────┘
                      ▼
                  Verifier
                      │
                      ▼
               Response Composer
```

### RAG task

```json
{
  "taskId": "task_policy",
  "agent": "academic",
  "action": "retrieve_attendance_policy",
  "input": {
    "query": "current attendance requirements"
  }
}
```

### Academic task

```json
{
  "taskId": "task_attendance",
  "agent": "academic",
  "action": "get_student_attendance",
  "input": {
    "studentId": "user_1024"
  }
}
```

### Combined result

```json
{
  "workflowId": "wf_attendance_001",
  "status": "completed",
  "results": {
    "policy": {
      "source": "doc_attendance_policy_2026",
      "verified": true
    },
    "attendance": {
      "verified": true,
      "subjects": [
        {
          "courseCode": "CS301",
          "attendancePercentage": 62
        },
        {
          "courseCode": "CS302",
          "attendancePercentage": 81
        }
      ]
    }
  },
  "verification": {
    "status": "passed"
  }
}
```

---

# 47. Complete End-to-End Example

## User

```text
"The projector in Lab 204 is not working.
Report it and tell me what happens next."
```

## Step 1 — Orchestrator

```json
{
  "intent": "campus_maintenance",
  "entities": {
    "location": "Lab 204",
    "issue": "projector_not_working"
  }
}
```

## Step 2 — Plan

```json
{
  "tasks": [
    {
      "id": "task_01",
      "agent": "campus",
      "action": "verify_location"
    },
    {
      "id": "task_02",
      "agent": "campus",
      "action": "create_maintenance_request",
      "dependsOn": ["task_01"]
    },
    {
      "id": "task_03",
      "agent": "communication",
      "action": "prepare_confirmation",
      "dependsOn": ["task_02"]
    }
  ]
}
```

## Step 3 — Campus Agent

```json
{
  "locationExists": true,
  "locationId": "room_204"
}
```

## Step 4 — Campus Agent creates request

```json
{
  "maintenanceRequestId": "MR-2026-00142",
  "status": "submitted"
}
```

## Step 5 — Communication Agent

```json
{
  "message": "Your maintenance request MR-2026-00142 has been submitted for Lab 204."
}
```

## Step 6 — Verification

```json
{
  "status": "passed",
  "checks": [
    "location_exists",
    "request_exists",
    "user_authorized"
  ]
}
```

## Step 7 — Final response

```json
{
  "workflowId": "wf_01JATLAS0001",
  "status": "completed",
  "response": {
    "text": "The projector issue in Lab 204 has been reported successfully. Your maintenance request ID is MR-2026-00142."
  },
  "citations": [],
  "actions": [
    {
      "type": "maintenance_request",
      "id": "MR-2026-00142",
      "status": "submitted"
    }
  ],
  "verification": {
    "status": "passed"
  }
}
```

---

# 48. SSE Event Contract

The existing AGENTX streaming mechanism should be reused rather than replaced.

For Atlas workflows, the stream can expose structured events.

Example:

```text
event: workflow.started
data: {"workflowId":"wf_01JATLAS0001"}

event: intent.detected
data: {"intent":"campus_maintenance","confidence":0.97}

event: plan.created
data: {"taskCount":3}

event: task.started
data: {"taskId":"task_01","agent":"campus"}

event: task.completed
data: {"taskId":"task_01","status":"completed"}

event: task.started
data: {"taskId":"task_02","agent":"campus"}

event: task.completed
data: {"taskId":"task_02","status":"completed"}

event: verification.started
data: {"workflowId":"wf_01JATLAS0001"}

event: verification.completed
data: {"status":"passed"}

event: response.delta
data: {"text":"The projector issue"}

event: response.delta
data: {"text":" in Lab 204 has been reported successfully."}

event: workflow.completed
data: {"workflowId":"wf_01JATLAS0001","status":"completed"}
```

The frontend should render user-facing progress from these events without coupling itself to internal implementation details.

---

# 49. Idempotency Contract

Write operations must support idempotency wherever possible.

Example:

```http
POST /api/atlas/maintenance/requests
Idempotency-Key: req_01JATLAS0001-task_02
```

Request:

```json
{
  "locationId": "room_204",
  "category": "projector",
  "description": "Projector is not working"
}
```

If the same operation is retried, the service should return the existing request instead of creating duplicates.

```json
{
  "maintenanceRequestId": "MR-2026-00142",
  "status": "submitted",
  "idempotentReplay": true
}
```

This is particularly important when model/tool calls, network requests, or workers are retried.

---

# 50. API Contract Rules

All Atlas APIs should follow these principles:

1. Use stable IDs for requests, workflows, and tasks.
2. Return structured JSON.
3. Validate inputs at the API boundary.
4. Never trust model-generated IDs or permissions.
5. Keep tool arguments schema-validated.
6. Preserve correlation IDs through every downstream call.
7. Distinguish `failed`, `cancelled`, `partial`, and `completed`.
8. Include machine-readable error codes.
9. Keep human-readable messages separate from machine-readable state.
10. Preserve source/evidence references for RAG and verification.
11. Make write operations idempotent where practical.
12. Do not expose secrets or access tokens in responses.
13. Keep internal debugging information out of normal user responses.
14. Maintain backward compatibility with existing AGENTX endpoints during migration.

---

# 51. Example Error Contract

```json
{
  "error": {
    "code": "AGENT_TASK_FAILED",
    "message": "The campus maintenance service could not create the request.",
    "retryable": true,
    "requestId": "req_01JATLAS0001",
    "workflowId": "wf_01JATLAS0001",
    "taskId": "task_02"
  }
}
```

The user-facing layer may translate this into:

```text
I couldn't submit the maintenance request because the campus
maintenance service is temporarily unavailable. No request has
been confirmed as created.
```

The internal API and the user-facing response should not be forced to use the same wording.


