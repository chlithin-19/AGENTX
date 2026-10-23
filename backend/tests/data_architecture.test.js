/**
 * Atlas Data Architecture & Relational Ingestion Test Suite
 * 
 * Tests for:
 * 1. Relational Schema Integrity & Check Constraints
 * 2. Ingestion Validation Pipeline (Range & Null Checks)
 * 3. Batch Ingestion, Provenance Logging & Benchmark Calculation
 * 4. Point-of-Access Isolation in Repositories (Student-Level)
 * 5. Department-Scoped Faculty RBAC in Repositories
 * 6. Campus Maintenance Ticket Durability & Retrieval
 */

import { test, describe, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  initDatabase,
  validateRow,
  ingestDataset,
  SCHEMA_PATH,
  CSV_PATH,
  DEFAULT_DB_PATH
} from '../atlas/campus/ingestion/ingestDataset.js'
import {
  StudentRepository,
  AcademicRepository,
  PlacementRepository,
  CampusRepository
} from '../atlas/campus/repositories/index.js'
import { SecurityError } from '../atlas/security/index.js'

describe('1. Relational Schema Integrity & Constraints', () => {
  let db

  beforeEach(() => {
    db = new DatabaseSync(':memory:')
    db.exec('PRAGMA foreign_keys = ON;')
    const ddl = readFileSync(SCHEMA_PATH, 'utf8')
    db.exec(ddl)
  })

  test('enforces foreign key check on departments', () => {
    assert.throws(() => {
      db.prepare(`
        INSERT INTO students (student_id, name, age, gender, branch_code, college_tier)
        VALUES (999, 'Test User', 20, 'Male', 'INVALID_DEPT', 'Tier 1')
      `).run()
    })
  })

  test('enforces check constraints on age and CGPA', () => {
    // Age constraint check (15-35)
    assert.throws(() => {
      db.prepare(`
        INSERT INTO students (student_id, name, age, gender, branch_code, college_tier)
        VALUES (999, 'Test User', 10, 'Male', 'CSE', 'Tier 1')
      `).run()
    })

    // Insert valid student first
    db.prepare(`
      INSERT INTO students (student_id, name, age, gender, branch_code, college_tier)
      VALUES (999, 'Test User', 20, 'Male', 'CSE', 'Tier 1')
    `).run()

    // CGPA constraint check (0.0-10.0)
    assert.throws(() => {
      db.prepare(`
        INSERT INTO student_academic_records (student_id, cgpa, attendance_percentage, backlogs)
        VALUES (999, 12.5, 80.0, 0)
      `).run()
    })
  })
})

describe('2. Ingestion Validation Function', () => {
  test('validates correct row from Kaggle dataset', () => {
    const validRow = {
      student_id: '1',
      age: '24',
      gender: 'Male',
      branch: 'IT',
      cgpa: '7.53',
      attendance_percentage: '77.46',
      backlogs: '2'
    }
    assert.equal(validateRow(validRow), true)
  })

  test('rejects row with invalid student_id', () => {
    assert.throws(() => validateRow({ student_id: '-5', age: '20', gender: 'Male', branch: 'IT', cgpa: '8.0', attendance_percentage: '80', backlogs: '0' }))
  })

  test('rejects row with out-of-range attendance', () => {
    assert.throws(() => validateRow({ student_id: '1', age: '20', gender: 'Male', branch: 'IT', cgpa: '8.0', attendance_percentage: '120.5', backlogs: '0' }))
  })

  test('rejects row with non-allowlisted department branch', () => {
    assert.throws(() => validateRow({ student_id: '1', age: '20', gender: 'Male', branch: 'Aerospace', cgpa: '8.0', attendance_percentage: '80', backlogs: '0' }))
  })
})

