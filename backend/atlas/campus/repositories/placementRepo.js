/**
 * Atlas Placement & Skill Repository
 * 
 * Manages student technical skill evaluations, placement outcomes, and cohort benchmarks.
 * Invariant: Benchmark statistics are segregated from private student records.
 */

import { assertStudentAccess, SecurityError } from '../../security/index.js'

export class PlacementRepository {
  constructor(db) {
    this.db = db

    this.stmtGetProfile = db.prepare(`
      SELECT 
        s.student_id,
        s.name,
        s.branch_code AS branch,
        k.coding_skill_score,
        k.aptitude_score,
        k.communication_skill_score,
        k.logical_reasoning_score,
        k.mock_interview_score,
        k.hackathons_participated,
        k.github_repos,
        k.linkedin_connections,
        k.extracurricular_score,
        k.leadership_score,
        k.volunteer_experience,
        p.internships_count,
        p.projects_count,
        p.certifications_count,
        p.placement_status,
        p.salary_package_lpa
      FROM students s
      JOIN student_skill_profiles k ON s.student_id = k.student_id
      JOIN student_placement_records p ON s.student_id = p.student_id
      WHERE s.student_id = ?
    `)

    this.stmtGetBenchmark = db.prepare(`
      SELECT 
        branch_code,
        total_students,
        average_cgpa,
        average_attendance,
        placed_count,
        placement_rate,
        average_package_lpa,
        updated_at
      FROM cohort_benchmarks
      WHERE branch_code = ?
    `)

    this.stmtGetAllBenchmarks = db.prepare(`
      SELECT 
        branch_code,
        total_students,
        average_cgpa,
        average_attendance,
        placed_count,
        placement_rate,
        average_package_lpa,
        updated_at
      FROM cohort_benchmarks
      ORDER BY placement_rate DESC
    `)
  }

  /**
   * Retrieves skill evaluation and placement record for a student with point-of-access check.
   * 
   * @param {number|string} studentId 
   * @param {Object} reqUser 
   * @returns {Object|null}
   */
  getPlacementProfile(studentId, reqUser) {
    if (!reqUser) {
      throw new SecurityError('UNAUTHENTICATED', 'Authentication required.', 401)
    }

    const row = this.stmtGetProfile.get(Number(studentId))
    if (!row) return null

    // Point-of-access check
    assertStudentAccess(reqUser, row)

    return Object.freeze({
      ...row,
      classification: 'CAREER_RECORD · PRIVATE'
    })
  }

  /**
   * Retrieves statistical aggregate benchmarks for a department.
   * Available to all authenticated campus users for general contextual comparison.
   * 
   * @param {string} branchCode 
   * @returns {Object|null}
   */
  getCohortBenchmark(branchCode) {
    const row = this.stmtGetBenchmark.get(branchCode)
    if (!row) return null

    return Object.freeze({
      ...row,
      classification: 'HISTORICAL_BENCHMARK_DATASET · AGGREGATE COHORT STATISTICS'
    })
  }

  /**
   * Retrieves all department benchmarks.
   * 
   * @returns {Array<Object>}
   */
  getAllCohortBenchmarks() {
    const rows = this.stmtGetAllBenchmarks.all()
    return rows.map(r => Object.freeze({
      ...r,
      classification: 'HISTORICAL_BENCHMARK_DATASET · AGGREGATE COHORT STATISTICS'
    }))
  }
}

export default PlacementRepository
