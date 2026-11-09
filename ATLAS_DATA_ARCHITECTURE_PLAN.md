# Atlas Data Architecture Plan
## Kaggle Dataset Integration & Canonical Campus Data Blueprint

**Authoritative Architecture Source:** `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md`  
**Repository Audit Reference:** `IMPLEMENTATION_AUDIT.md`  
**Dataset Profiling Reference:** `DATASET_ANALYSIS.md`  
**Inspected Source Asset:** `archive.zip` / `student_placement_prediction_dataset_2026.csv` (100,000 records, 26 columns)  
**Execution Posture:** Strictly architectural planning; no code modification, no database creation, no data ingestion, and no UI development.

---

## 1. Executive Summary & Dataset Reality

### 1.1 Dataset Classification: DEMO / DEVELOPMENT DATA
The provided Kaggle dataset (`student_placement_prediction_dataset_2026.csv`) contains 100,000 synthetic/augmented student records spanning 26 attributes. Profiling reveals:
- It represents an **academic performance, skill evaluation, and career placement outcome dataset** across 6 engineering branches and 3 college tiers.
- It is **DEMO / DEVELOPMENT DATA**. It does not represent an actual single university institution (e.g., Malla Reddy University or any single campus), nor does it map to live student identities.
- It contains **zero records** for physical campus infrastructure (buildings, rooms, labs), facility maintenance tickets, class timetables, individual course codes, student communication contacts (emails, phone numbers), campus announcements, or campus events.
- Unsupported policy rules (such as a 75% attendance cutoff, medical condonation ranges, or placement CGPA cutoffs) are **UNVERIFIED** institutional assumptions and must not be treated as authoritative campus bylaws until official documentation is ingested.

### 1.2 Data Categorization Framework
To prevent architectural drift and ensure alignment with `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md`, all campus information is strictly partitioned into seven distinct categories:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ATLAS DATA UNIVERSE                                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ A. Data We Actually Have:                                                              │
│    - 100,000 Student demographic, academic, skill, portfolio & placement records      │
│ B. Data We Need to Add Later:                                                          │
│    - Courses, subjects, timetables, rooms/labs, maintenance tickets, events, notices   │
│ C. Data That Belongs in PostgreSQL (Structured Relational DB):                         │
│    - All 26 CSV attributes, transactional records, user accounts, workflow states       │
│ D. Data That Belongs in RAG (Semantic Vector Store):                                   │
│    - Official bylaws, academic regulations, syllabi, handbooks, campus guidelines      │
│ E. Data That Should NEVER Be Placed in RAG:                                            │
│    - Raw student rows, private CGPA, individual backlogs, personal placement salaries  │
│ F. Data Requiring Role-Based Access Control (RBAC):                                    │
│    - Student self-records (private), salary packages, backlog records, audit trails     │
│ G. Data Requiring External Integrations:                                               │
│    - Google Calendar (events), Gmail/SMTP (notifications), LinkedIn OAuth, Gemini API  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Canonical Data Model

The canonical model normalizes the flat 26-column CSV into structured 3NF entities while defining the placeholder contracts for future campus entities.

```text
                                  ┌──────────────────────────┐
                                  │       departments        │
                                  │  (branch_code: CSE, IT)  │
                                  └────────────┬─────────────┘
                                               │ 1:N
                                               ▼
┌──────────────────────────┐  1:1 ┌──────────────────────────┐  1:1 ┌──────────────────────────┐
│   users (Future Auth)    ├─────►│         students         │◄────┤  student_academic_records │
│(id, email, role, status) │      │(student_id, age, gender) │     │ (cgpa, att_pct, backlogs)│
└──────────────────────────┘      └────────────┬─────────────┘     └──────────────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               │ 1:1                           │ 1:1                           │ 1:1
               ▼                               ▼                               ▼
┌──────────────────────────┐     ┌──────────────────────────┐     ┌──────────────────────────┐
│  student_skill_profiles  │     │student_portfolio_records │     │ student_placement_records│
│(coding, aptitude, mock)  │     │(internships, projects)   │     │ (status, salary_package) │
└──────────────────────────┘     └──────────────────────────┘     └──────────────────────────┘

══════════════════════════════ FUTURE CAMPUS ENTITIES (UNVERIFIED / MISSING) ══════════════════════════════
┌──────────────────────────┐     ┌──────────────────────────┐     ┌──────────────────────────┐
│      campus_rooms        │     │   maintenance_requests   │     │      campus_events       │
│(id, building, lab_type)  │     │(ticket_id, room_id, stat)│     │(event_id, title, venue_id│
└──────────────────────────┘     └──────────────────────────┘     └──────────────────────────┘
```