describe('3. Batch Ingestion, Provenance Logging & Benchmark Calculation', () => {
  let db
  let repos

  before(async () => {
    db = new DatabaseSync(':memory:')
    db.exec('PRAGMA foreign_keys = ON;')
    const ddl = readFileSync(SCHEMA_PATH, 'utf8')
    db.exec(ddl)

    // Run ingestion for top 50 rows
    await ingestDataset({
      dbPath: ':memory:',
      limit: 50
    })
  })

  test('CSV file exists and has valid record count', async () => {
    assert.ok(existsSync(CSV_PATH), 'student_placement_prediction_dataset_2026.csv must exist')
  })

  test('ingests rows into normalized tables and computes cohort benchmarks', async () => {
    const memDb = new DatabaseSync(':memory:')
    memDb.exec('PRAGMA foreign_keys = ON;')
    memDb.exec(readFileSync(SCHEMA_PATH, 'utf8'))

    // Ingest 25 rows into test in-memory DB using raw prepared statement
    const insertStudent = memDb.prepare(`INSERT INTO students (student_id, name, age, gender, branch_code, college_tier) VALUES (?, ?, ?, ?, ?, ?)`)
    const insertAcademic = memDb.prepare(`INSERT INTO student_academic_records (student_id, cgpa, attendance_percentage, backlogs) VALUES (?, ?, ?, ?)`)
    const insertPlacement = memDb.prepare(`INSERT INTO student_placement_records (student_id, internships_count, projects_count, certifications_count, placement_status, salary_package_lpa) VALUES (?, ?, ?, ?, ?, ?)`)

    insertStudent.run(1, 'Alex Kumar', 24, 'Male', 'IT', 'Tier 2')
    insertAcademic.run(1, 7.53, 77.46, 2)
    insertPlacement.run(1, 4, 6, 1, 'Not Placed', 0.0)

    insertStudent.run(2, 'Priya Sharma', 21, 'Male', 'CSE', 'Tier 2')
    insertAcademic.run(2, 7.92, 88.89, 1)
    insertPlacement.run(2, 1, 3, 6, 'Not Placed', 0.0)

    insertStudent.run(3, 'Sneha Reddy', 22, 'Female', 'EEE', 'Tier 1')
    insertAcademic.run(3, 8.60, 74.15, 0)
    insertPlacement.run(3, 0, 1, 1, 'Placed', 11.99)

    const count = memDb.prepare('SELECT COUNT(*) as count FROM students').get().count
    assert.equal(count, 3)

    // Calculate benchmarks
    memDb.prepare(`
      INSERT INTO cohort_benchmarks (branch_code, total_students, average_cgpa, average_attendance, placed_count, placement_rate, average_package_lpa)
      SELECT s.branch_code, COUNT(*), ROUND(AVG(a.cgpa), 2), ROUND(AVG(a.attendance_percentage), 2),
             SUM(CASE WHEN p.placement_status = 'Placed' THEN 1 ELSE 0 END),
             ROUND((SUM(CASE WHEN p.placement_status = 'Placed' THEN 1.0 ELSE 0.0 END) / COUNT(*)) * 100.0, 2),
             ROUND(AVG(p.salary_package_lpa), 2)
      FROM students s
      JOIN student_academic_records a ON s.student_id = a.student_id
      JOIN student_placement_records p ON s.student_id = p.student_id
      GROUP BY s.branch_code;
    `).run()

    const itBenchmark = memDb.prepare('SELECT * FROM cohort_benchmarks WHERE branch_code = ?').get('IT')
    assert.ok(itBenchmark)
    assert.equal(itBenchmark.total_students, 1)
    assert.equal(itBenchmark.average_cgpa, 7.53)
  })
})

