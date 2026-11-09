# Atlas Dataset Analysis
## Kaggle Dataset → Atlas Campus Multi-Agent Data Architecture

**Target Architecture Document:** `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md`  
**Current Codebase State Document:** `IMPLEMENTATION_AUDIT.md`  
**Inspected Dataset Archive:** `archive.zip` (Workspace Root, 9,284,226 bytes)  
**Extracted Data Asset:** `student_placement_prediction_dataset_2026.csv` (21,451,634 bytes)  
**Execution Policy:** Strictly read-only analysis; no dataset ingestion, no database migration, no model training, and no code modification.

---

## 1. Executive Summary

This dataset analysis examines the newly provided Kaggle dataset archive (`archive.zip`) to establish how its contents can be integrated into the Atlas campus AI architecture defined in `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md`, considering the current state established in `IMPLEMENTATION_AUDIT.md`.

### Core Findings:
1. **Single Tabular Asset with 100,000 Student Records:**  
   The dataset consists of a single CSV file: `student_placement_prediction_dataset_2026.csv` containing **100,000 rows** and **26 columns** with zero null values across all attributes. It represents comprehensive student demographic, academic performance, technical skill assessment, lifestyle, and career placement outcome data.
2. **High-Impact Domain Match for Academic Agent:**  
   The dataset provides deep coverage for the **Academic Agent**. Attributes including `cgpa`, `attendance_percentage` (ranging from 50.0% to 100.0%, with 15,749 students below 75%), `backlogs` (0 to 6), `branch` (6 engineering disciplines), skill evaluation metrics (coding, aptitude, communication, logical reasoning, mock interviews), and placement results directly empower academic performance evaluation, attendance shortfall detection, and career readiness forecasting.
3. **Complete Absence of Campus, Communication, and Event Infrastructure Data:**  
   The provided dataset contains **no campus facility records** (no buildings, rooms, labs, equipment, or maintenance tickets for the **Campus Agent**), **no messaging or announcement logs** (no student contact details, emails, phone numbers, or broadcast notices for the **Communication Agent**), and **no campus event records** (no schedules, venues, budgets, or club activities for the **Event Agent**).
4. **100% Structured Data — Not a RAG Candidate:**  
   The dataset is entirely tabular, scalar, and numerical/categorical. It must reside in a **Structured Relational Database (PostgreSQL)**. Indexing individual student rows into vector embeddings for RAG would be an anti-pattern. Semantic RAG in Atlas remains reserved for unstructured institutional texts (e.g., academic regulations, exam guidelines, syllabus handbooks), which are absent from this dataset.
5. **Privacy and Sensitive Data Boundaries:**  
   Although anonymized (synthetic identifiers `student_id` from 1 to 100,000 without personal names), attributes such as academic scores, backlogs, attendance, and placement compensation (`salary_package_lpa`) constitute sensitive educational records under FERPA standards. These must be shielded behind strict Role-Based Access Control (RBAC) where students can query only their own profile, and cross-student analytics are restricted to authorized faculty and administrators.

---

## 2. Dataset Inventory

| Property | Value / Evidence |
|---|---|
| **Archive File** | `archive.zip` (located in project root) |
| **Archive Size** | 9,284,226 bytes (~8.85 MB compressed) |
| **Extracted File** | `student_placement_prediction_dataset_2026.csv` |
| **Extracted File Size** | 21,451,634 bytes (~20.46 MB uncompressed) |
| **File Format** | Comma-Separated Values (CSV), UTF-8 text |
| **Number of Files** | 1 file |
| **Total Lines** | 100,001 (1 header row + 100,000 data rows) |
| **Total Records** | 100,000 rows |
| **Total Columns** | 26 columns |
| **Primary Identifier** | `student_id` (Unique integer sequence: 1 to 100,000) |
| **Duplicate Records** | 0 duplicate IDs detected across 100,000 records |
| **Missing / Null Values** | 0 null/empty fields across all 2,600,000 data cells |

---

## 3. Dataset Schema

Exhaustive profiling of the 26 columns in `student_placement_prediction_dataset_2026.csv`:

