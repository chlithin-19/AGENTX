# ATLAS LOCAL DEVELOPMENT GUIDE
## Complete Setup, Run Commands, Testing & Troubleshooting Guide

**System:** ATLAS Campus Multi-Agent AI  
**Repository:** AGENTX  
**Platform:** Windows / macOS / Linux  

---

### 1. Prerequisites

Before running ATLAS, ensure you have the following installed:
1. **Node.js:** v20.0.0 or higher (v22.14.0 LTS recommended).
2. **Ollama:** Installed and available in PATH (download from [ollama.com](https://ollama.com)).
3. **Model:** `gemma4:e2b` installed in Ollama.
   ```bash
   ollama pull gemma4:e2b
   ```
4. **Git:** Standard git client.

---

### 2. Quick-Start Guide (Step-by-Step)

#### Step 1: Clone & Install Dependencies
From the repository root directory:
```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend/frontend
npm install
cd ../..
```

#### Step 2: Environment Configuration
Copy `.env.example` to `.env` in the root or `backend/.env`:
```env
PORT=8080
APP_BASE=http://localhost:8080
FRONTEND_URL=http://localhost:5173
OLLAMA_BASE_URL=http://127.0.0.1:11434
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Step 3: Start the Local Ollama Daemon
In a dedicated terminal:
```bash
ollama serve
```
Verify the daemon is running by visiting `http://127.0.0.1:11434` or running:
```bash
curl http://127.0.0.1:11434/api/tags
```

#### Step 4: Start the ATLAS Backend Server
In a second terminal:
```bash
cd backend
npm start
```
The server will start on `http://localhost:8080`.
The database (`backend/data/campus.db`) will auto-initialize in WAL mode with all normalized tables and cohort benchmarks.

#### Step 5: Start the ATLAS Frontend Dev Server
In a third terminal:
```bash
cd frontend/frontend
npm run dev
```
Open your browser to `http://localhost:5173`.

---

### 3. Running Automated Tests

#### 3.1 Unit & Integration Test Suite (111 Tests)
Runs in ~700ms without requiring a live server or internet:
```bash
cd backend
npm test
```

#### 3.2 Master 30-Scenario Live Acceptance Suite (30 Scenarios)
Requires the backend server (`:8080`) and Ollama (`:11434`) to be running:
```bash
cd backend
npm run test:acceptance
```

#### 3.3 Frontend Production Build Verification
Verifies that all 4,585 React/Vite modules compile cleanly:
```bash
cd frontend/frontend
npm run build
```

---

### 4. Development Persona Switching

In development mode (`NODE_ENV=development`), ATLAS enables frictionless persona switching across 5 test personas via the UI top bar or HTTP headers:

| Persona ID | Name | Role | Department | Special Characteristics |
| :--- | :--- | :--- | :--- | :--- |
| **1 (Default)** | Alex Kumar | Student | IT | CGPA: 7.53, 0 Backlogs, 77.46% Attendance |
| **2** | Priya Sharma | Student | CSE | CGPA: 8.92, Top 5% Cohort Benchmark |
| **3** | Rahul Verma | Student | ECE | CGPA: 6.45, Condonation Attendance Alert |
| **4** | Prof. Rajesh Nair | Faculty | IT | Can audit IT department students; blocked from ECE |
| **5** | Dr. Aris Thorne | Admin | All | University-wide access; maintenance ticket management |

To simulate an identity in API requests:
```bash
curl -H "x-atlas-dev-persona-id: 2" http://localhost:8080/api/atlas/academics/profile
```

---

### 5. Troubleshooting & Diagnostics

#### 1. Port 8080 Already in Use
Find and terminate the process holding port 8080:
```powershell
# Windows PowerShell
netstat -ano | findstr :8080
taskkill /F /PID <PID>
```

#### 2. Ollama Connection Refused
Ensure the Ollama process is active. Check with:
```powershell
curl http://127.0.0.1:11434
```
If not active, run `ollama serve`.

#### 3. Gemini Cloud Rate Limits (429) or Network Jitter
ATLAS includes an intelligent fallback mechanism. If Google Gemini experiences network latency exceeding 10 seconds or returns an HTTP 429 rate limit, ATLAS automatically routes the request to your local Ollama daemon (`gemma4:e2b`). If Ollama is also busy or unreachable, ATLAS provides instant degraded campus guidance in under 10ms.
