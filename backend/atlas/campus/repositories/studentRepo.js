/**
 * Atlas Student Data Access Repository
 * 
 * Enforces point-of-access student data isolation and department-scoped faculty RBAC.
 */

import { assertStudentAccess, SecurityError } from '../../security/index.js'

export class StudentRepository {
  constructor(db) {
    this.db = db
    this.stmtGetById = db.prepare(`
      SELECT student_id, name, age, gender, branch_code AS branch, college_tier, created_at
      FROM students
      WHERE student_id = ?
    `)

    this.stmtListByBranch = db.prepare(`
      SELECT student_id, name, age, gender, branch_code AS branch, college_tier
      FROM students
      WHERE branch_code = ?
      LIMIT ?
    `)
  }

  /**
   * Retrieves a student profile by ID with point-of-access authorization check.
   * 
   * @param {number|string} studentId 
   * @param {Object} reqUser - Authenticated user context from req.user
   * @returns {Object|null}
   */
  getStudentById(studentId, reqUser) {
    if (!reqUser) {
      throw new SecurityError('UNAUTHENTICATED', 'Authentication required to access student records.', 401)
    }

    const row = this.stmtGetById.get(Number(studentId))
    if (!row) return null

    // Point-of-access isolation check
    assertStudentAccess(reqUser, row)

    return Object.freeze({
      ...row,
      classification: 'STUDENT_RECORD · PRIVATE'
    })
  }

  /**
   * Retrieves students for a department, restricted to authorized faculty and admins.
   * 
   * @param {string} branchCode 
   * @param {Object} reqUser 
   * @param {number} [limit=50] 
   * @returns {Array<Object>}
   */
  listStudentsByDepartment(branchCode, reqUser, limit = 50) {
    if (!reqUser) {
      throw new SecurityError('UNAUTHENTICATED', 'Authentication required.', 401)
    }

    // Role check: Only faculty belonging to this department or admin can list
    if (reqUser.role === 'faculty') {
      const facultyDept = String(reqUser.department || '').trim().toUpperCase()
      if (facultyDept !== String(branchCode).trim().toUpperCase()) {
        throw new SecurityError('FORBIDDEN_DEPARTMENT_SCOPE', 'Access Denied: Department is outside your assigned scope.', 403)
      }
    } else if (reqUser.role !== 'admin') {
      throw new SecurityError('FORBIDDEN_ROLE', 'Access Denied: Students cannot query cohort rosters.', 403)
    }

    const rows = this.stmtListByBranch.all(branchCode, limit)
    return rows.map(r => Object.freeze({ ...r, classification: 'STUDENT_RECORD · AUDIT' }))
  }
}

export default StudentRepository