### Table Definitions & Metadata

#### Table 1: `departments`
- **Purpose:** Canonical academic branch grouping and institutional curriculum categorization.
- **Source Columns:** `branch` (distinct values: `CSE`, `IT`, `ECE`, `EEE`, `Mechanical`, `Civil`).
- **Primary Key:** `code` (VARCHAR(10)).
- **Foreign Keys:** None.
- **Constraints:** `code IN ('CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil')`.
- **Sensitive Fields:** None (Public institutional data).
- **Required Indexes:** Primary key index on `code`.
- **Access Level:** Public / Student / Faculty / Admin.
- **Owning Agent:** Academic Agent.
- **Lifecycle Status:** Extracted from current dataset during ingestion.

#### Table 2: `students`
- **Purpose:** Master demographic profile for student entities.
- **Source Columns:** `student_id`, `age`, `gender`, `branch` (as `branch_code`), `college_tier`.
- **Primary Key:** `student_id` (INT).
- **Foreign Keys:** `branch_code` REFERENCES `departments(code)`.
- **Constraints:** `age BETWEEN 15 AND 35`, `gender IN ('Male', 'Female')`, `college_tier IN ('Tier 1', 'Tier 2', 'Tier 3')`.
- **Sensitive Fields:** `age`, `gender` (PII / demographic sensitivity).
- **Required Indexes:** `CREATE INDEX idx_students_branch_tier ON students(branch_code, college_tier);`.
- **Access Level:** Student (self only), Faculty/Admin (cohort query).
- **Owning Agent:** Academic Agent.
- **Lifecycle Status:** Extracted from current dataset.

#### Table 3: `student_academic_records`
- **Purpose:** Authoritative educational standing, attendance tracking, and backlog metrics.
- **Source Columns:** `student_id`, `cgpa`, `attendance_percentage`, `backlogs`, `study_hours_per_day`, `sleep_hours`.
- **Primary Key:** `student_id` (INT, 1:1 with `students`).
- **Foreign Keys:** `student_id` REFERENCES `students(student_id)` ON DELETE CASCADE.
- **Constraints:** `cgpa BETWEEN 0.0 AND 10.0`, `attendance_percentage BETWEEN 0.0 AND 100.0`, `backlogs >= 0`.
- **Sensitive Fields:** `cgpa`, `attendance_percentage`, `backlogs` (FERPA protected educational records).
- **Required Indexes:**  
  `CREATE INDEX idx_academic_attendance ON student_academic_records(attendance_percentage);`  
  `CREATE INDEX idx_academic_cgpa_backlogs ON student_academic_records(cgpa, backlogs);`
- **Access Level:** Student (self only), Academic Advisor / Faculty (permitted students), Admin.
- **Owning Agent:** Academic Agent.
- **Lifecycle Status:** Extracted from current dataset.

#### Table 4: `student_skill_profiles`
- **Purpose:** Standardized evaluation scores across technical, cognitive, and interpersonal domains.
- **Source Columns:** `student_id`, `coding_skill_score`, `aptitude_score`, `communication_skill_score`, `logical_reasoning_score`, `mock_interview_score`.
- **Primary Key:** `student_id` (INT).
- **Foreign Keys:** `student_id` REFERENCES `students(student_id)` ON DELETE CASCADE.
- **Constraints:** All scores constrained to `CHECK (score BETWEEN 0.0 AND 100.0)`.
- **Sensitive Fields:** Individual assessment scores.
- **Required Indexes:** `CREATE INDEX idx_skill_coding_aptitude ON student_skill_profiles(coding_score, aptitude_score);`.
- **Access Level:** Student (self only), Career Counselor / Placement Officer.
- **Owning Agent:** Academic Agent.
- **Lifecycle Status:** Extracted from current dataset.

