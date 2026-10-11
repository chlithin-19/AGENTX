-- =============================================================================
-- Migration: schema.sqlite.sql
-- Target Database: SQLite 3 (node:sqlite DatabaseSync)
-- Phase: Atlas Phase 2 (Dataset Ingestion & Data Architecture)
-- Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md & ATLAS_DATA_ARCHITECTURE_PLAN.md
-- Description: Establishes the relational schema for student profiles,
--              academic standing, skill assessments, placement benchmarks,
--              maintenance tickets, and ingestion provenance logs.
-- =============================================================================

PRAGMA foreign_keys = ON;

-- -----------------------------------------------------------------------------
-- 1. Departments Table
-- Canonical academic branch classification matching dataset categories.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

INSERT OR IGNORE INTO departments (code, name) VALUES
    ('CSE', 'Computer Science and Engineering'),
    ('IT', 'Information Technology'),
    ('ECE', 'Electronics and Communication Engineering'),
    ('EEE', 'Electrical and Electronics Engineering'),
    ('Mechanical', 'Mechanical Engineering'),
    ('Civil', 'Civil Engineering');

-- -----------------------------------------------------------------------------
-- 2. Master Students Table
-- Primary student identity entity linking demographic and institutional attributes.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    student_id INTEGER PRIMARY KEY,
    name TEXT,
    age INTEGER NOT NULL CHECK (age BETWEEN 15 AND 35),
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    branch_code TEXT NOT NULL REFERENCES departments(code),
    college_tier TEXT NOT NULL CHECK (college_tier IN ('Tier 1', 'Tier 2', 'Tier 3')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch_code);

-- -----------------------------------------------------------------------------
-- 3. Student Academic Records Table
-- Authoritative educational standing, attendance tracking, and backlog metrics.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_academic_records (
    student_id INTEGER PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
    cgpa REAL NOT NULL CHECK (cgpa BETWEEN 0.0 AND 10.0),
    attendance_percentage REAL NOT NULL CHECK (attendance_percentage BETWEEN 0.0 AND 100.0),
    backlogs INTEGER NOT NULL DEFAULT 0 CHECK (backlogs >= 0),
    study_hours_per_day REAL CHECK (study_hours_per_day >= 0.0),
    sleep_hours REAL CHECK (sleep_hours >= 0.0)
);

CREATE INDEX IF NOT EXISTS idx_academic_attendance ON student_academic_records(attendance_percentage);

-- -----------------------------------------------------------------------------
-- 4. Student Skill Profiles Table
-- Standardized evaluation metrics across technical, cognitive, and soft skills.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_skill_profiles (
    student_id INTEGER PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
    coding_skill_score REAL NOT NULL CHECK (coding_skill_score BETWEEN 0.0 AND 100.0),
    aptitude_score REAL NOT NULL CHECK (aptitude_score BETWEEN 0.0 AND 100.0),
    communication_skill_score REAL NOT NULL CHECK (communication_skill_score BETWEEN 0.0 AND 100.0),
    logical_reasoning_score REAL NOT NULL CHECK (logical_reasoning_score BETWEEN 0.0 AND 100.0),
    mock_interview_score REAL NOT NULL CHECK (mock_interview_score BETWEEN 0.0 AND 100.0),
    hackathons_participated INTEGER NOT NULL DEFAULT 0 CHECK (hackathons_participated >= 0),
    github_repos INTEGER NOT NULL DEFAULT 0 CHECK (github_repos >= 0),
    linkedin_connections INTEGER NOT NULL DEFAULT 0 CHECK (linkedin_connections >= 0),
    extracurricular_score REAL NOT NULL DEFAULT 0.0 CHECK (extracurricular_score BETWEEN 0.0 AND 100.0),
    leadership_score REAL NOT NULL DEFAULT 0.0 CHECK (leadership_score BETWEEN 0.0 AND 100.0),
    volunteer_experience TEXT NOT NULL CHECK (volunteer_experience IN ('Yes', 'No'))
);

-- -----------------------------------------------------------------------------
-- 5. Student Placement Records Table
-- Placement outcomes, compensation packages, and portfolio metrics.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_placement_records (
    student_id INTEGER PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
    internships_count INTEGER NOT NULL DEFAULT 0 CHECK (internships_count >= 0),
    projects_count INTEGER NOT NULL DEFAULT 0 CHECK (projects_count >= 0),
    certifications_count INTEGER NOT NULL DEFAULT 0 CHECK (certifications_count >= 0),
    placement_status TEXT NOT NULL CHECK (placement_status IN ('Placed', 'Not Placed')),
    salary_package_lpa REAL NOT NULL DEFAULT 0.0 CHECK (salary_package_lpa >= 0.0)
);

CREATE INDEX IF NOT EXISTS idx_placement_status ON student_placement_records(placement_status);

-- -----------------------------------------------------------------------------
-- 6. Cohort Benchmarks Table
-- Aggregated statistical metrics per department for historical benchmarking.
-- CLASSIFICATION: HISTORICAL BENCHMARK DATASET · NOT INDIVIDUAL AUDIT
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cohort_benchmarks (
    branch_code TEXT PRIMARY KEY REFERENCES departments(code),
    total_students INTEGER NOT NULL,
    average_cgpa REAL NOT NULL,
    average_attendance REAL NOT NULL,
    placed_count INTEGER NOT NULL,
    placement_rate REAL NOT NULL,
    average_package_lpa REAL NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 7. Campus Maintenance Tickets Table
-- Durable storage for campus facilities issues and work orders.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id TEXT PRIMARY KEY,
    location TEXT NOT NULL,
    issue TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'urgent', 'critical')),
    reported_by TEXT NOT NULL,
    reporter_id TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_reporter ON maintenance_tickets(reporter_id);

-- -----------------------------------------------------------------------------
-- 8. Data Ingestion & Provenance Log Table
-- Traceable records of dataset extraction and batch validation history.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS provenance_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_file TEXT NOT NULL,
    record_count INTEGER NOT NULL,
    ingested_at TEXT DEFAULT CURRENT_TIMESTAMP,
    classification TEXT NOT NULL,
    status TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- 9. Campus Event Registrations Table
-- Durable tracking of authenticated student registrations for campus events.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_registrations (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_reg_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_user ON event_registrations(user_id);

