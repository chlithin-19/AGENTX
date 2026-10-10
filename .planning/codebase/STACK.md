---
last_mapped_commit: 5388507e9f3a5d5b9a16089055cce46b10c957a3
last_mapped_at: 2026-10-10
---
# Technology Stack

**Analysis Date:** 2026-10-10

## Languages

**Primary:**
- JavaScript (ES Modules, JSX) - Backend Express runtime (`backend/server.js`), Atlas modular agents and data (`backend/atlas/`), and React frontend (`frontend/frontend/src/`)

**Secondary:**
- Python 3.10+ - Containerized auxiliary FastAPI service (`frontend/backend/app/main.py`)
- SQL (PostgreSQL 14+ DDL) - Institutional schema definition (`backend/atlas/campus/schemas/001_initial_student_schema.sql`)
- Bash / Shell - VM deployment and provisioning automation (`setup_vm.sh`, `frontend/deploy_frontend.sh`, `frontend/setup.sh`)
- C / C++ - Pre-compiled Piper neural TTS runtime binaries and shared libraries (`tts/piper/`)

## Runtime

**Environment:**
- Node.js >= 20.x (`backend/package.json`, `frontend/frontend/package.json`)
- Python >= 3.10 (`frontend/backend/requirements.txt`)
- Linux x86_64 native binaries (`tts/piper/piper`)

**Package Manager:**
- npm - Node package manager (`backend/package-lock.json`, `frontend/frontend/package-lock.json`)
- Lockfile: Present (`backend/package-lock.json`, `frontend/frontend/package-lock.json`)

## Frameworks

**Core:**
- Express 4.21.2 - Primary backend HTTP server, SSE streaming, OAuth handling, and Atlas orchestrator router (`backend/server.js`, `backend/atlas/index.js`)
- React 18.2.0 - Single-page user interface (`frontend/frontend/src/App.jsx`)
- FastAPI >= 0.111.0 - Secondary Python microservice API (`frontend/backend/app/main.py`)

**Testing:**
- None detected - No test framework or runner is configured in `backend/package.json` or `frontend/frontend/package.json`; no project unit or integration tests exist.

**Build/Dev:**
- Vite 5.2.0 - Frontend build tool, bundler, and development server (`frontend/frontend/vite.config.js`)
- @vitejs/plugin-react 4.2.1 - React JSX compilation plugin for Vite (`frontend/frontend/package.json`)

## Key Dependencies

**Critical:**
- `@google/genai` (^2.26.0) - Official Google GenAI SDK for Gemini 3.8 Flash, multimodal audio transcription, and Imagen 3 generation (`backend/server.js`)
- `express` (^4.21.2) - Core web application framework and routing engine (`backend/server.js`, `backend/atlas/index.js`)
- `react` / `react-dom` (^18.2.0) - UI component model and DOM rendering (`frontend/frontend/src/main.jsx`)
- `ollama` (Local HTTP daemon) - Edge LLM inference engine running Gemma 4 E2B on CPU (`http://127.0.0.1:11434`)

**Infrastructure:**
- `cors` (^2.8.5) - Cross-Origin Resource Sharing middleware for frontend/backend communication (`backend/server.js`)
- `pdfkit` (^0.19.1) - PDF generation utility for executive and student reports (`backend/docs.js`)
- `docx` (^9.7.1) - Word document (.docx) generation utility (`backend/docs.js`)
- `exceljs` (^4.4.0) - Spreadsheet workbook generation utility (`backend/docs.js`)
- `@phosphor-icons/react` (^2.1.5) - Icon system for the React UI (`frontend/frontend/src/components/Sidebar.jsx`)
- `uvicorn` (>=0.30.0) - ASGI server for Python microservice (`frontend/backend/requirements.txt`)
- `pydantic` (>=2.7.0) - Data validation for Python microservice (`frontend/backend/requirements.txt`)

## Configuration

**Environment:**
- Environment variables loaded via `.env` file (modeled in `backend/.env.example`)
- Key configs required:
  - `PORT`: HTTP port (defaults to 8080)
  - `APP_BASE`: Backend root URL (defaults to `http://localhost:8080` / `https://atlas.oqens.me`)
  - `FRONTEND_URL`: Allowed CORS origin (defaults to `http://localhost:5173`)
  - `OLLAMA_URL`: Local LLM endpoint (defaults to `http://127.0.0.1:11434`)
  - `DEFAULT_MODEL` / `AGENT_MODEL`: Local model tag (`gemma4:e2b`)
  - `GEMINI_API_KEY`: Google Gemini authentication token
  - `GEMINI_MODEL` / `REASON_MODEL`: Cloud reasoning model tag (`gemini-3.8-flash`)
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: OAuth credentials for Gmail & Calendar
  - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: OAuth credentials for GitHub
  - `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`: OAuth credentials for LinkedIn

**Build:**
- `frontend/frontend/vite.config.js` - Vite development server proxying and React plugin
- `atlas-nginx.conf` and `frontend/nginx/nginx.conf` - Nginx reverse proxy configuration
- `frontend/compose.yaml` - Docker Compose configuration for multi-container deployment

## Platform Requirements

**Development:**
- Node.js >= 20.x, npm >= 9.x
- Local Ollama daemon running at `http://127.0.0.1:11434` with model `gemma4:e2b`
- Valid `GEMINI_API_KEY` for cloud reasoning and multimodal services

**Production:**
- Linux VM (Ubuntu 22.04 LTS, e.g. Azure Standard D2s v3: 2 vCPU, 8 GB RAM)
- Nginx reverse proxy terminating SSL for `atlas.oqens.me`
- Node.js systemd service or Docker Compose cluster (`frontend/compose.yaml`)

---

*Stack analysis: 2026-10-10*