#### Table 5: `student_portfolio_records`
- **Purpose:** Co-curricular activities, technical projects, certifications, and leadership experience.
- **Source Columns:** `student_id`, `internships_count`, `projects_count`, `certifications_count`, `hackathons_participated`, `github_repos`, `linkedin_connections`, `extracurricular_score`, `leadership_score`, `volunteer_experience`.
- **Primary Key:** `student_id` (INT).
- **Foreign Keys:** `student_id` REFERENCES `students(student_id)` ON DELETE CASCADE.
- **Constraints:** All counts `>= 0`, scores `BETWEEN 0.0 AND 100.0`, `volunteer_experience` BOOLEAN.
- **Sensitive Fields:** None directly (Professional public portfolio).
- **Required Indexes:** `CREATE INDEX idx_portfolio_projects_hackathons ON student_portfolio_records(projects_count, hackathons_participated);`.
- **Access Level:** Student (self), Faculty, Event Agent (conditional: verifying hackathon eligibility).
- **Owning Agent:** Academic Agent / Event Agent (read-only).
- **Lifecycle Status:** Extracted from current dataset.

#### Table 6: `student_placement_records`
- **Purpose:** Career placement verification, recruitment status, and compensation tracking.
- **Source Columns:** `student_id`, `placement_status`, `salary_package_lpa`.
- **Primary Key:** `student_id` (INT).
- **Foreign Keys:** `student_id` REFERENCES `students(student_id)` ON DELETE CASCADE.
- **Constraints:** `placement_status IN ('Placed', 'Not Placed')`, `salary_package_lpa >= 0.0`. If `placement_status = 'Not Placed'` then `salary_package_lpa = 0.0`.
- **Sensitive Fields:** `salary_package_lpa` (High financial sensitivity).
- **Required Indexes:** `CREATE INDEX idx_placement_status ON student_placement_records(placement_status, salary_package_lpa);`.
- **Access Level:** Student (self only), Placement Admin (full), General users (aggregate averages only).
- **Owning Agent:** Academic Agent.
- **Lifecycle Status:** Extracted from current dataset.

---

## 3. Dataset Mapping (All 26 Columns)

Exhaustive accounting of all 26 attributes from `student_placement_prediction_dataset_2026.csv`:

| # | Kaggle Column | Canonical Entity | Canonical Field | Target Data Type | Sensitive? | DB? | RAG? | Agent Access |
|---|---|---|---|---|---|---|---|---|
| 1 | `student_id` | `students` | `student_id` | `INTEGER PRIMARY KEY` | **Yes (ID)** | **YES** | **NO** | Academic, Communication (routing) |
| 2 | `age` | `students` | `age` | `SMALLINT` | **Yes (PII)** | **YES** | **NO** | Academic (advising context) |
| 3 | `gender` | `students` | `gender` | `VARCHAR(10)` | **Yes (PII)** | **YES** | **NO** | Academic (demographic context) |
| 4 | `cgpa` | `student_academic_records` | `cgpa` | `NUMERIC(4,2)` | **Yes (Grade)** | **YES** | **NO** | Academic strictly |
| 5 | `branch` | `students` / `departments` | `branch_code` | `VARCHAR(10)` | No | **YES** | **NO** | Academic, Campus (dept location) |
| 6 | `college_tier` | `students` | `college_tier` | `VARCHAR(10)` | No | **YES** | **NO** | Academic (benchmarking) |
| 7 | `internships_count` | `student_portfolio_records` | `internships_count` | `SMALLINT` | No | **YES** | **NO** | Academic (career readiness) |
| 8 | `projects_count` | `student_portfolio_records` | `projects_count` | `SMALLINT` | No | **YES** | **NO** | Academic (career readiness) |
| 9 | `certifications_count` | `student_portfolio_records` | `certifications_count` | `SMALLINT` | No | **YES** | **NO** | Academic (career readiness) |
| 10 | `coding_skill_score` | `student_skill_profiles` | `coding_score` | `NUMERIC(5,2)` | **Medium** | **YES** | **NO** | Academic strictly |
| 11 | `aptitude_score` | `student_skill_profiles` | `aptitude_score` | `NUMERIC(5,2)` | **Medium** | **YES** | **NO** | Academic strictly |
| 12 | `communication_skill_score` | `student_skill_profiles` | `communication_score` | `NUMERIC(5,2)` | **Medium** | **YES** | **NO** | Academic strictly |
| 13 | `logical_reasoning_score` | `student_skill_profiles` | `logical_score` | `NUMERIC(5,2)` | **Medium** | **YES** | **NO** | Academic strictly |
| 14 | `hackathons_participated` | `student_portfolio_records` | `hackathons_participated` | `SMALLINT` | No | **YES** | **NO** | Academic, Event (prerequisite check) |
| 15 | `github_repos` | `student_portfolio_records` | `github_repos` | `SMALLINT` | No | **YES** | **NO** | Academic |
| 16 | `linkedin_connections` | `student_portfolio_records` | `linkedin_connections` | `INTEGER` | No | **YES** | **NO** | Academic |
| 17 | `mock_interview_score` | `student_skill_profiles` | `mock_interview_score` | `NUMERIC(5,2)` | **Medium** | **YES** | **NO** | Academic strictly |
| 18 | `attendance_percentage` | `student_academic_records` | `attendance_percentage` | `NUMERIC(5,2)` | **Yes (FERPA)**| **YES** | **NO** | Academic strictly |
| 19 | `backlogs` | `student_academic_records` | `backlogs` | `SMALLINT` | **Yes (FERPA)**| **YES** | **NO** | Academic strictly |
| 20 | `extracurricular_score` | `student_portfolio_records` | `extracurricular_score` | `NUMERIC(5,2)` | No | **YES** | **NO** | Academic, Event |
| 21 | `leadership_score` | `student_portfolio_records` | `leadership_score` | `NUMERIC(5,2)` | No | **YES** | **NO** | Academic, Event |
| 22 | `volunteer_experience` | `student_portfolio_records` | `volunteer_experience` | `BOOLEAN` | No | **YES** | **NO** | Academic, Event (volunteer screening) |
| 23 | `sleep_hours` | `student_academic_records` | `sleep_hours` | `NUMERIC(4,2)` | No | **YES** | **NO** | Academic (wellness advising) |
| 24 | `study_hours_per_day` | `student_academic_records` | `study_hours_per_day` | `NUMERIC(4,2)` | No | **YES** | **NO** | Academic (wellness advising) |
| 25 | `placement_status` | `student_placement_records` | `placement_status` | `VARCHAR(20)` | **Yes (Status)**| **YES** | **NO** | Academic |
| 26 | `salary_package_lpa` | `student_placement_records` | `salary_package_lpa` | `NUMERIC(6,2)` | **Critical** | **YES** | **NO** | Academic (Self/Admin only) |

