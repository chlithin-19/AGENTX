---
last_mapped_commit: 5388507e9f3a5d5b9a16089055cce46b10c957a3
last_mapped_at: 2026-10-10
---
# Codebase Structure

**Analysis Date:** 2026-10-10

## Directory Layout

```
AGENTX/
├── backend/                                   # Express backend application
│   ├── atlas/                                 # Atlas Campus Multi-Agent Layer
│   │   ├── agents/                            # Specialized campus domain agents
│   │   ├── campus/                            # Campus data schemas & repositories
│   │   │   ├── repositories/                  # Data access layer specifications
│   │   │   └── schemas/                       # PostgreSQL migration DDL scripts
│   │   ├── data/                              # Demo datasets (students, campus, events)
│   │   ├── knowledge/                         # Knowledge base documents and retriever
│   │   │   └── documents/                     # Authoritative campus policy markdown docs
│   │   ├── orchestrator/                      # Multi-agent intent router & DAG planner
│   │   └── index.js                           # Atlas module root & /api/atlas router
│   ├── data/                                  # Persistent data storage
│   │   ├── docs/                              # Rendered PDF/Word/Excel documents
│   │   └── store.json                         # Global state JSON store
│   ├── docs.js                                # PDFKit, docx, exceljs document generator
│   ├── oauth.js                               # OAuth2 authorization code flow gateway
│   ├── package.json                           # Backend package definition & scripts
│   ├── server.js                              # Primary Express engine & SSE chat router
│   ├── store.js                               # JSON store wrapper & logger
│   └── tools.js                               # Tool execution registry (Google, web search)
├── frontend/                                  # Frontend root & container configs
│   ├── backend/                               # Auxiliary containerized FastAPI service
│   │   ├── app/                               # FastAPI application files
│   │   ├── Dockerfile                         # Python container definition
│   │   └── requirements.txt                   # FastAPI Python dependencies
│   ├── frontend/                              # Authoritative React 18 + Vite SPA
│   │   ├── src/                               # React source code
│   │   │   ├── components/                    # UI component library
│   │   │   │   ├── ChatArea.jsx               # Main interactive chat interface
│   │   │   │   ├── ImageCard.jsx              # Imagen 3 generation view
│   │   │   │   ├── Integrations.jsx           # OAuth integration toggles
│   │   │   │   ├── LatticeLoader.jsx          # Custom loading animation
│   │   │   │   ├── Sidebar.jsx                # Navigation drawer & model indicators
│   │   │   │   └── ThoughtLine.jsx            # Agent reasoning status badge
│   │   │   ├── App.css                        # Application theme & layout styling
│   │   │   ├── App.jsx                        # Application root component
│   │   │   ├── index.css                      # Global design system & token definitions
│   │   │   └── main.jsx                       # React DOM root render entry point
│   │   ├── index.html                         # HTML5 shell entry
│   │   ├── package.json                       # Frontend dependencies & build scripts
│   │   └── vite.config.js                     # Vite build & proxy configuration
│   ├── nginx/                                 # Container reverse proxy configuration
│   │   └── nginx.conf                         # Nginx routing rules
│   ├── compose.yaml                           # Multi-container Docker Compose file
│   └── deploy_frontend.sh                     # Legacy shell deployment script
├── tts/                                       # Piper Neural Text-to-Speech Engine
│   ├── piper/                                 # Pre-compiled Piper binary and dependencies
│   │   ├── espeak-ng-data/                    # Phonemization data dictionary
│   │   ├── libonnxruntime.so                  # ONNX Runtime shared library
│   │   └── piper                              # Standalone Piper CLI executable
│   ├── en_US-amy-medium.onnx.json             # English speech model configuration
│   └── te_IN-padmavathi-medium.onnx.json      # Telugu speech model configuration
├── .planning/                                 # Project planning & codebase maps
│   └── codebase/                              # GSD Codebase map documents
├── AGENTX_TO_ATLAS_ARCHITECTURE_v2.md         # Master architectural specification
├── ATLAS_DATA_ARCHITECTURE_PLAN.md            # Relational database & RAG plan
├── ATLAS_FRONTEND_AUDIT.md                    # In-depth frontend component audit
├── ATLAS_MVP_IMPLEMENTATION.md                # Multi-agent MVP verification report
├── atlas-nginx.conf                           # Production host Nginx configuration
├── README.md                                  # Executive summary & quickstart guide
└── setup_vm.sh                                # Azure VM bootstrap script
```

## Directory Purposes

**`backend/`:**
- Purpose: Primary application server handling API requests, LLM execution, OAuth integrations, and background task loops.
- Contains: Node.js server scripts, JSON store, document builders, and the Atlas multi-agent module.
- Key files: `backend/server.js`, `backend/store.js`, `backend/tools.js`, `backend/oauth.js`, `backend/docs.js`.

