/**
 * Atlas Reproducible Dataset Ingestion Pipeline
 * 
 * Target Database: SQLite 3 via Node.js native node:sqlite DatabaseSync
 * Source Asset: student_placement_prediction_dataset_2026.csv (extracted from archive.zip)
 * 
 * CLASSIFICATION: HISTORICAL BENCHMARK DATASET · STUDENT PERFORMANCE BENCHMARK
 * Invariant: Benchmark placement data is strictly segregated from live student records.
 */

import { DatabaseSync } from 'node:sqlite'
import { existsSync, readFileSync, createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Canonical paths
export const DEFAULT_DB_PATH = path.resolve(__dirname, '../../../data/campus.db')
export const SCHEMA_PATH = path.resolve(__dirname, '../schemas/schema.sqlite.sql')
export const CSV_PATH = path.resolve(__dirname, '../../../../student_placement_prediction_dataset_2026.csv')

// Synthetic name mapping for the first few canonical personas (derived from dataset IDs)
const CANONICAL_NAMES = {
  1: 'Alex Kumar',
  2: 'Priya Sharma',
  3: 'Sneha Reddy',
  4: 'Rohan Varma',
  5: 'Ananya Patel'
}

/**
 * Initializes database and executes DDL schema.
 * 
 * @param {string} [dbPath=DEFAULT_DB_PATH] 
 * @returns {DatabaseSync}
 */
export function initDatabase(dbPath = DEFAULT_DB_PATH) {
  const db = new DatabaseSync(dbPath)
  db.exec('PRAGMA foreign_keys = ON;')
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA busy_timeout = 5000;')
  
  if (existsSync(SCHEMA_PATH)) {
    const ddl = readFileSync(SCHEMA_PATH, 'utf8')
    db.exec(ddl)
  }
  return db
}

/**
 * Validates a single parsed row from the Kaggle dataset.
 * 
 * @param {Object} row 
 * @throws {Error} if any constraint is violated
 */
export function validateRow(row) {
  const studentId = Number(row.student_id)
  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new Error(`Invalid student_id: ${row.student_id}`)
  }

  const age = Number(row.age)
  if (!Number.isInteger(age) || age < 15 || age > 35) {
    throw new Error(`Invalid age: ${row.age}`)
  }

  const validGenders = ['Male', 'Female']
  if (!validGenders.includes(row.gender)) {
    throw new Error(`Invalid gender: ${row.gender}`)
  }

  const validBranches = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil']
  if (!validBranches.includes(row.branch)) {
    throw new Error(`Invalid branch: ${row.branch}`)
  }

  const cgpa = Number(row.cgpa)
  if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
    throw new Error(`Invalid cgpa: ${row.cgpa}`)
  }

  const attendance = Number(row.attendance_percentage)
  if (isNaN(attendance) || attendance < 0 || attendance > 100) {
    throw new Error(`Invalid attendance_percentage: ${row.attendance_percentage}`)
  }

  const backlogs = Number(row.backlogs)
  if (!Number.isInteger(backlogs) || backlogs < 0) {
    throw new Error(`Invalid backlogs: ${row.backlogs}`)
  }

  return true
}

/**
 * Ingests dataset from CSV into the relational SQLite database.
 * 
 * @param {Object} options
 * @param {string} [options.dbPath] - Database file path
 * @param {string} [options.csvPath] - CSV file path
 * @param {number} [options.limit=10000] - Max records to ingest (use Infinity or 0 for all)
 * @returns {Promise<Object>} Ingestion summary statistics
 */