---

## 4. Agent Data Boundaries

### 4.1 Academic Agent (DIRECTLY SUPPORTED)
- **Data Scope:** Full read access to all 6 tables (`students`, `departments`, `student_academic_records`, `student_skill_profiles`, `student_portfolio_records`, `student_placement_records`).
- **Private Student Access:** When executing on behalf of an authenticated student, access is locked via `WHERE student_id = :authenticated_user_id`. The agent can inspect personal attendance, CGPA, backlogs, skill scores, and salary package.
- **Authorized Aggregate Access:** When querying cohort trends (e.g., *"What is the placement percentage in CSE?"* or *"How many students have attendance < 75%?"*), the agent invokes pre-aggregated SQL views that mask individual IDs and names, enforcing a minimum cohort size ($N \ge 10$).

### 4.2 Campus Agent (CURRENT DATA SUPPORT: NONE / LIMITED)
- **Data Reality:** The dataset contains `branch` and `college_tier`, but **ZERO campus buildings, classrooms, laboratories, equipment inventories, or maintenance work orders**.
- **Required Future Data Sources:**
  - `campus_buildings`: Building name, code, coordinates, floors.
  - `campus_rooms`: Room ID, building ID, room number, type (`classroom`, `computer_lab`, `seminar_hall`), capacity.
  - `maintenance_requests`: Ticket ID, reporter ID, location ID, equipment category (e.g. `projector`, `air_conditioner`), issue description, priority, status.
- **Permitted Boundary:** The Campus Agent has **NO ACCESS** to student grades, backlogs, skill scores, or placement salaries.

### 4.3 Communication Agent (CURRENT DATA SUPPORT: NONE / LIMITED)
- **Data Reality:** The dataset provides `linkedin_connections` count, which is a portfolio metric, **NOT an institutional messaging channel**. It contains no student email addresses, phone numbers, notification logs, or broadcast bulletins.
- **Required Future Data Sources:**
  - `user_contacts`: User ID, verified email, mobile number, SMS notification preference.
  - `campus_announcements`: Notice ID, target audience (`all`, `faculty`, `CSE_students`), title, content, expiry date.
  - `communication_logs`: Message ID, recipient, delivery status, timestamp.
- **Permitted Boundary:** The Communication Agent receives **ONLY** the target recipient ID and rendered notification text from other agents. It is barred from querying student CGPA, backlogs, or financial compensation records.