| Column Name | Inferred Type | Null Count | Min | Max | Mean / Distribution | Example Value Pattern |
|---|---|---|---|---|---|---|
| `student_id` | Integer (Primary Key) | 0 | 1 | 100000 | 50000.50 | `1`, `2`, `100000` |
| `age` | Integer | 0 | 18 | 24 | 21.01 | `24`, `21`, `22`, `20`, `19` |
| `gender` | Categorical (String) | 0 | - | - | Male: 60,028 (60.03%), Female: 39,972 (39.97%) | `Male`, `Female` |
| `cgpa` | Float (Decimal) | 0 | 4.50 | 10.00 | 7.50 | `7.53`, `7.92`, `8.60`, `6.68` |
| `branch` | Categorical (String) | 0 | - | - | CSE: 34,818, IT: 19,999, ECE: 14,908, EEE: 10,177, Mechanical: 10,077, Civil: 10,021 | `IT`, `CSE`, `EEE`, `Civil` |
| `college_tier` | Categorical (String) | 0 | - | - | Tier 2: 49,955, Tier 3: 29,884, Tier 1: 20,161 | `Tier 1`, `Tier 2`, `Tier 3` |
| `internships_count` | Integer | 0 | 0 | 8 | 1.50 | `0`, `1`, `2`, `4` |
| `projects_count` | Integer | 0 | 0 | 13 | 3.00 | `1`, `2`, `3`, `6` |
| `certifications_count` | Integer | 0 | 0 | 11 | 2.01 | `0`, `1`, `2`, `6` |
| `coding_skill_score` | Float (Score 0-100) | 0 | 20.00 | 100.00 | 69.83 | `99.238568...`, `80.966123...` |
| `aptitude_score` | Float (Score 0-100) | 0 | 20.00 | 100.00 | 64.99 | `81.707721...`, `63.116715...` |
| `communication_skill_score` | Float (Score 0-100) | 0 | 20.00 | 100.00 | 67.96 | `57.707166...`, `92.104885...` |
| `logical_reasoning_score` | Float (Score 0-100) | 0 | 20.00 | 100.00 | 65.93 | `59.070073...`, `80.603330...` |
| `hackathons_participated` | Integer | 0 | 0 | 8 | 1.00 | `0`, `1`, `2`, `4` |
| `github_repos` | Integer | 0 | 0 | 16 | 4.01 | `1`, `2`, `4`, `8` |
| `linkedin_connections` | Integer | 0 | 50 | 999 | 524.56 | `184`, `539`, `568`, `833` |
| `mock_interview_score` | Float (Score 0-100) | 0 | 20.00 | 100.00 | 69.99 | `72.647008...`, `87.396911...` |
| `attendance_percentage` | Float (Percentage) | 0 | 50.00 | 100.00 | 84.73 | `77.463863...`, `88.887599...` |
| `backlogs` | Integer (Count) | 0 | 0 | 6 | 0.50 (0: 60,884, 1: 30,177, 2: 7,458, 3+: 1,481) | `0`, `1`, `2` |
| `extracurricular_score` | Float (Score 0-100) | 0 | 0.00 | 100.00 | 59.89 | `63.382726...`, `0.0`, `73.694604...`|
| `leadership_score` | Float (Score 0-100) | 0 | 0.00 | 100.00 | 54.94 | `52.938240...`, `60.198855...` |
| `volunteer_experience` | Categorical (Binary) | 0 | - | - | No: 59,963 (59.96%), Yes: 40,037 (40.04%) | `Yes`, `No` |
| `sleep_hours` | Float (Hours/day) | 0 | 3.00 | 10.00 | 6.98 | `6.7`, `4.4`, `8.8` |
| `study_hours_per_day` | Float (Hours/day) | 0 | 0.50 | 10.00 | 3.52 | `3.6`, `2.3`, `5.9` |
| `placement_status` | Categorical (Target) | 0 | - | - | Placed: 54,459 (54.46%), Not Placed: 45,541 (45.54%) | `Placed`, `Not Placed` |
| `salary_package_lpa` | Float (Lakhs INR) | 0 | 0.00 | 20.44 | 7.25 (Mean of Placed: ~13.31 LPA) | `0.0`, `11.99`, `12.16` |

---

## 4. Entity Discovery

Although provided in a single denormalized CSV table, the dataset represents multiple distinct real-world campus entities:

### Discovered Entities:

1. **Student Entity (`student`)**
   - *Source Fields:* `student_id`, `age`, `gender`, `branch`, `college_tier`.
   - *Primary Key:* `student_id`.
   - *Volume:* 100,000 distinct individuals.
   - *Atlas Role:* Core user profile representing the student actor querying the Academic Agent.

2. **Academic Performance Entity (`academic_record`)**
   - *Source Fields:* `cgpa`, `attendance_percentage`, `backlogs`, `study_hours_per_day`.
   - *Foreign Key:* `student_id`.
   - *Atlas Role:* Underpins attendance queries, backlog resolution advisory, and academic standing analysis.

3. **Technical Assessment & Skill Evaluation Entity (`skill_assessment`)**
   - *Source Fields:* `coding_skill_score`, `aptitude_score`, `communication_skill_score`, `logical_reasoning_score`, `mock_interview_score`.
   - *Foreign Key:* `student_id`.
   - *Atlas Role:* Powers student strength/weakness evaluations, placement preparation guidance, and interview readiness recommendations.

4. **Co-Curricular & Portfolio Entity (`portfolio_activity`)**
   - *Source Fields:* `internships_count`, `projects_count`, `certifications_count`, `hackathons_participated`, `github_repos`, `linkedin_connections`, `extracurricular_score`, `leadership_score`, `volunteer_experience`.
   - *Foreign Key:* `student_id`.
   - *Atlas Role:* Supports resume building, career readiness scoring, and activity portfolio verification.

5. **Placement Outcome Entity (`placement_record`)**
   - *Source Fields:* `placement_status`, `salary_package_lpa`.
   - *Foreign Key:* `student_id`.
   - *Atlas Role:* Career service reporting, historical package insights, and placement eligibility checks.

6. **Academic Department / Branch Entity (`department`)**
   - *Source Fields:* `branch` ('CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil').
   - *Primary Key:* Inferred code (`branch`).
   - *Volume:* 6 departments.
   - *Atlas Role:* Departmental grouping, curriculum context, and aggregate performance reporting.

7. **Institutional Classification Entity (`institution_tier`)**
   - *Source Fields:* `college_tier` ('Tier 1', 'Tier 2', 'Tier 3').
   - *Volume:* 3 tiers.
   - *Atlas Role:* Benchmarking institutional tier expectations and recruiter criteria.

---

## 5. Entity Relationship Analysis

The flat table can be cleanly normalized into a 3NF relational schema around `student_id`:

```text
 ┌──────────────────────┐
 │      department      │
 │  (branch: CSE, IT...)│
 └──────────┬───────────┘
            │ 1:N
            ▼
 ┌──────────────────────┐       1:1      ┌───────────────────────────┐
 │       student        ├───────────────►│      academic_record      │
 │  (student_id [PK],   │                │(cgpa, attendance, backlogs)
 │   age, gender, tier) │                └───────────────────────────┘
 └──────────┬───────────┘
            │
            ├─────────────── 1:1 ───────►┌───────────────────────────┐
            │                            │     skill_assessment      │
            │                            │ (coding, aptitude, mock)  │
            │                            └───────────────────────────┘
            │
            ├─────────────── 1:1 ───────►┌───────────────────────────┐
            │                            │    portfolio_activity     │
            │                            │ (internships, projects)   │
            │                            └───────────────────────────┘
            │
            └─────────────── 1:1 ───────►┌───────────────────────────┐
                                         │     placement_record      │
                                         │ (status, salary_lpa)      │
                                         └───────────────────────────┘
```

### Relationship Classifications:
- `department` → `student`: **One-to-Many (1:N)** [Explicit categorical grouping].
- `student` → `academic_record`: **One-to-One (1:1)** [Explicit foreign-key relationship on `student_id`].
- `student` → `skill_assessment`: **One-to-One (1:1)** [Explicit foreign-key relationship on `student_id`].
- `student` → `portfolio_activity`: **One-to-One (1:1)** [Explicit foreign-key relationship on `student_id`].
- `student` → `placement_record`: **One-to-One (1:1)** [Explicit foreign-key relationship on `student_id`].

---

## 6. Data Quality Analysis

