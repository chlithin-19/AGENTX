-- =============================================================================
-- Migration: 001_initial_student_schema.sql
-- Target Database: PostgreSQL 14+
-- Phase: Atlas Phase 2B (Relational Schema & Migration Foundation)
-- Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md (Section 13)
-- Data Plan Reference: ATLAS_DATA_ARCHITECTURE_PLAN.md (Section 2 & 3)
-- Description: Establishes the 6 canonical relational tables for student profiles,
--              academic standing, skill assessments, portfolio, and placement records.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Departments Table
-- Canonical academic branch classification matching dataset categories.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Seed authoritative branches present in Kaggle dataset (no speculative additions)
INSERT INTO departments (code, name) VALUES
    ('CSE', 'Computer Science and Engineering'),
    ('IT', 'Information Technology'),
    ('ECE', 'Electronics and Communication Engineering'),
    ('EEE', 'Electrical and Electronics Engineering'),
    ('Mechanical', 'Mechanical Engineering'),
    ('Civil', 'Civil Engineering')
ON CONFLICT (code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Master Students Table
-- Primary student identity entity linking demographic and institutional attributes.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    student_id INT PRIMARY KEY,
    age INT NOT NULL CHECK (age BETWEEN 15 AND 35),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    branch_code VARCHAR(10) NOT NULL REFERENCES departments(code),
    college_tier VARCHAR(10) NOT NULL CHECK (college_tier IN ('Tier 1', 'Tier 2', 'Tier 3')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. Student Academic Records Table
-- Authoritative educational standing, attendance tracking, and backlog metrics.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_academic_records (
    student_id INT PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
    cgpa NUMERIC(4,2) NOT NULL CHECK (cgpa BETWEEN 0.0 AND 10.0),
    attendance_percentage NUMERIC(5,2) NOT NULL CHECK (attendance_percentage BETWEEN 0.0 AND 100.0),
    backlogs INT NOT NULL DEFAULT 0 CHECK (backlogs >= 0),
    study_hours_per_day NUMERIC(4,2) CHECK (study_hours_per_day >= 0.0),
    sleep_hours NUMERIC(4,2) CHECK (sleep_hours >= 0.0)
);

-- -----------------------------------------------------------------------------
-- 4. Student Skill Profiles Table
-- Standardized evaluation metrics across technical, cognitive, and soft skills.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_skill_profiles (
    student_id INT PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
    coding_score NUMERIC(5,2) CHECK (coding_score BETWEEN 0.0 AND 100.0),
    aptitude_score NUMERIC(5,2) CHECK (aptitude_score BETWEEN 0.0 AND 100.0),
    communication_score NUMERIC(5,2) CHECK (communication_score BETWEEN 0.0 AND 100.0),
    logical_score NUMERIC(5,2) CHECK (logical_score BETWEEN 0.0 AND 100.0),
    mock_interview_score NUMERIC(5,2) CHECK (mock_interview_score BETWEEN 0.0 AND 100.0)
);

-- -----------------------------------------------------------------------------
-- 5. Student Portfolio Records Table
-- Co-curricular activities, technical projects, repositories, and certifications.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_portfolio_records (
    student_id INT PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
    internships_count INT NOT NULL DEFAULT 0 CHECK (internships_count >= 0),
    projects_count INT NOT NULL DEFAULT 0 CHECK (projects_count >= 0),
    certifications_count INT NOT NULL DEFAULT 0 CHECK (certifications_count >= 0),
    hackathons_participated INT NOT NULL DEFAULT 0 CHECK (hackathons_participated >= 0),
    github_repos INT NOT NULL DEFAULT 0 CHECK (github_repos >= 0),
    linkedin_connections INT NOT NULL DEFAULT 0 CHECK (linkedin_connections >= 0),
    extracurricular_score NUMERIC(5,2) CHECK (extracurricular_score BETWEEN 0.0 AND 100.0),
    leadership_score NUMERIC(5,2) CHECK (leadership_score BETWEEN 0.0 AND 100.0),
    volunteer_experience BOOLEAN NOT NULL DEFAULT FALSE
);

-- -----------------------------------------------------------------------------
-- 6. Student Placement Records Table
-- Career recruitment status and verified financial compensation packages.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_placement_records (
    student_id INT PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
    placement_status VARCHAR(20) NOT NULL CHECK (placement_status IN ('Placed', 'Not Placed')),
    salary_package_lpa NUMERIC(6,2) NOT NULL DEFAULT 0.0 CHECK (salary_package_lpa >= 0.0),
    CONSTRAINT chk_placement_salary_consistency CHECK (
        (placement_status = 'Not Placed' AND salary_package_lpa = 0.0)
        OR
        (placement_status = 'Placed' AND salary_package_lpa >= 0.0)
    )
);

-- -----------------------------------------------------------------------------
-- 7. High-Priority Performance Indexes
-- Justified by Academic Agent query patterns and cohort benchmarking.
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_branch_tier 
    ON students(branch_code, college_tier);

CREATE INDEX IF NOT EXISTS idx_academic_attendance 
    ON student_academic_records(attendance_percentage);

CREATE INDEX IF NOT EXISTS idx_academic_cgpa_backlogs 
    ON student_academic_records(cgpa, backlogs);

CREATE INDEX IF NOT EXISTS idx_skill_coding_aptitude 
    ON student_skill_profiles(coding_score, aptitude_score);

CREATE INDEX IF NOT EXISTS idx_placement_status_salary 
    ON student_placement_records(placement_status, salary_package_lpa);