**`backend/atlas/`:**
- Purpose: Additive namespace containing the Atlas Campus Multi-Agent Intelligence Layer.
- Contains: Agent implementations, data repositories, SQL schemas, demo data, RAG retriever, and orchestrator.
- Key files: `backend/atlas/index.js`, `backend/atlas/orchestrator/orchestrator.js`, `backend/atlas/knowledge/retriever.js`.

**`frontend/frontend/`:**
- Purpose: Active React 18 single-page application and UI styling.
- Contains: React components, design system CSS, Vite configuration, and web assets.
- Key files: `frontend/frontend/src/App.jsx`, `frontend/frontend/src/components/ChatArea.jsx`, `frontend/frontend/src/components/Sidebar.jsx`.

**`frontend/backend/`:**
- Purpose: Containerized auxiliary Python FastAPI service for containerized environments.
- Contains: Minimal FastAPI server and requirements.
- Key files: `frontend/backend/app/main.py`, `frontend/backend/requirements.txt`.

**`tts/`:**
- Purpose: Offline neural text-to-speech runtime using Piper and ONNX.
- Contains: Model configuration files, ONNX runtime binaries, and phonemization dictionaries.
- Key files: `tts/piper/piper`, `tts/en_US-amy-medium.onnx.json`, `tts/te_IN-padmavathi-medium.onnx.json`.

## Key File Locations

**Entry Points:**
- `backend/server.js`: Express HTTP server and SSE streaming entry point
- `backend/atlas/index.js`: Atlas campus intelligence router factory
- `frontend/frontend/src/main.jsx`: React DOM mount entry
- `frontend/backend/app/main.py`: Python FastAPI ASGI entry

**Configuration:**
- `backend/.env.example`: Backend environment variable template
- `frontend/frontend/vite.config.js`: Vite build and dev server configuration
- `atlas-nginx.conf`: Nginx server block configuration for `atlas.oqens.me`
- `frontend/compose.yaml`: Docker Compose multi-service definition

**Core Logic:**
- `backend/atlas/orchestrator/orchestrator.js`: Intent decomposition, agent execution, citation synthesis
- `backend/atlas/agents/academic.js`: Academic and placement intelligence logic
- `backend/atlas/agents/campus.js`: Campus facility and maintenance logic
- `backend/atlas/knowledge/retriever.js`: Semantic keyword-based chunk retriever
- `backend/tools.js`: External tool integration runners (Google, web search)
- `backend/store.js`: JSON persistence layer

**Testing:**
- Not detected: No unit, integration, or E2E test files currently exist in the repository.

## Naming Conventions

**Files:**
- JavaScript modules: `camelCase.js` (e.g. `server.js`, `oauth.js`, `retriever.js`, `demoStudents.js`)
- React components: `PascalCase.jsx` (e.g. `ChatArea.jsx`, `Sidebar.jsx`, `ThoughtLine.jsx`)
- SQL migrations: `NNN_snake_case.sql` (e.g. `001_initial_student_schema.sql`)
- Documentation: `UPPER_SNAKE_CASE.md` or `UPPERCASE.md` (e.g. `README.md`, `ATLAS_MVP_IMPLEMENTATION.md`)

**Directories:**
- Modules & Packages: `lowercase` or `kebab-case` (e.g. `backend`, `frontend`, `knowledge`, `orchestrator`)

## Where to Add New Code

**New Campus Agent:**
- Implementation: `backend/atlas/agents/<agent_name>.js`
- Registration: Register agent in `backend/atlas/orchestrator/orchestrator.js` and `backend/atlas/index.js`
- Tests: `backend/test/atlas/<agent_name>.test.js`

**New Campus Domain Data / Repositories:**
- Demo dataset: `backend/atlas/data/demo<Domain>.js`
- SQL Schema: `backend/atlas/campus/schemas/00X_<name>.sql`
- Repository abstraction: `backend/atlas/campus/repositories/<domain>Repository.js`

**New Frontend View / Navigation Tab:**
- Component: `frontend/frontend/src/components/<ViewName>.jsx`
- Layout/Routing: Update navigation in `frontend/frontend/src/components/Sidebar.jsx` and tab switcher in `frontend/frontend/src/App.jsx`

**New Knowledge Document:**
- Content: Add markdown document in `backend/atlas/knowledge/documents/<topic>.md`

## Special Directories

**`.planning/`:**
- Purpose: Project roadmap, codebase map, requirements, and progress state tracking
- Generated: Managed by GSD workflows
- Committed: Yes

**`backend/data/`:**
- Purpose: Stores live runtime JSON state (`store.json`) and generated documents (`docs/`)
- Generated: Yes (partially)
- Committed: `store.json` committed with initial state, `.tmp` and temporary docs ignored

**`tts/piper/`:**
- Purpose: Native C++ Piper binaries and pre-compiled libraries
- Generated: Pre-packaged / compiled
- Committed: Yes

---

*Structure analysis: 2026-10-10*
