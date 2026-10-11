# Atlas Campus Multi-Agent Platform: Production Deployment & Operations Runbook

## 1. System Architecture Overview

The Atlas Campus Platform is an enterprise multi-agent intelligence system built on top of the AGENTX Node.js/Express runtime and React/Vite frontend. It unifies institutional student records, campus infrastructure, event management, and official communications through four specialized agents and an evidence-grounded orchestrator.

```
+--------------------------------------------------------------------------+
|                        Frontend (React / Vite)                           |
|  - Atlas Visual Identity (Ethereal Editorial Tech: Cobalt & Pale Sky)    |
|  - SSE Streaming ChatArea (/api/chat: step, token, action, done)        |
|  - Real-time Subviews: Academics, Facilities, Events, Circulars         |
|  - Interactive Action Approval Guard (Cryptographic Proposal Badges)    |
+--------------------------------------------------------------------------+
                                     |
                                     | HTTP / SSE (EventStream)
                                     v
+--------------------------------------------------------------------------+
|                  Backend API Gateway (Express / Node.js)                 |
|  - Fail-Closed Identity Extractor (HMAC-SHA256 Token Verifier)           |
|  - SSE Event-Stream Router & Client Disconnect Safety                    |
|  - Express Mounts: /api/chat, /api/atlas/* (with /api/actions/confirm alias)
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|             Atlas Campus Intelligence Orchestrator (DAG Engine)          |
|  - Query Intent Decomposition & Follow-up Context Resolution             |
|  - Concurrency Limiter & Safe Batch Wave Scheduling                      |
|  - Bounded Timeouts (AbortController) & Idempotent Retries with Backoff  |
|  - Honest Boundary Handling & Evidence-Grounded Synthesis (Zero Fakery)  |
+--------------------------------------------------------------------------+
         |                     |                   |                   |
         v                     v                   v                   v
+-----------------+   +-----------------+   +---------------+   +------------------+
| Academic Agent  |   |  Campus Agent   |   |  Event Agent  |   |  Comm Agent      |
| - Student Recs  |   | - Facilities    |   | - Hackathons  |   | - Announcements  |
| - Benchmarks    |   | - Durable Tkts  |   | - Workshops   |   | - Action Drafts  |
| - Point-Access  |   | - Room Nav      |   | - Real Regs   |   | - Held Proposals |
+-----------------+   +-----------------+   +---------------+   +------------------+
         |                     |                   |                   |
         +---------------------+-------------------+-------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                   Data & Knowledge Subsystems (Native Node)              |
|  - SQLite (backend/data/campus.db): 10,000 Verified Student Records,     |
|    Cohort Benchmarks, Durable Maintenance Work Orders (WAL Mode)         |
|  - Institutional Knowledge (RAG): SHA-256 Chunk Catalog, Freshness Audit|
|  - Untrusted Text Sanitizer: Prompt Injection Neutralization Engine      |
+--------------------------------------------------------------------------+
```

---

## 2. Production Environment Configuration

All production deployments must configure the following environment variables. The server enforces a fail-closed startup check (`validateSecurityConfig()`) and **will refuse to start** if unsafe settings are detected.

| Variable | Required | Production Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Enforces production security gates. Disables dev personas. |
| `ATLAS_AUTH_MODE` | **Yes** | `production` | Forces strict cryptographic token verification. |
| `ATLAS_JWT_SECRET` | **Yes** | *Min 32 chars* | Cryptographic secret for signing and verifying tokens. |
| `PORT` | Optional | `8080` (or `3000`) | Listening port for the Express backend. |
| `APP_BASE` | Optional | `https://campus.atlas.edu` | Canonical institutional base URL. |
| `OLLAMA_URL` | Optional | `http://127.0.0.1:11434` | Ollama model provider endpoint (if local LLM enabled). |
| `DEFAULT_MODEL` | Optional | `gemma4:e2b` | Primary generation model name. |

> [!IMPORTANT]
> **Fail-Closed Security Guarantee:**
> If `NODE_ENV=production` is set while `ATLAS_DEV_PERSONAS_ENABLED=true` or `ATLAS_JWT_SECRET` is shorter than 32 characters, the application throws a fatal `SecurityConfigurationError` at boot and terminates immediately.

---

## 3. Production Authentication & Token Issuance

In production (`ATLAS_AUTH_MODE=production`), client requests must supply an HMAC-SHA256 Bearer token in the `Authorization` header:

```http
Authorization: Bearer <HMAC-SHA256-Signed-JWT>
```

### Token Claims Structure
Tokens must be signed by the institutional Identity Provider (IdP) using `HS256` and the shared `ATLAS_JWT_SECRET`:

```json
{
  "sub": "1",
  "name": "Alex Kumar",
  "role": "student",
  "department": "IT",
  "iss": "atlas-auth-service",
  "aud": "atlas-campus-platform",
  "exp": 1792000000,
  "iat": 1791996400
}
```

### Strict Verification Rules
1. **Signature Integrity:** Cryptographically verified using constant-time HMAC-SHA256.
2. **Algorithm Tampering:** Tokens with `alg=none`, unsupported algorithms, or malformed headers are rejected with HTTP 401.
3. **Mandatory Expiry:** Tokens missing the `exp` claim or tokens past expiration are rejected with HTTP 401.
4. **Header Spoofing Prevention:** Any request providing `x-atlas-dev-persona-id` in production is rejected with HTTP 400.

