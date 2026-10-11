/**
 * Atlas Authorization & Scoped Access Control Module
 * 
 * Invariants:
 * 1. Enforces student-level isolation at point of access (no cross-student access).
 * 2. Enforces department-scoped faculty RBAC (faculty can only access students in their department).
 * 3. Never leaks private student data or existence in 403 error responses.
 */

export class SecurityError extends Error {
  constructor(code, message, status = 403) {
    super(message)
    this.name = 'SecurityError'
    this.code = code
    this.status = status
  }
}

/**
 * Asserts that the authenticated user has permission to access the target student's record.
 * 
 * @param {Object} reqUser - Authenticated user context from req.user
 * @param {Object} targetStudent - Target student record object (must have student_id and branch)
 * @throws {SecurityError} if access is forbidden
 * @returns {boolean} true if access is authorized
 */
export function assertStudentAccess(reqUser, targetStudent) {
  if (!reqUser) {
    throw new SecurityError('UNAUTHENTICATED', 'Authentication required to access student records.', 401)
  }

  if (!targetStudent) {
    return true
  }

  const role = reqUser.role || 'student'

  // 1. Student Role: Self-only access
  if (role === 'student') {
    const userStudentId = reqUser.studentId || reqUser.id
    if (String(targetStudent.student_id) !== String(userStudentId)) {
      throw new SecurityError(
        'FORBIDDEN_STUDENT_ISOLATION',
        'Access Denied: You do not have permission to access records outside your student account.',
        403
      )
    }
    return true
  }

  // 2. Faculty Role: Department-scoped access
  if (role === 'faculty') {
    const facultyDept = String(reqUser.department || '').trim().toUpperCase()
    const studentBranch = String(targetStudent.branch || '').trim().toUpperCase()

    if (!facultyDept || facultyDept !== studentBranch) {
      throw new SecurityError(
        'FORBIDDEN_DEPARTMENT_SCOPE',
        'Access Denied: Student record is outside your assigned departmental scope.',
        403
      )
    }
    return true
  }

  // 3. Admin Role: Institutional audit access
  if (role === 'admin') {
    return true
  }

  // Any other role is denied
  throw new SecurityError(
    'FORBIDDEN_ROLE',
    'Access Denied: Insufficient privileges for student records.',
    403
  )
}

/**
 * Route-level middleware to enforce allowed roles.
 * 
 * @param {Array<string>} allowedRoles 
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required.'
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        error: 'FORBIDDEN_ROLE',
        message: 'Access Denied: Your account role does not have permission to perform this action.'
      })
    }

    next()
  }
}

export default {
  SecurityError,
  assertStudentAccess,
  requireRole
}