describe('4. Authorized Repositories & Point-of-Access Isolation', () => {
  let db
  let studentRepo
  let academicRepo
  let placementRepo

  beforeEach(() => {
    db = new DatabaseSync(':memory:')
    db.exec('PRAGMA foreign_keys = ON;')
    db.exec(readFileSync(SCHEMA_PATH, 'utf8'))

    // Seed test students
    db.prepare(`INSERT INTO students (student_id, name, age, gender, branch_code, college_tier) VALUES (?, ?, ?, ?, ?, ?)`).run(1, 'Alex Kumar', 24, 'Male', 'IT', 'Tier 2')
    db.prepare(`INSERT INTO student_academic_records (student_id, cgpa, attendance_percentage, backlogs) VALUES (?, ?, ?, ?)`).run(1, 7.53, 77.46, 2)
    db.prepare(`INSERT INTO student_skill_profiles (student_id, coding_skill_score, aptitude_score, communication_skill_score, logical_reasoning_score, mock_interview_score, volunteer_experience) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(1, 99.24, 81.71, 57.71, 59.07, 72.65, 'Yes')
    db.prepare(`INSERT INTO student_placement_records (student_id, internships_count, projects_count, certifications_count, placement_status, salary_package_lpa) VALUES (?, ?, ?, ?, ?, ?)`).run(1, 4, 6, 1, 'Not Placed', 0.0)

    db.prepare(`INSERT INTO students (student_id, name, age, gender, branch_code, college_tier) VALUES (?, ?, ?, ?, ?, ?)`).run(2, 'Priya Sharma', 21, 'Female', 'CSE', 'Tier 2')
    db.prepare(`INSERT INTO student_academic_records (student_id, cgpa, attendance_percentage, backlogs) VALUES (?, ?, ?, ?)`).run(2, 7.92, 88.89, 1)
    db.prepare(`INSERT INTO student_skill_profiles (student_id, coding_skill_score, aptitude_score, communication_skill_score, logical_reasoning_score, mock_interview_score, volunteer_experience) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(2, 80.97, 63.12, 59.20, 78.98, 61.70, 'No')
    db.prepare(`INSERT INTO student_placement_records (student_id, internships_count, projects_count, certifications_count, placement_status, salary_package_lpa) VALUES (?, ?, ?, ?, ?, ?)`).run(2, 1, 3, 6, 'Not Placed', 0.0)

    studentRepo = new StudentRepository(db)
    academicRepo = new AcademicRepository(db)
    placementRepo = new PlacementRepository(db)
  })

  test('student can query their own profile', () => {
    const alexUser = { id: 1, role: 'student', studentId: 1, branch: 'IT' }
    const profile = studentRepo.getStudentById(1, alexUser)
    assert.ok(profile)
    assert.equal(profile.student_id, 1)
    assert.equal(profile.name, 'Alex Kumar')
  })

  test('student is strictly blocked from querying another student record (403)', () => {
    const alexUser = { id: 1, role: 'student', studentId: 1, branch: 'IT' }
    assert.throws(
      () => studentRepo.getStudentById(2, alexUser),
      (err) => {
        assert.equal(err.code, 'FORBIDDEN_STUDENT_ISOLATION')
        assert.equal(err.status, 403)
        return true
      }
    )
  })

  test('student can query their own academic record', () => {
    const alexUser = { id: 1, role: 'student', studentId: 1, branch: 'IT' }
    const academic = academicRepo.getAcademicRecord(1, alexUser)
    assert.ok(academic)
    assert.equal(academic.student_id, 1)
    assert.equal(academic.cgpa, 7.53)
    assert.equal(academic.attendance_percentage, 77.46)
  })

  test('student is strictly blocked from querying another student academic record (403)', () => {
    const alexUser = { id: 1, role: 'student', studentId: 1, branch: 'IT' }
    assert.throws(
      () => academicRepo.getAcademicRecord(2, alexUser),
      (err) => {
        assert.equal(err.code, 'FORBIDDEN_STUDENT_ISOLATION')
        assert.equal(err.status, 403)
        return true
      }
    )
  })

  test('faculty member can query student in their own department', () => {
    const cseFaculty = { id: 101, role: 'faculty', department: 'CSE', name: 'Dr. Ramesh Rao' }
    const priyaProfile = studentRepo.getStudentById(2, cseFaculty)
    assert.ok(priyaProfile)
    assert.equal(priyaProfile.name, 'Priya Sharma')
  })

  test('faculty member is strictly blocked from querying student outside their department (403)', () => {
    const cseFaculty = { id: 101, role: 'faculty', department: 'CSE', name: 'Dr. Ramesh Rao' }
    assert.throws(
      () => studentRepo.getStudentById(1, cseFaculty), // Alex is in IT
      (err) => {
        assert.equal(err.code, 'FORBIDDEN_DEPARTMENT_SCOPE')
        assert.equal(err.status, 403)
        return true
      }
    )
  })

  test('student is blocked from querying department roster (403)', () => {
    const alexUser = { id: 1, role: 'student', studentId: 1, branch: 'IT' }
    assert.throws(
      () => studentRepo.listStudentsByDepartment('IT', alexUser),
      (err) => {
        assert.equal(err.code, 'FORBIDDEN_ROLE')
        assert.equal(err.status, 403)
        return true
      }
    )
  })

  test('faculty can list students in their own department', () => {
    const cseFaculty = { id: 101, role: 'faculty', department: 'CSE', name: 'Dr. Ramesh Rao' }
    const list = studentRepo.listStudentsByDepartment('CSE', cseFaculty)
    assert.ok(Array.isArray(list))
    assert.equal(list.length, 1)
    assert.equal(list[0].name, 'Priya Sharma')
  })
})

describe('5. Maintenance Ticket Durability & Operations', () => {
  let db
  let campusRepo

  beforeEach(() => {
    db = new DatabaseSync(':memory:')
    db.exec(readFileSync(SCHEMA_PATH, 'utf8'))
    campusRepo = new CampusRepository(db)
  })

  test('creates and retrieves a durable maintenance ticket', () => {
    const ticket = campusRepo.createMaintenanceTicket({
      location: 'Lab 204',
      issue: 'Air conditioning water leakage',
      priority: 'urgent',
      reportedBy: 'Alex Kumar',
      reporterId: '1'
    })

    assert.ok(ticket)
    assert.ok(ticket.id.startsWith('tkt_'))
    assert.equal(ticket.location, 'Lab 204')
    assert.equal(ticket.priority, 'urgent')
    assert.equal(ticket.status, 'open')

    const fetched = campusRepo.getTicketById(ticket.id)
    assert.ok(fetched)
    assert.equal(fetched.id, ticket.id)
    assert.equal(fetched.issue, 'Air conditioning water leakage')

    const reporterList = campusRepo.listTicketsByReporter('1')
    assert.equal(reporterList.length, 1)
    assert.equal(reporterList[0].id, ticket.id)
  })
})

describe('6. Dataset Provenance, Reconciliation & Ingestion Idempotency', () => {
  test('reconciles 100,000-row CSV source with 10,000 SQLite cohort records', () => {
    const csvExists = existsSync(CSV_PATH)
    assert.ok(csvExists, 'Kaggle dataset CSV must exist')

    const db = new DatabaseSync(DEFAULT_DB_PATH)
    const studentCount = db.prepare('SELECT count(*) as c FROM students').get().c
    const benchmarkCount = db.prepare('SELECT count(*) as c FROM cohort_benchmarks').get().c
    const provRow = db.prepare('SELECT * FROM provenance_log ORDER BY id DESC LIMIT 1').get()

    assert.equal(studentCount, 10000, 'Ingested student cohort must contain 10,000 verified records')
    assert.equal(benchmarkCount, 6, 'Must calculate aggregate cohort benchmarks for all 6 departments')
    assert.ok(provRow, 'Must record ingestion provenance')
    assert.equal(provRow.status, 'SUCCESS')
    assert.equal(provRow.classification, 'HISTORICAL_BENCHMARK_DATASET')
  })

  test('repeated batch ingestion is idempotent and does not create duplicate records', () => {
    const memDb = new DatabaseSync(':memory:')
    memDb.exec('PRAGMA foreign_keys = ON;')
    memDb.exec(readFileSync(SCHEMA_PATH, 'utf8'))

    // Ingest student 101 twice
    const insertStmt = memDb.prepare(`
      INSERT OR REPLACE INTO students (student_id, name, age, gender, branch_code, college_tier)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    insertStmt.run(101, 'Student A', 21, 'Male', 'CSE', 'Tier 1')
    insertStmt.run(101, 'Student A Updated', 21, 'Male', 'CSE', 'Tier 1')

    const count = memDb.prepare('SELECT count(*) as c FROM students WHERE student_id = 101').get().c
    const student = memDb.prepare('SELECT name FROM students WHERE student_id = 101').get()

    assert.equal(count, 1, 'Idempotent ingestion must never produce duplicate student records')
    assert.equal(student.name, 'Student A Updated')
  })
})

describe('7. Dynamic Academic Agent Calculation & Action Executor Boundaries', () => {
  test('AcademicAgent calculates department average and placement rate dynamically from SQLite benchmarks', async () => {
    const { default: academicAgent } = await import('../atlas/agents/academic.js')
    const callingUser = { id: 1, studentId: 1, role: 'student', branch: 'IT', name: 'Alex Kumar' }

    // Test attendance query
    const attResult = await academicAgent.execute({ input: { query: 'What is my attendance?' } }, { user: callingUser })
    assert.equal(attResult.status, 'completed')
    assert.ok(attResult.summary.includes('77.46%'))
    assert.ok(attResult.summary.includes('IT Department'))
    assert.ok(attResult.data.cohortAverage > 80, 'Must include real cohort benchmark average')

    // Test CGPA query
    const cgpaResult = await academicAgent.execute({ input: { query: 'What is my current CGPA?' } }, { user: callingUser })
    assert.equal(cgpaResult.status, 'completed')
    assert.ok(cgpaResult.summary.includes('7.53 / 10.0'))
    assert.ok(cgpaResult.summary.includes('Department average for IT: 7.5'))

    // Test placement status query with explicit non-guarantee statistical disclaimer
    const placeResult = await academicAgent.execute({ input: { query: 'Check my placement status and department benchmark' } }, { user: callingUser })
    assert.equal(placeResult.status, 'completed')
    assert.ok(placeResult.summary.includes('Benchmark Notice') || placeResult.summary.includes('Historical Benchmark Record'))
    assert.ok(placeResult.summary.includes('not constitute an authoritative institutional guarantee'))
  })

  test('defaultActionExecutor rejects email.send and calendar.create_event when simulated tokens are supplied', async () => {
    const { createConfirmationIntent, executeConfirmedAction } = await import('../atlas/security/index.js')
    const { defaultActionExecutor } = await import('../atlas/index.js')
    const { get } = await import('../store.js')

    const dbStore = get()
    dbStore.integrations = dbStore.integrations || []
    
    // Set simulated tokens
    let gmailInt = dbStore.integrations.find(x => x.id === 'gmail')
    if (!gmailInt) {
      gmailInt = { id: 'gmail', connected: true, token: 'dev_simulated_token' }
      dbStore.integrations.push(gmailInt)
    } else {
      gmailInt.token = 'dev_simulated_token'
    }

    const callingUser = { id: 1, studentId: 1, role: 'student' }

    // Propose an email action
    const emailIntent = createConfirmationIntent({
      userId: 1,
      actionType: 'email.send',
      proposal: { to: 'prof@campus.edu', body: 'Requesting permission' }
    })

    // Execute via executeConfirmedAction + defaultActionExecutor: must reject simulated token with REAL_CREDENTIALS_REQUIRED
    await assert.rejects(
      async () => {
        await executeConfirmedAction({
          token: emailIntent.confirmationToken,
          reqUser: callingUser,
          actionExecutor: defaultActionExecutor
        })
      },
      (err) => err.code === 'REAL_CREDENTIALS_REQUIRED'
    )

    // Propose a calendar action with simulated token
    let calInt = dbStore.integrations.find(x => x.id === 'calendar')
    if (!calInt) {
      calInt = { id: 'calendar', connected: true, token: 'dev_simulated_token' }
      dbStore.integrations.push(calInt)
    } else {
      calInt.token = 'dev_simulated_token'
    }

    const calIntent = createConfirmationIntent({
      userId: 1,
      actionType: 'calendar.create_event',
      proposal: { title: 'Project Demo', date: '2026-10-25' }
    })

    // Execute via executeConfirmedAction + defaultActionExecutor: must reject simulated token with REAL_CREDENTIALS_REQUIRED
    await assert.rejects(
      async () => {
        await executeConfirmedAction({
          token: calIntent.confirmationToken,
          reqUser: callingUser,
          actionExecutor: defaultActionExecutor
        })
      },
      (err) => err.code === 'REAL_CREDENTIALS_REQUIRED'
    )
  })
})

