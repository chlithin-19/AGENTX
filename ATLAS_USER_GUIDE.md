# ATLAS USER GUIDE
## Comprehensive Walkthrough of the 7 Functional Campus Views & Capabilities

**System:** ATLAS Campus Multi-Agent AI  
**Design Contract:** Clean Minimalist `#F4F8FC`, `#0B1528`, `#0062FF`, Plus Jakarta Sans  
**Target Users:** Students, Faculty Advisors & Campus Administrators

---

### 1. View 1: Home Dashboard (`/`)

The Home Dashboard provides an immediate executive summary of the student's campus status upon logging in:
- **Student Profile Card:** Displays name, student ID, department, and semester.
- **Key Metrics Row:**
  - **CGPA Card:** Real-time cumulative GPA alongside cohort benchmark average.
  - **Attendance Card:** Current attendance percentage with clear regulatory status (Normal vs. Condonation Warning).
  - **Active Registrations:** Count of registered upcoming events.
  - **Open Tickets:** Track ongoing facilities maintenance requests.
- **Quick Action Launcher:** Buttons to immediately Ask Atlas ("Check my backlogs", "Where is the health center?", "Show upcoming hackathons").
- **Recent Circulars Feed:** Highlighting the latest campus announcements.

---

### 2. View 2: Ask Atlas — Conversational Intelligence (`/chat`)

The conversational interface is powered by ATLAS's multi-agent orchestrator:
- **Real-Time Token Streaming:** Responses stream word-by-word with ultra-low time-to-first-token (TTFT).
- **Multi-Agent Orchestration Visualizer:** Below the prompt, ATLAS displays the active agent execution path (e.g., `Academic Agent -> Campus Agent -> Synthesis`).
- **Authentic Citations & Source Badges:**
  - When referencing institutional regulations (e.g., attendance policy), ATLAS displays clickable citation badges displaying the document name and verified SHA-256 chunk hash (e.g., `[attendance.md#7f8a1e]`).
- **Interactive Action Cards:**
  - When an agent proposes a consequential action (such as filing a maintenance ticket or drafting an email), it renders an interactive approval card with the exact action parameters.
  - Clicking **"Confirm Action"** securely dispatches the single-use token to execute the operation.

---

### 3. View 3: Academics & Placement Analytics (`/academics`)

Designed for comprehensive academic tracking and career readiness analysis:
- **Academic Scorecard:** Detailed view of current CGPA, total credit hours completed, and backlog status.
- **Cohort Placement Benchmarks:** Interactive comparison showing how the student's CGPA, technical skills, and internship count compare against the 10,000-student cohort baseline.
- **Attendance Analysis Meter:** Visual breakdown of attendance by subject, with alerts if any course dips below the mandatory 75% threshold.
- **Skill Profile:** Badges representing recorded programming languages, frameworks, and tools.
- **Export Transcripts:** Generate and download official academic summaries in PDF, Excel, or Word formats with one click.

---

### 4. View 4: Campus Facilities & Operations (`/campus`)

Directory and maintenance portal for institutional infrastructure:
- **Facility Directory:** Searchable grid covering the Central Library, Computer Center, Health Center, Cafeteria, and Sports Complex.
- **Operating Status & Hours:** Real-time indicators showing whether facilities are currently open, weekend timings, and specific room locations.
- **Maintenance Ticket Submission:**
  - Submit issues regarding broken hardware, air conditioning, projector malfunctions, or plumbing.
  - Automatic ticket ID assignment and status tracking (`submitted`, `in_progress`, `resolved`).

---

### 5. View 5: Campus Events & Hackathons (`/events`)

The central hub for campus extracurriculars, technical symposiums, and cultural festivals:
- **Event Feed:** Cards detailing event dates, venues, organizers, registration deadlines, and eligibility.
- **1-Click Registration:** Click "Register" to immediately book a seat.
- **Duplicate Registration Guard:** Prevents accidental double-registrations, showing clear confirmation if already registered.
- **My Registrations:** A dedicated tab filtering the events you are actively attending.

---

### 6. View 6: Communication Circulars & Notices (`/circulars`)

Administrative circulars, university notifications, and academic timetables:
- **Category Filter Tabs:** Quickly filter between `All`, `Academic`, `Administrative`, `Facilities`, and `Events`.
- **Search Bar:** Real-time text search indexing circular titles, issuance dates, and content summaries.
- **Download Attached Notices:** Direct links to download official PDF notices.

---

### 7. View 7: Settings & Integrations (`/settings`)

User preferences and external service connections:
- **Google Workspace Integration:**
  - Connect your Google account to authorize Gmail sending and Google Calendar event scheduling.
  - Status indicator clearly displays `Connected` or `Disconnected` based on authentic token presence.
- **Developer Persona Switcher (Dev Mode Only):**
  - Instant toggle between 5 test personas (Alex Kumar, Priya Sharma, Rahul Verma, Prof. Rajesh Nair, Dr. Aris Thorne).
- **Appearance:** Toggle between Crisp Light Mode (`#F4F8FC`) and High-Contrast Dark Mode.