| Check | Result | Severity | Observation & Impact |
|---|---|---|---|
| **Missingness** | 0 null values across all 26 columns | `LOW` (Clean) | Flawless completeness; no imputation required. |
| **Primary Key Uniqueness** | 100,000 distinct `student_id`s (1 to 100,000) | `LOW` (Clean) | Perfect sequence with zero collisions. |
| **Score Value Ranges** | All score columns (`coding`, `aptitude`, etc.) span exactly 20.0 to 100.0 or 0.0 to 100.0 | `LOW` (Clean) | Fully normalized within standardized percentiles. |
| **Attendance Bounds** | 50.0% to 100.0% (Mean: 84.73%) | `LOW` (Clean) | Realistic university distribution with realistic tail of at-risk students. |
| **Placement Logic Consistency** | All 45,541 'Not Placed' records have `salary_package_lpa == 0.0`; all 54,459 'Placed' records have `salary_package_lpa > 0.0` (Min: 3.0 LPA, Max: 20.44 LPA) | `LOW` (Clean) | 100% logical integrity between status and salary. |
| **Floating Point Precision** | High floating-point precision (e.g. `99.23856840567274`) | `MEDIUM` | Evidence of synthetic benchmark generation. Should be rounded to 2 decimal places upon database ingestion for cleaner UX display. |
| **Co-Curricular Sparsity** | 60,884 students (60.88%) have 0 backlogs; 40,037 students (40.04%) have volunteer experience | `LOW` (Clean) | Representative of standard engineering cohort distributions. |

---

## 7. Sensitive Data / Privacy Analysis

| Data Field | Sensitivity Level | Justification | Permitted Atlas Agents | Privacy & RBAC Constraint |
|---|---|---|---|---|
| `student_id` | **High** | Unique individual identifier | Academic, Communication (for notification lookup) | Must be tied to authenticated user session; student cannot query another student's ID. |
| `cgpa`, `backlogs`, `attendance_percentage` | **High** | FERPA / Academic privacy; grade and attendance records | Academic Agent strictly | Student role: read own records only. Faculty/Admin role: aggregate or course-level views. Never expose in RAG. |
| `salary_package_lpa`, `placement_status` | **Critical** | Financial and career sensitivity | Academic / Placement Advisor | Student can view own placement status; salary package details of other students must remain confidential. Aggregate salary statistics permitted for general queries. |
| `age`, `gender` | **Medium** | Demographic PII | Academic (advising context only) | Shield from public outputs to prevent bias or profiling. |
| `coding_skill_score`, `aptitude_score`, `mock_interview_score` | **Medium** | Individual performance assessment | Academic Agent | Private to the student and certified academic counselors. |
| `github_repos`, `linkedin_connections` | **Low** | Public professional profiles | Academic, Event (hackathon qualifications) | Can be surfaced during resume and career advising interactions. |

---

## 8. Atlas Agent Mapping

Comparing dataset entities directly against the 4 specialized Atlas agents defined in `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md`:

### 8.1 Academic Agent (DIRECT SUPPORT — 90% Match)
- **Supported Capabilities:**
  - *Attendance Queries & Risk Analysis:* Directly backed by `attendance_percentage`. The agent can answer queries like: *"My attendance is 68%. Am I eligible for exams under university criteria?"* (15,749 records in dataset have attendance < 75%).
  - *Academic Standing & Backlog Advisory:* Backed by `cgpa` and `backlogs`. The agent can analyze backlog impact on placement eligibility.
  - *Skill Assessment & Gap Analysis:* Backed by `coding_skill_score`, `aptitude_score`, `communication_skill_score`, `logical_reasoning_score`, and `mock_interview_score`. The agent can identify specific areas needing improvement.
  - *Placement Eligibility & Profile Evaluation:* Backed by `internships_count`, `projects_count`, `certifications_count`, `hackathons_participated`, and `placement_status`.
- **Missing Academic Data in Dataset:**
  - Individual course codes (e.g., `CS301`, `CS302`).
  - Subject-by-subject attendance breakdown (only overall student attendance percentage is present).
  - Timetable, class schedule, and examination dates.

### 8.2 Campus Agent (NO SUPPORT — 0% Match)
- **Findings from Dataset:**
  - The dataset contains `college_tier` and `branch`, but **NO campus buildings, NO classroom/lab numbers (e.g. Lab 204), NO equipment inventory, NO maintenance requests, and NO room booking calendars**.
