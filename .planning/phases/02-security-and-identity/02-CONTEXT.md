# Phase 02 Context: Security, Authentication & Student Data Isolation

## Domain Context
Before Atlas connects to persistent student records, campus databases, or real campus operations, it must establish a defensible security architecture. The current MVP operates with an unauthenticated, single-user identity (`Alex Kumar, ID: 1`) hardcoded into `backend/server.js`, and lacks authorization boundaries, student isolation, or protected action confirmation.

This phase establishes production-grade security invariants while preserving development flexibility through an explicit, fail-closed development simulation boundary.

---

## Core Security Invariants

### 1. Trusted Identity & Environment Gating
- **Auth Modes:** Controlled via `ATLAS_AUTH_MODE` (`'development'` | `'production'`).
- **Production Mode (`ATLAS_AUTH_MODE=production`):**
  - Identity **must** originate from a server-validated session cookie or verified JWT/Bearer token.
  - Client-supplied identity headers (`x-atlas-user-id`, `x-atlas-role`) are **strictly rejected with HTTP 400 or stripped**.
  - If a production Identity Provider (IdP) is not configured, protected endpoints fail closed with HTTP 401 (`AUTHENTICATION_REQUIRED`). The application must never claim to be production-authenticated without a verified IdP.
- **Development Mode (`ATLAS_AUTH_MODE=development` / `NODE_ENV !== 'production'`):**
  - Explicitly labeled as a simulation mode via response header `X-Atlas-Auth-Mode: development-simulation`.
  - Resolves persona from an explicit development session or validated `x-atlas-dev-persona-id` header matched against approved test fixtures.
  - Safe local fallback defaults to Alex Kumar with an explicit audit warning.

### 2. Point-of-Access Authorization & Data Isolation
- Authorization **must not** rely on guessing student names in natural-language queries.
- Authorization is evaluated **at the point of data access** (repository accessors and agent action dispatchers) using a typed security gate: `assertStudentAccess(reqUser, targetStudent)`.
- **Role Permissions & Scopes:**
  - **Student (`student`):** Strictly isolated. A student can only query and retrieve their own records (`targetStudent.student_id === reqUser.studentId`). Any access attempt outside their own account is rejected with HTTP 403 Forbidden (`FORBIDDEN_STUDENT_ISOLATION`) without leaking private data.
  - **Faculty (`faculty`):** Department-scoped. A faculty member can only audit students enrolled in their assigned department (`targetStudent.branch === reqUser.department`). Access outside their departmental scope is rejected with HTTP 403 Forbidden (`FORBIDDEN_DEPARTMENT_SCOPE`).
  - **Admin (`admin`):** Institutional audit access across all departments, accompanied by mandatory structured audit logs.

### 3. Consequential Action Confirmation Lifecycle
High-consequence side-effects (e.g. submitting facilities maintenance work orders, publishing or drafting official campus broadcast messages) require a server-validated confirmation lifecycle:
1. **Creation:** Proposing agent generates an action intent with an unguessable cryptographic token (`crypto.randomBytes(32).toString('hex')`).
2. **Binding:** The confirmation record binds:
   - `token`: Unique cryptographic nonce.
   - `userId`: Exact `req.user.id` initiating the action.
   - `actionType`: Type identifier (`campus.create_maintenance_ticket`, `communication.draft_broadcast`).
   - `payloadHash`: SHA-256 hash of the normalized action arguments.
   - `expiresAt`: Expiration timestamp (strictly 5 minutes from creation).
   - `consumed`: Boolean flag preventing replay attacks.
3. **Execution Gate:** The confirmation endpoint validates that the token exists, is not expired, has not been consumed, matches the authenticated `userId`, and verifies that the executed payload matches `payloadHash`. It marks `consumed = true` immediately before executing the side effect.

### 4. Frontend Persona Simulator Boundary
- Located in `SettingsView.jsx`.
- Clearly labeled: `DEVELOPMENT TEST SIMULATOR ONLY · NOT FOR PRODUCTION`.
- Automatically hidden/disabled when `import.meta.env.PROD` or when the backend indicates production auth mode.
- Does not grant privileges that the backend would otherwise deny.

### 5. Regression Protection
- 100% preservation of `/api/chat` request body and SSE event streaming format (`step`, `token`, `action`, `attachments`, `done`).
- 100% preservation of `/api/history`, existing integrations, tools, and background jobs.