### 4.4 Event Agent (CURRENT DATA SUPPORT: NONE / LIMITED)
- **Data Reality:** The dataset contains counts for `hackathons_participated` and `volunteer_experience`. This is student history, **NOT event management data**. There are no event schedules, venue reservations, club rosters, or resource budgets.
- **Required Future Data Sources:**
  - `campus_events`: Event ID, organizer ID, title, description, venue ID, start time, end time, expected attendance, budget.
  - `event_registrations`: Registration ID, event ID, student ID, attendance check-in status.
  - `event_venues`: Venue ID, capacity, AV equipment available, booking approval status.
- **Permitted Boundary:** The Event Agent may query conditional portfolio attributes (e.g. *"Does student X have volunteer experience?"*), but has **NO ACCESS** to academic backlogs, attendance records, or salary packages.

---

## 5. Structured Data vs. RAG Boundary

### Fundamental Architecture Rule:
> **Structured transactional, mathematical, and personal educational data belongs in PostgreSQL.**  
> **Unstructured institutional guidelines, bylaws, syllabi, and handbooks belong in RAG.**

```text
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                      POSTGRESQL (Structured Relational Store)                          │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ • Exact attendance percentage: 77.46% (student_id = 1)                                │
 │ • Exact CGPA: 7.53                                                                     │
 │ • Exact count of backlogs: 2                                                           │
 │ • Exact placement status: "Placed" at 11.99 LPA                                        │
 │ • Exact room availability: "Lab 204 is booked Mon 10:00-11:00 AM"                      │
 └────────────────────────────────────────────────────────────────────────────────────────┘
                                            ▲
                        HYBRID ATLAS ORCHESTRATION PIPELINE
                                            ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                         RAG (Vector Store / Knowledge Base)                            │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │ • "What is the official university rule when attendance falls between 65% and 75%?"    │
 │ • "What are the prerequisite guidelines for campus placement eligibility?"             │
 │ • "What is the procedure to book a laboratory for an extracurricular coding workshop?" │
 │ • "What are the rules regarding examination fee penalties for backlogs?"               │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

### Database vs. RAG Decision Matrix

| Campus Information Domain | In Current Dataset? | Future Source Required | Target Store | Primary Rationale |
|---|---|---|---|---|
| Student Profile (`student_id`, `age`, `branch`) | **YES** | None (Ingest CSV) | **PostgreSQL** | Exact record lookup, identity verification, relational constraints. |
| Student Attendance (`attendance_percentage`) | **YES** | None (Ingest CSV) | **PostgreSQL** | Arithmetic comparisons ($< 75\%$), exact numerical truth. |
| Student Academic Standing (`cgpa`, `backlogs`) | **YES** | None (Ingest CSV) | **PostgreSQL** | Strict educational record privacy; exact calculation. |
| Student Technical Scores & Assessments | **YES** | None (Ingest CSV) | **PostgreSQL** | Radar chart generation, score sorting, percentile calculations. |
| Student Placement Compensation & Status | **YES** | None (Ingest CSV) | **PostgreSQL** | Highly sensitive financial data; strict numerical aggregation. |
| University Attendance & Condonation Bylaws | **NO** | `attendance_policy_2026.pdf` | **RAG** | Unstructured regulatory text; semantic search with legal citations. |
| Campus Placement Policy & Dream Criteria | **NO** | `placement_handbook.pdf` | **RAG** | Company eligibility rules, tier guidelines, resume formats. |
| Course Syllabus & Learning Objectives | **NO** | `curriculum_handbook.md` | **RAG** | Semantic text matching on concepts, topics, and prerequisites. |
| Campus Room Inventory & Status | **NO** | `campus_rooms` SQL table | **PostgreSQL** | Relational room bookings, capacity checks, maintenance state. |
| Lab Equipment Maintenance Requests | **NO** | `maintenance_requests` SQL | **PostgreSQL** | Workflow state tracking (`submitted`, `in_progress`, `resolved`). |
| Campus Event Calendar & Venues | **NO** | `campus_events` SQL table | **PostgreSQL** | Temporal conflict checks, capacity constraints, booking IDs. |
| Student Club Guidelines & Event Rules | **NO** | `student_life_bylaws.md` | **RAG** | Guidelines on poster permissions, budget approvals, and guest rules. |

---

## 6. Security & Role-Based Access Control (RBAC) Model

### 6.1 Authentication Precondition
Every request to the Atlas API must resolve an authenticated user identity (`userId`, `role`). The user's role and identity determine the query bounds before any SQL query or tool runs.

### 6.2 Role Permissions Matrix

```text
┌─────────────────┬──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ Data Domain     │ Student Role             │ Faculty / Advisor Role   │ Administrator Role       │
├─────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ Own Profile     │ Full Read (Locked to ID) │ Full Read (Advisees only)│ Full Read                │
│ Peer Profile    │ BLOCKED (403 Forbidden)  │ Read (Assigned students) │ Full Read                │
│ Own Grades/Att. │ Full Read                │ Full Read (Advisees only)│ Full Read                │
│ Peer Grades/Att.│ BLOCKED (403 Forbidden)  │ Aggregate only (N >= 10) │ Full Read & Export       │
│ Own Salary/Pack.│ Full Read (if Placed)    │ BLOCKED (unless authorized) Full Read                  │
│ Peer Salary/Pack│ BLOCKED (403 Forbidden)  │ Aggregate average only   │ Full Read                │
│ Campus Rooms    │ Read (Availability only) │ Read & Book              │ Full Read & Administer   │
│ Maintenance     │ Submit & Read Own        │ Submit & Read Department │ Manage & Assign All      │
│ RAG Policies    │ Public Policy Docs only  │ Public + Faculty Handbooks Full Internal Documents   │
└─────────────────┴──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