export async function ingestDataset({
  dbPath = DEFAULT_DB_PATH,
  csvPath = CSV_PATH,
  limit = 10000
} = {}) {
  const startTime = Date.now()

  if (!existsSync(csvPath)) {
    throw new Error(`Dataset CSV not found at: ${csvPath}. Ensure archive.zip has been extracted.`)
  }

  const db = initDatabase(dbPath)

  // Prepared statements for batch insertion
  const insertStudent = db.prepare(`
    INSERT OR REPLACE INTO students (student_id, name, age, gender, branch_code, college_tier)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const insertAcademic = db.prepare(`
    INSERT OR REPLACE INTO student_academic_records (student_id, cgpa, attendance_percentage, backlogs, study_hours_per_day, sleep_hours)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const insertSkills = db.prepare(`
    INSERT OR REPLACE INTO student_skill_profiles (
      student_id, coding_skill_score, aptitude_score, communication_skill_score,
      logical_reasoning_score, mock_interview_score, hackathons_participated,
      github_repos, linkedin_connections, extracurricular_score, leadership_score,
      volunteer_experience
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertPlacement = db.prepare(`
    INSERT OR REPLACE INTO student_placement_records (
      student_id, internships_count, projects_count, certifications_count,
      placement_status, salary_package_lpa
    ) VALUES (?, ?, ?, ?, ?, ?)
  `)

  const fileStream = createReadStream(csvPath)
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let isHeader = true
  let headers = []
  let recordCount = 0
  let errorCount = 0
  const maxRecords = limit > 0 ? limit : Infinity

  // Wrap insertions in a single transaction for maximum execution speed
  db.exec('BEGIN TRANSACTION;')

  try {
    for await (const line of rl) {
      if (!line || !line.trim()) continue

      if (isHeader) {
        headers = line.split(',').map(h => h.trim())
        isHeader = false
        continue
      }

      if (recordCount >= maxRecords) {
        break
      }

      const values = line.split(',')
      if (values.length !== headers.length) {
        errorCount++
        continue
      }

      const row = {}
      for (let i = 0; i < headers.length; i++) {
        row[headers[i]] = values[i].trim()
      }

      try {
        validateRow(row)

        const studentId = Number(row.student_id)
        const name = CANONICAL_NAMES[studentId] || `Student #${studentId}`

        insertStudent.run(
          studentId,
          name,
          Number(row.age),
          row.gender,
          row.branch,
          row.college_tier
        )

        insertAcademic.run(
          studentId,
          Number(row.cgpa),
          Number(row.attendance_percentage),
          Number(row.backlogs),
          Number(row.study_hours_per_day),
          Number(row.sleep_hours)
        )

        insertSkills.run(
          studentId,
          Number(row.coding_skill_score),
          Number(row.aptitude_score),
          Number(row.communication_skill_score),
          Number(row.logical_reasoning_score),
          Number(row.mock_interview_score),
          Number(row.hackathons_participated),
          Number(row.github_repos),
          Number(row.linkedin_connections),
          Number(row.extracurricular_score),
          Number(row.leadership_score),
          row.volunteer_experience
        )

        insertPlacement.run(
          studentId,
          Number(row.internships_count),
          Number(row.projects_count),
          Number(row.certifications_count),
          row.placement_status,
          Number(row.salary_package_lpa)
        )

        recordCount++
      } catch (validationErr) {
        errorCount++
      }
    }

    // 2. Compute Cohort Aggregate Benchmarks
    const updateBenchmarks = db.prepare(`
      INSERT OR REPLACE INTO cohort_benchmarks (
        branch_code, total_students, average_cgpa, average_attendance,
        placed_count, placement_rate, average_package_lpa, updated_at
      )
      SELECT 
        s.branch_code,
        COUNT(s.student_id) AS total_students,
        ROUND(AVG(a.cgpa), 2) AS average_cgpa,
        ROUND(AVG(a.attendance_percentage), 2) AS average_attendance,
        SUM(CASE WHEN p.placement_status = 'Placed' THEN 1 ELSE 0 END) AS placed_count,
        ROUND((SUM(CASE WHEN p.placement_status = 'Placed' THEN 1.0 ELSE 0.0 END) / COUNT(s.student_id)) * 100.0, 2) AS placement_rate,
        ROUND(AVG(CASE WHEN p.placement_status = 'Placed' THEN p.salary_package_lpa ELSE 0 END), 2) AS average_package_lpa,
        CURRENT_TIMESTAMP
      FROM students s
      JOIN student_academic_records a ON s.student_id = a.student_id
      JOIN student_placement_records p ON s.student_id = p.student_id
      GROUP BY s.branch_code;
    `)
    updateBenchmarks.run()

    // 3. Log Provenance
    const logProvenance = db.prepare(`
      INSERT INTO provenance_log (source_file, record_count, classification, status)
      VALUES (?, ?, ?, ?)
    `)
    logProvenance.run(
      path.basename(csvPath),
      recordCount,
      'HISTORICAL_BENCHMARK_DATASET',
      'SUCCESS'
    )

    db.exec('COMMIT;')
  } catch (err) {
    db.exec('ROLLBACK;')
    throw err
  }

  const durationMs = Date.now() - startTime

  return {
    status: 'success',
    recordCount,
    errorCount,
    durationMs,
    classification: 'HISTORICAL_BENCHMARK_DATASET · STUDENT PERFORMANCE BENCHMARK',
    provenance: {
      sourceFile: path.basename(csvPath),
      destinationDb: path.basename(dbPath),
      ingestedAt: new Date().toISOString()
    }
  }
}

export default {
  initDatabase,
  validateRow,
  ingestDataset,
  DEFAULT_DB_PATH
}
