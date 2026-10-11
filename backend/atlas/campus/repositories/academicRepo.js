/**
 * Atlas Academic Records Repository
 * 
 * Enforces point-of-access student data isolation on attendance, CGPA, and backlogs.
 */

import { assertStudentAccess, SecurityError } from '../../security/index.js'

export class AcademicRepository {
  constructor(db) {
    this.db = db
    this.stmtGetAcademic = db.prepare(`
      SELECT 
        s.student_id,
        s.name,
        s.branch_code AS branch,
        a.cgpa,
        a.attendance_percentage,
        a.backlogs,
        a.study_hours_per_day,
        a.sleep_hours
      FROM student_academic_records a
      JOIN students s ON a.student_id = s.student_id
      WHERE a.student_id = ?
    `)
  }

  /**
   * Retrieves academic standing for a student with point-of-access authorization check.
   * 
   * @param {number|string} studentId 
   * @param {Object} reqUser - Authenticated user context
   * @returns {Object|null}
   */
  getAcademicRecord(studentId, reqUser) {
    if (!reqUser) {
      throw new SecurityError('UNAUTHENTICATED', 'Authentication required to access academic metrics.', 401)
    }

    const row = this.stmtGetAcademic.get(Number(studentId))
    if (!row) return null

    // Point-of-access isolation check
    assertStudentAccess(reqUser, row)

    return Object.freeze({
      ...row,
      classification: 'ACADEMIC_RECORD · PRIVATE'
    })
  }
}

export default AcademicRepository