### 6.3 Anti-Tampering Rules:
1. **No Client-Supplied Target IDs:** A student cannot submit `{ "studentId": 42 }` to inspect student 42. The backend extracts `student_id` strictly from the verified session context.
2. **K-Anonymity for Statistical Queries:** When an agent answers aggregate questions (e.g. *"What is the average package of female IT students with CGPA > 8.5?"*), the query fails if the matching cohort size is fewer than 10 students, preventing individual deanonymization.
3. **No Raw SQL Exposure:** The LLM is never given direct SQL access. Agents invoke compiled, parameterized repository methods (e.g., `academicRepo.getStudentProfile(authUserId)`).

---

## 7. Supported Atlas Query Capability Matrix

Realistic campus queries categorized by operation type, based strictly on the verified data in `student_placement_prediction_dataset_2026.csv`:

| User Query | Agent | Operation Type | Data Source | Access Level | Expected Operation |
|---|---|---|---|---|---|
| *"What is my current attendance percentage and am I at risk?"* | Academic | **EXACT DATA QUERY** | PostgreSQL (`student_academic_records`) | Student (Self) | Reads `attendance_percentage` for `session.student_id`. Compares against institutional threshold. |
| *"How many backlogs do I currently have on record?"* | Academic | **EXACT DATA QUERY** | PostgreSQL (`student_academic_records`) | Student (Self) | Retrieves exact integer count from `backlogs`. |
| *"Evaluate my placement profile based on my coding and aptitude scores."* | Academic | **ANALYTICAL QUERY** | PostgreSQL (`student_skill_profiles`, `student_portfolio_records`) | Student (Self) | Compares student's scores against branch percentiles; identifies weakest score domain. |
| *"What is the average salary package for CSE students in Tier 1 colleges?"* | Academic | **ANALYTICAL QUERY** | PostgreSQL (`student_placement_records`, `students`) | Any authenticated user | Computes `AVG(salary_package_lpa)` where `branch='CSE' AND college_tier='Tier 1' AND placement_status='Placed'`. |
| *"What are the official university rules if my attendance is 68%?"* | Academic | **KNOWLEDGE / RAG QUERY** | RAG (`attendance_policy_2026.md` - Future Source) | Student / Public | Semantic search on condonation bylaws; returns policy citation with clause. |
| *"Can you schedule a mock interview preparation session on my Google Calendar?"* | Event / Academic | **ACTION REQUEST** | AGENTX Calendar Integration (`backend/tools.js`) | Student (Self) | Proposes calendar event via human-in-the-loop action approval button. |
| *"Report the malfunctioning projector in Lab 204."* | Campus | **ACTION REQUEST** | PostgreSQL (`maintenance_requests` - Future Source) | Student / Faculty | Creates maintenance ticket record with idempotency key. |

---

## 8. Missing Data & Future Schema Expansion

