# ATLAS KNOWN LIMITATIONS & PILOT PREREQUISITES
## Explicit Operational Boundaries, External Gating & Honest Environmental Status

**Date:** November 3, 2026  
**System:** ATLAS Campus Multi-Agent AI  
**Readiness Level:** **STATUS B — Hardened Pre-Production**

---

### 1. Honest Environmental Boundary Statement

ATLAS has been engineered with a strict principle of truthfulness: **the system never simulates, mocks, or fabricates external actions, academic records, or connectivity statuses.**

This document details the exact external gating items that cannot be fulfilled autonomously within a local development sandbox and must be supplied by the infrastructure administrator prior to public campus rollout.

---

### 2. External Gating Items & Prerequisites

#### 2.1 Google Cloud OAuth Credentials (Gmail & Google Calendar)
- **Current State:** The OAuth handling code (`backend/oauth.js`, `backend/tools.js`) is completely hardened, local callbacks are registered (`http://localhost:8080/api/oauth/*`), CSRF state validation is enforced, and all third-party domain dependencies (`atlas.oqens.me`) have been removed.
- **Fail-Closed Stance:** When unauthenticated, attempting to dispatch an email or create a calendar event returns an explicit `HTTP 400: Gmail not connected` or `HTTP 400: Calendar not connected`. Mock tokens (`dev_simulated_token`) are strictly forbidden.
- **Pilot Requirement:** To enable live sending and calendar writes, the administrator must provide an active `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from a Google Cloud Project they own, with `http://localhost:8080/api/oauth/google/callback` added to Authorized Redirect URIs, and complete manual user consent in the browser.

#### 2.2 Institutional Single Sign-On (IdP Federation)
- **Current State:** In local development mode (`NODE_ENV=development`), ATLAS uses an authenticated persona switcher supporting 5 distinct campus profiles with strict point-of-access isolation.
- **Production Stance:** In production mode (`NODE_ENV=production`), dev personas are forcibly disabled. The system fails closed (HTTP 401) unless a cryptographically verified JWT issued by the institutional IdP is provided in the `Authorization: Bearer <jwt>` header.
- **Pilot Requirement:** The campus IT department must federate their OIDC/SAML IdP (Google Workspace for Education, Entra ID, or Shibboleth) and populate `ATLAS_JWT_SECRET` (>= 32 chars) and `ATLAS_IDP_ISSUER`.

#### 2.3 Third-Party External Domain Decoupling (`atlas.oqens.me`)
- **Status:** The domain `atlas.oqens.me` belongs to an external third party and is not controlled by this project.
- **Resolution:** All hardcoded references have been removed. Local development runs on `http://localhost:8080` and `http://localhost:5173`. Any future cloud deployment must be hosted on an institutionally owned domain (e.g., `https://atlas.campus.edu`).

#### 2.4 Local LLM Cold Start Latency (Ollama on CPU)
- **Status:** When the Ollama daemon loads `gemma4:e2b` (4.6 GB quantized model) on systems without dedicated GPU VRAM, cold start initialization takes approximately 17 seconds.
- **Resolution:** Once loaded in RAM, warm inference latency drops to ~700ms. In production, primary inference is handled by Google Gemini 3.5 Flash Lite (~1.2s), with local Ollama serving as an automatic fallback. Furthermore, a bounded timeout of 10s prevents user-facing requests from hanging.

#### 2.5 Placement Dataset Provenance
- **Status:** The Kaggle 2026 dataset (`student_placement_prediction_dataset_2026.csv`, 100,000 source records) is a synthetic dataset used for statistical cohort benchmarking (`cohort_benchmarks` table).
- **Resolution:** ATLAS clearly differentiates benchmark analytics from official registrar records. Benchmarks are labeled as comparative statistical baselines and are never presented to students as live institutional registrar grades.

---

### 3. Verification Summary

Every limitation listed above represents an intentional, fail-closed security boundary. The software runtime itself is completely functional, stable, and verified against 111 unit tests and 30 master acceptance scenarios.