> [!IMPORTANT]
> **Production Deployment Prerequisite — External Identity Provider (Unresolved):**
> Atlas enforces strict fail-closed token verification but does NOT operate an internal user-registration or password database. Production operation requires an institutional Identity Provider (IdP) (e.g., University Single Sign-On, Shibboleth, Okta, or Keycloak via OIDC) that issues HMAC-SHA256 tokens signed with `ATLAS_JWT_SECRET`. Without an active IdP or provisioned tokens, production routes fail closed with HTTP 401. Production readiness remains gated until this external integration is configured.

---

## 4. Consequential Action Confirmation Protocol

Consequential side effects (e.g., submitting maintenance tickets, broadcasting announcements) are guarded by a two-phase commit protocol:

1. **Proposal Phase (Agent Output):**
   - The agent constructs a proposal object and invokes `createConfirmationIntent()`.
   - A cryptographically random token (`crypto.randomBytes(32).toString('hex')`) is minted with a 15-minute TTL.
   - The token, proposing user ID, action type, and exact server proposal are stored in the server-side registry.
   - The client receives an action card displaying the proposal and holding the `confirmationToken`. No side effect has taken place.
2. **Confirmation Phase (Client Execution):**
   - The user inspects the proposal card and clicks **Confirm & Execute**.
   - The client submits `POST /api/atlas/actions/confirm` with `{ "confirmationToken": "..." }`.
   - The server verifies:
     - Token exists and has not expired.
     - Authenticated caller matches the proposing user.
     - Token is consumed atomically (single-use replay prevention).
   - The server executes the **stored proposal** (client cannot alter proposal arguments).

---

## 5. Reverse Proxy Configuration (Nginx)

When deploying behind Nginx or an Application Load Balancer, buffering must be disabled to ensure Server-Sent Events (SSE) stream tokens without delay.

```nginx
# /etc/nginx/sites-available/atlas.conf

upstream atlas_backend {
    server 127.0.0.1:8080;
    keepalive 64;
}

server {
    listen 443 ssl http2;
    server_name campus.atlas.edu;

    ssl_certificate /etc/letsencrypt/live/campus.atlas.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/campus.atlas.edu/privkey.pem;

    # Serve static Vite frontend assets
    root /var/www/atlas/frontend/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API and SSE routes to Express backend
    location /api/ {
        proxy_pass http://atlas_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CRITICAL SSE STREAMING SETTINGS
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_set_header Connection '';
        chunked_transfer_encoding off;
    }
}
```

---

## 6. SQLite Database Durability & Backup Runbook

Atlas utilizes native `node:sqlite` connected to `backend/data/campus.db`. The database operates under Write-Ahead Logging (WAL) mode for non-blocking concurrent reads and resilient crash recovery.

### Durability Pragmas
- `PRAGMA journal_mode = WAL;` (Enables concurrent reads and writes).
- `PRAGMA busy_timeout = 5000;` (Waits up to 5 seconds for write locks).
- `PRAGMA foreign_keys = ON;` (Enforces referential integrity across 9 relational tables including maintenance_tickets and event_registrations).

### Online Hot Backup Procedure
To perform a live, hot backup of `campus.db` without stopping the application service:

```bash
# Using SQLite VACUUM INTO to create an atomic point-in-time snapshot
node -e "
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('backend/data/campus.db');
const backupPath = 'backend/data/backups/campus_' + Date.now() + '.db';
db.exec(\"VACUUM INTO '\" + backupPath + \"'\");
console.log('Hot backup created at:', backupPath);
"
```

### Automated Backup Cron
Add the following job to `/etc/cron.d/atlas-db-backup` for daily snapshots:

```cron
0 2 * * * atlas-service /usr/local/bin/atlas-backup.sh >> /var/log/atlas/backup.log 2>&1
```

---

## 7. Health Checks & Observability

### Endpoints for Monitoring & Liveness Probes
1. **Subsystem Health & Metrics:**
   ```http
   GET /api/atlas/status
   ```
   **Expected Response (200 OK):**
   ```json
   {
     "status": "active",
     "system": "Atlas Campus Multi-Agent Intelligence Layer",
     "authMode": "production",
     "isProduction": true,
     "agents": [
       { "name": "academic", "status": "ready" },
       { "name": "campus", "status": "ready" },
       { "name": "event", "status": "ready" },
       { "name": "communication", "status": "ready" }
     ],
     "datasetMetrics": {
       "sqlite": {
         "connected": true,
         "studentsCount": 10000,
         "benchmarksCount": 6,
         "engine": "node:sqlite"
       }
     }
   }
   ```
2. **Backend Gateway Uptime:**
   ```http
   GET /api/health
   ```

---

## 8. Incident Response & Troubleshooting

| Symptom | Probable Cause | Remediation |
| :--- | :--- | :--- |
| `SecurityConfigurationError` at boot | `ATLAS_JWT_SECRET` too short or dev personas enabled in production | Ensure secret is >= 32 characters and `ATLAS_DEV_PERSONAS_ENABLED` is false. |
| SSE messages delayed until completion | Nginx `proxy_buffering` enabled | Set `proxy_buffering off;` and reload Nginx. |
| 401 Unauthorized on chat | Expired or unsigned JWT token | Refresh user token via IdP with matching `ATLAS_JWT_SECRET`. |
| 403 Forbidden on academic profile | Point-of-access isolation violation | Verify caller identity. Students can only query their own ID; faculty can query within department. |
| Database busy or locked error | WAL mode not engaged | Verify WAL pragma is set and SQLite permissions allow `-wal` and `-shm` file creation. |