To achieve the full vision of `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md`, the following future datasets and schemas must be introduced alongside the Kaggle dataset:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        REQUIRED FUTURE CAMPUS SCHEMAS & SOURCES                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Course & Curriculum Schema:                                                         │
│    • Entities: `courses` (code, title, credits), `course_enrollments`, `timetables`    │
│    • Role: Breaks down overall student attendance into individual subject tracking.    │
│ 2. Physical Infrastructure Schema:                                                     │
│    • Entities: `campus_buildings`, `campus_rooms` (Lab 204), `room_equipment`          │
│    • Role: Supports Campus Agent room location, lab bookings, and maintenance tickets. │
│ 3. Maintenance Service Schema:                                                         │
│    • Entities: `maintenance_requests`, `maintenance_updates`                           │
│    • Role: Supports Campus Agent facility work orders and status lookups.              │
│ 4. Institutional Communications Schema:                                                │
│    • Entities: `campus_announcements`, `user_notification_channels`                    │
│    • Role: Powers Communication Agent broadcast announcements and helpdesk queues.     │
│ 5. Campus Event Management Schema:                                                     │
│    • Entities: `campus_events`, `event_venues`, `event_registrations`                  │
│    • Role: Supports Event Agent venue capacity checks, reservations, and budgets.      │
│ 6. Authoritative Campus Knowledge Corpus (for RAG):                                    │
│    • Documents: Academic Regulations PDF, Student Handbook PDF, Placement Manual MD    │
│    • Role: Powers semantic policy search with exact document and page citations.       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Data Ingestion & Transformation Plan

### 9.1 Structured Ingestion Pipeline (Kaggle Dataset → PostgreSQL)

```text
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 1. Kaggle Source Archive (archive.zip)                                  │
  │    └─► student_placement_prediction_dataset_2026.csv (100,000 rows)     │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 2. Node.js Stream Validation & Transformation Script                    │
  │    • Validates row count (100,000) and headers (26 columns)            │
  │    • Converts float precision: Math.round(val * 100) / 100              │
  │    • Converts volunteer_experience: ('Yes' -> true, 'No' -> false)      │
  │    • Batches records into chunks of 2,000 in memory                     │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 3. PostgreSQL Staging & Normalization (Atomic Transaction)              │
  │    • Seed static table: `departments` (6 branches)                      │
  │    • Insert bulk into: `students`                                       │
  │    • Insert bulk into: `student_academic_records`                       │
  │    • Insert bulk into: `student_skill_profiles`                         │
  │    • Insert bulk into: `student_portfolio_records`                      │
  │    • Insert bulk into: `student_placement_records`                      │
  │    • Create covering B-Tree indexes on student_id, branch, attendance   │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 4. Typed Service Repositories (`backend/atlas/campus/repositories/`)    │
  │    • studentRepo.js, academicRepo.js, placementRepo.js                  │
  │    • Encapsulates parameterized SQL queries; enforces ID scoping        │
  └─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Future Knowledge Ingestion Pipeline (Institutional Docs → Vector Store)

```text
  Official Campus Documents (PDF/MD)
                 │
                 ▼
     Text Extraction & Cleaning
                 │
                 ▼
  Hierarchical Chunking (400-800 tokens)
                 │
                 ▼
  Metadata Enrichment (title, doc_id, category, version, access_level)
                 │
                 ▼
  Embedding Generation (Text-Embedding / Gemini)
                 │
                 ▼
  Vector Database (LanceDB / pgvector)
                 │
                 ▼
  Semantic Retrieval & Citation Filter