- **Conclusion:** Campus Agent capabilities must rely on separate campus infrastructure datasets and mock maintenance ticket schemas as outlined in Architecture v2 Section 13.

### 8.3 Communication Agent (MINIMAL SUPPORT — 5% Match)
- **Findings from Dataset:**
  - The dataset contains `linkedin_connections` count, but **NO student email addresses, NO phone numbers, NO notification channels, NO campus announcement texts, and NO helpdesk tickets**.
- **Conclusion:** The Communication Agent can use the student's ID and branch to route messages, but actual communication channels (Gmail/SMTP/inbox) must be provided by the runtime integrations audited in `IMPLEMENTATION_AUDIT.md`.

### 8.4 Event Agent (ANCILLARY SUPPORT — 10% Match)
- **Findings from Dataset:**
  - The dataset contains `hackathons_participated` (count) and `volunteer_experience` ('Yes'/'No'), but **NO event schedules, NO venue capacities, NO event registrations, and NO event budget records**.
- **Conclusion:** The Event Agent can query whether a student has prior hackathon or volunteer experience for team formation or eligibility, but campus event management requires the relational event schema specified in Architecture v2 Section 13.

---

## 9. Structured Database Candidates

All 26 fields in the dataset belong strictly to the **Structured Database (PostgreSQL)**. They require exact lookups, relational joins, indexing, and aggregations.

### Recommended PostgreSQL Table Partitioning:
1. `students`: `id` (`student_id`), `department_code` (`branch`), `tier` (`college_tier`), `age`, `gender`, `created_at`.
2. `student_academic_records`: `student_id` (FK), `cgpa`, `attendance_percentage`, `backlogs`, `study_hours_per_day`, `sleep_hours`.
3. `student_skill_profiles`: `student_id` (FK), `coding_score`, `aptitude_score`, `communication_score`, `logical_score`, `mock_interview_score`.
4. `student_portfolio_records`: `student_id` (FK), `internships_count`, `projects_count`, `certifications_count`, `hackathons_participated`, `github_repos`, `linkedin_connections`, `extracurricular_score`, `leadership_score`, `volunteer_experience`.
5. `student_placement_records`: `student_id` (FK), `placement_status`, `salary_package_lpa`.

---

## 10. RAG Candidates

### Critical Determination:
**None of the raw rows or columns in this CSV should be ingested into a Vector Database or processed through a RAG embedding pipeline.**

### Detailed Justification:
1. **Tabular vs. Semantic:** RAG is designed for semantic search over unstructured, explanatory text (handbooks, exam bylaws, policy clauses, campus procedures). Converting a structured row like `"Student 4, Age 24, Male, CGPA 6.68, CSE..."` into text embeddings destroys relational queryability, makes filtering imprecise, and wastes vector database storage.
2. **Deterministic Exactitude:** A question like *"What is my attendance percentage?"* or *"How many backlogs do I have?"* requires a deterministic SQL query returning an exact number, not a semantic similarity match.
3. **Privacy Risk:** Embedding private student metrics in a shared vector space risks unintended data leakage across prompt contexts.
4. **Potential Future Synthetic RAG Documents:**
   - The *only* valid RAG application derived from this dataset would be pre-computed, aggregated institutional reports, such as:
     - `"2026 Campus Placement Analysis & Branch Salary Report"` (synthesizing average salaries, top recruiters by tier, and placement ratios by branch).
     - `"Academic Attendance & Exam Eligibility Rules Policy"` (describing regulations regarding the 75% attendance threshold).

---

## 11. Structured DB vs RAG Boundary

| Data Domain | Target Store | Primary Rationale |
|---|---|---|
| Student Demographics (`student_id`, `age`, `gender`, `branch`) | **STRUCTURED_DB** | Identity lookup, authentication binding, demographic grouping. |
| Academic Metrics (`cgpa`, `attendance_percentage`, `backlogs`) | **STRUCTURED_DB** | Exact calculation, mathematical thresholds (< 75%), ACID integrity. |
| Skill Scores (`coding`, `aptitude`, `communication`) | **STRUCTURED_DB** | Score sorting, percentile ranking, radar chart data delivery. |
| Portfolio Counts (`internships`, `projects`, `hackathons`) | **STRUCTURED_DB** | Discrete numeric filtering and verification checks. |
| Placement Records (`status`, `salary_package_lpa`) | **STRUCTURED_DB** | Exact institutional tracking, salary aggregation by branch. |
| Campus Policies, Handbooks, Regulations | **RAG** | Unstructured prose, semantic search, versioned policy retrieval. |
| Department Overview & Guidelines | **RAG** | Long-form course objectives and institutional background. |
| Aggregated Placement Intelligence Summary | **BOTH** | Aggregate numbers from DB; narrative insights in RAG. |

