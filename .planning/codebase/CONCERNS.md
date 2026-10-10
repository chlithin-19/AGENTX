---
last_mapped_commit: 5388507e9f3a5d5b9a16089055cce46b10c957a3
last_mapped_at: 2026-10-10
---
# Codebase Concerns

**Analysis Date:** 2026-10-10

## Tech Debt

**Monolithic Server File:**
- Issue: `backend/server.js` is over 2,000 lines long, combining HTTP route handling, SSE streaming logic, prompt generation, Instagram webhooks, cron intervals, model rotation, and HTML template generation into a single procedural script.
- Files: `backend/server.js`
- Impact: High risk of regression when modifying endpoints; difficult to test isolated functions; high cognitive overhead.
- Fix approach: Extract routes into modular Express routers (e.g. `/api/chat`, `/api/voice`, `/api/image`, `/api/tasks`, `/logs`, `/webhook`) similar to the clean modular pattern established in `backend/atlas/`.

**Synchronous File-Based Storage (`store.json`):**
- Issue: `backend/store.js` relies on synchronous `readFileSync` and `writeFileSync` calls to read and save state.
- Files: `backend/store.js`, `backend/data/store.json`
- Impact: Blocks Node.js event loop on every write; no transactional isolation; concurrent writes can corrupt state or cause race conditions.
- Fix approach: Migrate to asynchronous storage or transition to an embedded database (SQLite) or PostgreSQL as outlined in `ATLAS_DATA_ARCHITECTURE_PLAN.md`.

**Nested Frontend Directory Layout:**
- Issue: The repository contains both `frontend/` (which holds Docker configs and provisioning scripts) and `frontend/frontend/` (which holds the genuine React application).
- Files: `frontend/`, `frontend/frontend/`
- Impact: Developer confusion regarding package roots; redundant script configurations; complex Docker build contexts.
- Fix approach: Flatten the frontend structure so that `frontend/` directly contains the React/Vite source code.

## Known Bugs

**Unused / Stubbed FastAPI Container:**
- Symptoms: `frontend/backend/app/main.py` is a 17-line stub returning `{"message": "Hello from FastAPI backend"}` that is not integrated with the main Express runtime.
- Files: `frontend/backend/app/main.py`, `frontend/compose.yaml`
- Trigger: Starting services via Docker Compose runs a redundant Python server that provides no business logic.
- Workaround: Main application runs directly against Node.js `backend/server.js`.

## Security Considerations

**Unauthenticated API Endpoints & Shared Global State:**
- Risk: Endpoints `/api/chat`, `/api/actions/*`, and `/api/atlas/orchestrate` do not validate user identity or enforce sessions. All users share the same `store.json` data, tokens, and logs.
- Files: `backend/server.js`, `backend/atlas/index.js`
- Current mitigation: Single-user workstation assumption (`Varshith`); private network deployment.
- Recommendations: Implement JWT or session authentication and introduce Role-Based Access Control (RBAC) separating student, faculty, and administrator privileges as planned in `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md`.

**In-Memory OAuth State Map:**
- Risk: OAuth state tokens are stored in an in-memory `Map` (`backend/oauth.js`) that does not persist across server restarts.
- Files: `backend/oauth.js`
- Current mitigation: Short OAuth redirect window.
- Recommendations: Store active OAuth states in a persistent or Redis-backed session store.

## Performance Bottlenecks

**Synchronous Store Writes on Hot Paths:**
- Problem: Logging events (`logEvent`) and updating request usage stats trigger immediate `save()` calls executing synchronous disk writes.
- Files: `backend/store.js`, `backend/server.js`
- Cause: `save()` writes the entire `store.json` payload atomically on every small state update.
- Improvement path: Throttle / debounce store saves or queue log writes asynchronously.

**In-Memory RAG Scanning:**
- Problem: `backend/atlas/knowledge/retriever.js` reads and tokenizes all markdown policy documents in `backend/atlas/knowledge/documents/` on each query.
- Files: `backend/atlas/knowledge/retriever.js`
- Cause: No precomputed vector embeddings or persisted inverted index.
- Improvement path: Build a persistent vector index (e.g. pgvector or LanceDB) as outlined in `ATLAS_DATA_ARCHITECTURE_PLAN.md`.

## Fragile Areas

**Regex-Based Query Routing:**
- Files: `backend/server.js`, `backend/atlas/orchestrator/orchestrator.js`
- Why fragile: Keyword and regex matching (e.g. matching "attendance", "event", "placement") is susceptible to false positives or missed intent nuances for complex conversational queries.
- Safe modification: Add comprehensive unit tests covering diverse query formulations; incorporate LLM-assisted intent classification fallback.
- Test coverage: 0% test coverage currently.

**Campus Demo Data vs. SQL Schema Disconnect:**
- Files: `backend/atlas/agents/*.js`, `backend/atlas/data/demoStudents.js`, `backend/atlas/campus/schemas/001_initial_student_schema.sql`
- Why fragile: Agents currently query hardcoded in-memory arrays in `backend/atlas/data/` rather than the PostgreSQL schema. Any updates to data models must be manually synchronized.
- Safe modification: Implement data access repository layer (`backend/atlas/campus/repositories/`) to abstract database queries from agent logic.

## Scaling Limits

**Single-File JSON Storage:**
- Current capacity: ~67 KB (`backend/data/store.json`)
- Limit: Performance and memory degrade significantly above a few megabytes; concurrent operations lead to race conditions.
- Scaling path: Migrate to PostgreSQL using the existing schema in `001_initial_student_schema.sql`.

## Dependencies at Risk

**Ollama Local CPU Inference Bottleneck:**
- Risk: Local inference on 2 vCPU VMs with `gemma4:e2b` can experience high token latency during peak workloads.
- Impact: Streaming delays in the frontend chat interface.
- Migration plan: Cloud fallback logic to Gemini 3.8 Flash is already implemented and handles traffic if Ollama is unresponsive.

## Missing Critical Features

**Frontend Views for Campus Modules:**
- Problem: The UI only provides Chat and Integrations tabs (`frontend/frontend/src/App.jsx`). The 5 dedicated campus tabs (Home, Academics, Campus, Events, Communication) are missing from the navigation.
- Blocks: Users cannot visually interact with academic profiles, facility schedules, event calendars, or announcement feeds.

**Lack of Live Database Integration:**
- Problem: Relational DDL exists in `backend/atlas/campus/schemas/001_initial_student_schema.sql`, but no database driver (e.g. `pg`, Prisma, Kysely) or connection pool is configured.
- Blocks: True relational student persistence and administrative updates.

## Test Coverage Gaps

**Untested Agent Execution & Orchestration:**
- What's not tested: Intent classification, plan decomposition, agent execution, citation generation.
- Files: `backend/atlas/orchestrator/orchestrator.js`, `backend/atlas/agents/*.js`
- Risk: Intent misrouting, unhandled exceptions during query processing, citation inaccuracies.
- Priority: High

**Untested Document Generation:**
- What's not tested: PDF, Word, and Excel generation from Markdown tables and text.
- Files: `backend/docs.js`
- Risk: Rendering crashes on malformed Markdown or edge-case table inputs.
- Priority: Medium

**Untested OAuth & Tool Execution:**
- What's not tested: Google Workspace token refreshing, Gmail listing, Calendar event insertion.
- Files: `backend/tools.js`, `backend/oauth.js`
- Risk: Silent failures during token expiration or API payload format changes.
- Priority: High

---

*Concerns audit: 2026-10-10*