```

---

## 10. Agent Tool Contract Definitions

The Academic Agent must interact with data strictly through typed, compiled tools rather than generating ad-hoc SQL queries:

### Tool 1: `get_student_profile`
- **Purpose:** Retrieve demographic and branch profile for the calling student.
- **Inputs:** None (Inherits authenticated `context.user.id`).
- **Authorization:** `student` (own record) or `faculty`/`admin` with explicit `targetStudentId`.
- **Target Store:** PostgreSQL (`students` JOIN `departments`).
- **Output:** `{ studentId: number, branch: string, age: number, gender: string, collegeTier: string }`.

### Tool 2: `get_academic_standing`
- **Purpose:** Fetch official CGPA, overall attendance percentage, and active backlog count.
- **Inputs:** None (Inherits authenticated `context.user.id`).
- **Authorization:** `student` (own record strictly).
- **Target Store:** PostgreSQL (`student_academic_records`).
- **Output:** `{ cgpa: number, attendancePercentage: number, backlogs: number, studyHours: number }`.

### Tool 3: `get_skill_assessment`
- **Purpose:** Retrieve standardized scores across technical and soft-skill domains.
- **Inputs:** None (Inherits authenticated `context.user.id`).
- **Authorization:** `student` (own record).
- **Target Store:** PostgreSQL (`student_skill_profiles`).
- **Output:** `{ codingScore: number, aptitudeScore: number, communicationScore: number, logicalScore: number, mockInterviewScore: number }`.

### Tool 4: `get_placement_status`
- **Purpose:** Retrieve recruitment result and confirmed salary package.
- **Inputs:** None (Inherits authenticated `context.user.id`).
- **Authorization:** `student` (own record).
- **Target Store:** PostgreSQL (`student_placement_records`).
- **Output:** `{ placementStatus: "Placed" | "Not Placed", salaryPackageLpa: number }`.

### Tool 5: `get_cohort_placement_benchmarks`
- **Purpose:** Aggregate placement metrics across branch and college tier without exposing peer identities.
- **Inputs:** `{ branch: string, collegeTier?: string }`.
- **Authorization:** Any authenticated user (`student`, `faculty`, `admin`).
- **Target Store:** PostgreSQL pre-aggregated view.
- **Output:** `{ branch: string, totalPlacedPercentage: number, averageSalaryLpa: number, sampleSize: number }`.

---

## 11. Implementation Roadmap (Phases 0–12)

A structured, dependency-aware implementation sequence that maintains AGENTX stability:

```text
Phase 0:  Repository & Kaggle Dataset Audit (COMPLETED)
Phase 1:  Data Architecture Plan Formulation (COMPLETED via this document)
   │
   ▼
Phase 2:  Atlas Module Namespace Setup (`backend/atlas/`)
          - Create folder scaffolding for orchestrator, agents, campus, knowledge, verifier.
          - Register `/api/atlas/orchestrate` endpoint without altering `/api/chat`.
   │
   ▼
Phase 3:  PostgreSQL Database Provisioning & Schema Migration
          - Create PostgreSQL database container/service.
          - Apply DDL migration for `departments`, `students`, and academic sub-tables.
   │
   ▼
Phase 4:  Kaggle Dataset Ingestion Script Execution
          - Execute batch stream ingestion of the 100,000 CSV records into PostgreSQL.
          - Verify index performance and data consistency.
   │
   ▼
Phase 5:  Campus Typed Repositories & Academic Agent Implementation
          - Implement `academicRepo.js` with parameterized SQL methods.
          - Implement `AcademicAgent` class adhering to `CampusAgent` interface contract.
   │
   ▼
Phase 6:  Campus Agent & Mock Infrastructure Data
          - Seed initial synthetic rooms (`Lab 204`) and maintenance schema.
          - Implement `CampusAgent` for facility inquiries and ticket submission.
   │
   ▼
Phase 7:  Event Agent & Communication Agent Adapter
          - Connect Google Calendar tool to Event Agent workflows.
          - Connect Gmail integration to Communication Agent notification workflows.
   │
   ▼
Phase 8:  Orchestrator Core & Workflow State Machine
          - Implement DAG task planner, workflow state engine, and task handoff contracts.
   │
   ▼
Phase 9:  Campus Policy RAG Ingestion Pipeline
          - Provision vector database (LanceDB or pgvector).
          - Ingest canonical campus policies (attendance bylaws, placement manuals).
   │
   ▼
Phase 10: Verification Engine Implementation
          - Cross-verify model claims against database records and RAG citations.
   │
   ▼
Phase 11: Role-Based Access Control (RBAC) & Authentication Guards
          - Bind user sessions to `student_id` and enforce query isolation.
   │
   ▼
Phase 12: Production Observability, Testing & End-to-End Hardening
```

---

## 12. Recommended Immediate Implementation Step

### Concrete Action Prior to Any UI or Agent Coding:
**Execute Phase 2 & 3 (Namespace Scaffolding and PostgreSQL DDL Preparation):**
1. Create the modular backend directory structure:
   - `backend/atlas/campus/schemas/`
   - `backend/atlas/campus/repositories/`
   - `backend/atlas/agents/`
   - `backend/atlas/orchestrator/`
2. Create the raw SQL DDL migration script: `backend/atlas/campus/schemas/001_initial_student_schema.sql` declaring the 5 normalized tables (`departments`, `students`, `student_academic_records`, `student_skill_profiles`, `student_portfolio_records`, `student_placement_records`) with indexes and constraints.
3. This step is completely isolated, introduces no breaking changes to the existing AGENTX server, requires no UI modification, and establishes the concrete relational schema ready to receive the Kaggle dataset.