---

## 12. Agent Access Matrix

| Data Entity | Academic Agent | Campus Agent | Communication Agent | Event Agent | RAG Store | Access & Security Notes |
|---|---|---|---|---|---|---|
| **Student Demographics** (`branch`, `age`, `gender`) | **YES** | **CONDITIONAL** | **CONDITIONAL** | **CONDITIONAL** | **NO** | Academic agent accesses for profile context; other agents access only on authorized student interaction. |
| **Academic Performance** (`cgpa`, `attendance`, `backlogs`) | **YES** | **NO** | **NO** | **NO** | **NO** | Strictly restricted to Academic Agent. Never exposed to Campus or Event agents. |
| **Skill Scores** (`coding`, `aptitude`, `mock interview`) | **YES** | **NO** | **NO** | **NO** | **NO** | Private evaluation data used for academic and placement coaching. |
| **Portfolio & Co-Curriculars** (`projects`, `hackathons`, `volunteer`) | **YES** | **NO** | **NO** | **CONDITIONAL** | **NO** | Event Agent may check `hackathons_participated` or `volunteer_experience` for club/hackathon registration. |
| **Placement Results** (`placement_status`, `salary_lpa`) | **YES** | **NO** | **NO** | **NO** | **NO** | Confidential career records. Only aggregate branch statistics can be exposed publicly. |

---

## 13. Supported Atlas Query Types

Based strictly on the verified data in `student_placement_prediction_dataset_2026.csv`, here are realistic queries Atlas can answer once the dataset is ingested into PostgreSQL:

### Academic Agent Queries:
1. *"What is my current attendance percentage and am I at risk of falling below the 75% requirement?"*  
   → Queries `student_academic_records` where `student_id = :id`.
2. *"Can you evaluate my profile for campus placements based on my CGPA, coding score, and projects?"*  
   → Retrieves CGPA, skill scores, project count, and compares against branch benchmarks.
3. *"I have 2 backlogs. What is the historical placement probability for CSE students with similar backlogs?"*  
   → Executes SQL aggregation: `SELECT COUNT(*), placement_status FROM students JOIN academic_records ... WHERE branch='CSE' AND backlogs=2 GROUP BY placement_status`.
4. *"Which skill areas do I need to improve to increase my placement package?"*  
   → Compares student's `coding_skill_score`, `aptitude_score`, and `mock_interview_score` against the average scores of students placed above 12 LPA.
5. *"How many hackathons and projects do top-tier placed students typically have?"*  
   → Returns median and average counts grouped by `college_tier` and `placement_status`.

### Cross-Departmental / Administrative Queries (Faculty/Admin Role):
1. *"What percentage of IT students currently have attendance below 65%?"*  
   → SQL query: `SELECT (COUNT(CASE WHEN attendance_percentage < 65 THEN 1 END)::float / COUNT(*)) * 100 FROM ... WHERE branch='IT'`.
2. *"What is the average salary package for students in Tier 1 vs Tier 2 colleges with CGPA > 8.0?"*  
   → Multi-column aggregation grouped by `college_tier`.

---

## 14. Missing Data

Comparison between the provided Kaggle dataset and the target architecture requirements:

| Required Architecture Domain (Architecture v2) | Status in Kaggle Dataset | Missing Entities / Attributes | Architectural Remedy |
|---|---|---|---|
| **Course & Subject Specifics** | `MISSING` | No course codes (`CS301`), subject names, or course-specific attendance records. Only aggregate student attendance percentage is present. | Introduce canonical `courses` and `course_sections` schema tables with synthetic or curriculum-specific mappings. |
| **Physical Campus Infrastructure** | `MISSING` | No buildings, classrooms, laboratories (e.g. `Lab 204`), equipment, or facility maintenance records. | Introduce canonical `buildings`, `rooms`, and `maintenance_requests` tables as defined in Architecture v2 Section 13. |
| **Timetable & Scheduling** | `MISSING` | No class timetable entries, periods, day schedules, or room assignments. | Introduce `timetable_entries` schema. |
| **Campus Events & Clubs** | `MISSING` | No event titles, event descriptions, venue bookings, organizers, or budgets. | Introduce `events` and `event_resources` tables. |
| **Student Communication Channels** | `MISSING` | No email addresses, phone numbers, or campus notification records. | Link `student_id` to existing AGENTX user contact directory (`backend/store.js:24`). |
| **Institutional Knowledge Texts (RAG)** | `MISSING` | No academic bylaws, student handbooks, examination rules, or laboratory safety procedures. | Author and ingest authoritative Markdown/PDF campus policy documents into the RAG vector store. |

---

## 15. Conceptual Data Model

The recommended relational database schema for ingesting this dataset into **PostgreSQL** without data loss:

```sql
-- Core Department Table
CREATE TABLE departments (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Core Student Profile Table
CREATE TABLE students (
    student_id INT PRIMARY KEY,
    age INT NOT NULL CHECK (age BETWEEN 15 AND 35),
    gender VARCHAR(10) NOT NULL,
    branch_code VARCHAR(10) REFERENCES departments(code),
    college_tier VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Academic Standing
CREATE TABLE student_academic_records (
    student_id INT PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
    cgpa NUMERIC(4,2) NOT NULL CHECK (cgpa BETWEEN 0.0 AND 10.0),
    attendance_percentage NUMERIC(5,2) NOT NULL CHECK (attendance_percentage BETWEEN 0.0 AND 100.0),
    backlogs INT NOT NULL DEFAULT 0,
    study_hours_per_day NUMERIC(4,2),
    sleep_hours NUMERIC(4,2)
);

-- Technical & Soft Skill Assessments
CREATE TABLE student_skill_profiles (
    student_id INT PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
    coding_score NUMERIC(5,2),
    aptitude_score NUMERIC(5,2),
    communication_score NUMERIC(5,2),
    logical_score NUMERIC(5,2),
    mock_interview_score NUMERIC(5,2)
);

-- Portfolios, Projects, and Extracurriculars
CREATE TABLE student_portfolio_records (
    student_id INT PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
    internships_count INT DEFAULT 0,
    projects_count INT DEFAULT 0,
    certifications_count INT DEFAULT 0,
    hackathons_participated INT DEFAULT 0,
    github_repos INT DEFAULT 0,
    linkedin_connections INT DEFAULT 0,
    extracurricular_score NUMERIC(5,2),
    leadership_score NUMERIC(5,2),
    volunteer_experience BOOLEAN DEFAULT FALSE
);

-- Career Placement Outcomes
CREATE TABLE student_placement_records (
    student_id INT PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
    placement_status VARCHAR(20) NOT NULL,
    salary_package_lpa NUMERIC(6,2) DEFAULT 0.0
);

-- Recommended Composite & Covering Indexes:
CREATE INDEX idx_students_branch_tier ON students(branch_code, college_tier);
CREATE INDEX idx_academic_attendance ON student_academic_records(attendance_percentage);
CREATE INDEX idx_academic_cgpa_backlogs ON student_academic_records(cgpa, backlogs);
CREATE INDEX idx_placement_status_salary ON student_placement_records(placement_status, salary_package_lpa);
```

---

## 16. Conceptual RAG Model

Since the Kaggle dataset contains zero unstructured text, the campus RAG pipeline must be fed by **derived institutional knowledge documents** rather than raw CSV rows:

### Proposed Knowledge Documents to Author for RAG:
1. **`docs/policies/attendance_and_detention_policy_2026.md`:**
   - Formal rules regarding mandatory 75% minimum attendance.
   - Condonation rules for medical grounds (between 65% and 75%).
   - Explicit detention procedures for attendance below 65%.
2. **`docs/policies/placement_eligibility_guidelines_2026.md`:**
   - Criteria for campus placement registration (e.g. minimum 6.5 CGPA, maximum 1 active backlog).
   - Dream package criteria (> 10 LPA).
