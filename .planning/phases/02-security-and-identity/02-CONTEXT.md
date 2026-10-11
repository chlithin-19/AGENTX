# Phase 02 Context: Security, Authentication & Student Data Isolation

## Domain Context
Before Atlas connects to persistent student records, campus databases, or real campus operations, it must establish a defensible, production-grade security architecture. The current MVP operates with an unauthenticated, single-user identity (`Alex Kumar, ID: 1`) hardcoded into `backend/server.js`, and lacks authorization boundaries, student isolation, or protected action confirmation.

This phase establishes production-grade security invariants while preserving development flexibility through an explicit, fail-closed development simulation boundary.

---

## Core Security Invariants

### 1. Trusted Identity & Fail-Closed Production Gating
- **Strict Environment Separation:**
  - Whenever `NODE_ENV === 'production'`, development persona simulation is **unconditionally disabled**, regardless of any `ATLAS_AUTH_MODE` setting.
  - Conflicting or unsafe configurations (e.g. attempting to enable development personas while `NODE_ENV === 'production'`) are **rejected at startup**.
  - In production mode, client identity headers (`x-atlas-dev-persona-id`, `x-atlas-user-id`, `x-atlas-role`) are **strictly rejected with HTTP 400 Bad Request**.
- **Cryptographically Verified Identity:**
  - Production identity must originate from an actually implemented, cryptographically verified token (HMAC-SHA256 / RSA signature verified against configured institutional secret) or server-validated session. Decoded-but-unverified JWTs, arbitrary cookies, or client identity headers are never trusted.
  - **No False Claims:** If no genuine authentication verifier or institutional Identity Provider (IdP) is configured, protected production routes **fail closed with HTTP 401 Unauthorized (`AUTHENTICATION_REQUIRED`)**. The application must never claim to be production-authenticated without a verified IdP.
- **Quarantined Development Mode (`NODE_ENV !== 'production'`):**
  - Explicitly marked via response header `X-Atlas-Auth-Mode: development-simulation`.
  - Resolves persona from an explicit development session or validated `x-atlas-dev-persona-id` header matched against approved test fixtures.
  - Safe local fallback defaults to Alex Kumar with an explicit audit warning.

### 2. Point-of-Access Authorization & Department-Scoped RBAC
- Authorization **must not** rely on guessing student names in natural-language queries.
- Authorization is evaluated **at the point of data access** (repository accessors and agent action dispatchers) using a typed security gate: `assertStudentAccess(reqUser, targetStudent)`.
- **Role Permissions & Scopes:**
  - **Student (`student`):** Strictly isolated. A student can only query and retrieve their own records (`targetStudent.student_id === reqUser.studentId`). Any access attempt outside their own account is rejected with HTTP 403 Forbidden (`FORBIDDEN_STUDENT_ISOLATION`) without leaking private data.
  - **Faculty (`faculty`):** Department-scoped. A faculty member can only audit students enrolled in their assigned department (`targetStudent.branch === reqUser.department`). Access outside their departmental scope is rejected with HTTP 403 Forbidden (`FORBIDDEN_DEPARTMENT_SCOPE`).
  - **Admin (`admin`):** Institutional audit access across all departments, accompanied by mandatory structured audit logs.

### 3. Hardened Consequential Action Confirmation Lifecycle
High-consequence side-effects (e.g. submitting facilities maintenance work orders, publishing or drafting official campus broadcast messages) require an atomic, server-validated confirmation lifecycle:
1. **Creation & Proposal Storage:**
   - Proposing agent generates an unguessable cryptographic token (`crypto.randomBytes(32).toString('hex')`).
   - The confirmation store saves the **exact normalized server-side action proposal** alongside the token:
     - `token`: Unique cryptographic nonce.
     - `userId`: Exact `req.user.id` initiating the proposal.
     - `actionType`: Allowlisted action identifier (`campus.create_maintenance_ticket`, `communication.draft_broadcast`).
     - `storedProposal`: The complete, frozen parameters of the action constructed on the server.
     - `payloadHash`: SHA-256 hash of the normalized proposal.
     - `expiresAt`: Expiration timestamp (strictly 5 minutes from creation).
     - `consumed`: Atomic boolean flag preventing replay attacks.
2. **Approval Request:** The UI receives `{ requiresConfirmation: true, confirmationToken, actionType, summary }`.
3. **Execution Gate (`POST /api/atlas/actions/confirm`):**
   - The confirmation endpoint receives `{ confirmationToken }`.
   - **Crucial Security Invariant:** The server executes the **stored proposal**, **NOT** client-supplied execution arguments! This completely eliminates parameter-tampering attacks.
   - **Atomic Consumption:** Token is consumed atomically in a single operation (`if (record.consumed) return 409 Conflict; record.consumed = true;`). Concurrent requests cannot execute the same token more than once.
   - **Authorization Re-Validation:** Re-validates that `record.userId === req.user.id` and that `req.user` still possesses the required role/permissions at execution time.
   - **Safe Error Handling:** Expired tokens return 410 Gone; unauthorized or missing tokens return 403/404; side-effect failures are logged without consuming unexecuted retries.

### 4. Frontend Persona Simulator Boundary
- Located in `SettingsView.jsx`.
- Rendered **only** when running in development mode (`import.meta.env.DEV`). Omitted from the DOM and disabled in production builds.
- Clearly labeled with prominent warning banner:
  `⚠️ DEVELOPMENT TEST SIMULATOR ONLY · NOT FOR PRODUCTION`
  `Simulated personas are strictly restricted to local development testing and are rejected in production environments.`
- Client-side persona selection cannot grant privileges that the backend would otherwise deny.

### 5. Regression Protection
- 100% preservation of `/api/chat` request body and SSE event streaming format (`step`, `token`, `action`, `attachments`, `done`).
- 100% preservation of `/api/history`, existing integrations, tools, and background jobs.