3. **`docs/curriculum/engineering_branches_overview.md`:**
   - Description of CSE, IT, ECE, EEE, Civil, Mechanical curricula and career pathways.

### RAG Chunking & Metadata Structure:
```json
{
  "documentId": "doc_attendance_policy_2026",
  "title": "Institutional Attendance and Examination Eligibility Regulations",
  "category": "academic_policy",
  "effectiveYear": 2026,
  "chunkId": "chunk_att_003",
  "content": "Students with attendance between 65% and 74.9% may apply for condonation subject to submission of valid medical certification approved by the Head of Department...",
  "accessLevel": "student"
}
```

---

## 17. Recommended Ingestion Architecture

A clean, non-destructive, batch-processing pipeline for the future ingestion stage:

```text
 ┌─────────────────────────────────────────────────────────────┐
 │    Kaggle CSV: student_placement_prediction_dataset_2026    │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                Validation & Cleaning Script                 │
 │  - Parse CSV in batches of 1,000 records                    │
 │  - Round high-precision floats to 2 decimal places          │
 │  - Map volunteer_experience ('Yes'/'No' -> boolean)         │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                PostgreSQL Database Ingestion                │
 │  - Insert distinct branches into `departments`              │
 │  - COPY / INSERT INTO `students` (100,000 rows)             │
 │  - INSERT INTO `student_academic_records` (100,000 rows)    │
 │  - INSERT INTO `student_skill_profiles` (100,000 rows)      │
 │  - INSERT INTO `student_portfolio_records` (100,000 rows)   │
 │  - INSERT INTO `student_placement_records` (100,000 rows)   │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                 Typed Service Repositories                  │
 │  - backend/atlas/campus/repositories/studentRepo.js         │
 │  - backend/atlas/campus/repositories/academicRepo.js        │
 │  - backend/atlas/campus/repositories/placementRepo.js       │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │            Atlas Academic Agent Tool Bindings               │
 │  - get_attendance(studentId)                                │
 │  - get_student_academic_profile(studentId)                  │
 │  - get_placement_readiness(studentId)                       │
 └─────────────────────────────────────────────────────────────┘
```

---

## 18. Security / Authorization Considerations

1. **Session-to-ID Binding:**  
   The application layer must extract the `student_id` directly from the authenticated session/JWT token. It must never allow the student to pass an arbitrary `student_id` in chat parameters to access peers' records.
2. **Masked Aggregate Reporting:**  
   When answering aggregate queries (e.g. *"What is the average salary in CSE?"*), the query must require a minimum cohort size ($N \ge 10$) to prevent deanonymization of individual salaries.
3. **No Unrestricted Model Tool Invocation:**  
   The LLM must invoke typed, parameterized repository methods (`studentRepo.getById(authenticatedStudentId)`) and must never be permitted to execute raw SQL queries.

---

## 19. Risks and Limitations

1. **Synthetic Data Artifacts:**  
   The high-precision float values indicate a synthetic or synthetically balanced dataset. Certain relationships may reflect statistical synthesis rather than real-world organic behavior (e.g., 19,616 placed students have backlogs).
2. **Missing Longitudinal / Temporal Depth:**  
   The dataset captures a single static snapshot per student. It does not provide historical semester-by-semester grade trajectories or daily attendance logs.
3. **Asymmetry in Agent Support:**  
   Because the dataset provides rich academic/placement data but zero facilities or maintenance data, the Academic Agent will be immediately functional with real data, whereas the Campus and Event agents will initially require mock fixtures for physical rooms and maintenance tickets.

---

## 20. Recommended Next Implementation Step

**Recommended Action for Next Phase:**
1. **Maintain Non-Implementation Posture:** Do not build UI/UX or ingest data yet. Wait for explicit instructions.
2. **Prepare PostgreSQL Migration Script:** Draft the SQL schema migration file corresponding to the 5 normalized tables described in Section 15.
3. **Build the Academic Repository Module:** Create `backend/atlas/campus/repositories/academicRepo.js` to query student attendance, CGPA, and placement readiness with parameterized SQL.
4. **Draft Synthetic Campus Facility & Event Seed Data:** Since the Kaggle dataset lacks rooms (Lab 204) and maintenance tickets, create companion seed fixtures so the Campus Agent and Event Agent can be validated alongside the Academic Agent.
