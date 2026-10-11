/**
 * Atlas Academic Agent
 * 
 * Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md (Section 4 & 5)
 * Dataset Reference: DATASET_ANALYSIS.md & ATLAS_DATA_ARCHITECTURE_PLAN.md
 * Security Reference: Plan 02-01 (Point-of-Access Isolation & Scoped RBAC)
 * 
 * Capabilities:
 * - Student academic profile, CGPA, and department standing
 * - Overall attendance percentage and shortfall detection (< 75%, < 65%)
 * - Active backlog count and risk evaluation
 * - Skill assessment scores (coding, aptitude, communication, logical, mock interview)
 * - Placement status and compensation verification
 * - Career profile strength analysis
 */

import { getDemoStudent, DEMO_STUDENT_PROFILES, COHORT_BENCHMARKS } from '../data/demoStudents.js'
import { assertStudentAccess } from '../security/index.js'

export class AcademicAgent {
  constructor() {
    this.name = 'academic'
    this.description = 'Manages student academic profiles, CGPA, attendance, backlogs, skill evaluations, and placement readiness.'
  }

  /**
   * Determine if the query is an academic inquiry.
   */
  canHandle(query) {
    const q = String(query).toLowerCase()
    return /\b(academic|attendance|cgpa|gpa|grades?|marks?|backlogs?|skills?|coding score|aptitude|placement status|placement package|salary|internships?|projects?|study hours)\b/i.test(q)
  }

  /**
   * Execute academic task with point-of-access authorization enforcement.
   */
  async execute(task, context = {}) {
    const query = String(task.input?.query || context.message || '').toLowerCase()
    const callingUser = context.user || { id: 1, studentId: 1, role: 'student', branch: 'IT', name: 'Alex Kumar' }

    // Resolve target student:
    // 1. Explicit task.input.targetStudentId
    // 2. Named student explicitly mentioned in query
    // 3. Defaults to callingUser's own record
    let student = null
    if (task.input?.targetStudentId) {
      student = DEMO_STUDENT_PROFILES.find(s => s.student_id === Number(task.input.targetStudentId))
    }
    if (!student) {
      for (const p of DEMO_STUDENT_PROFILES) {
        if (query.includes(p.name.toLowerCase())) {
          student = p
          break
        }
      }
    }
    if (!student) {
      student = getDemoStudent(callingUser.studentId || callingUser.id || 1)
    }

    // POINT-OF-ACCESS AUTHORIZATION CHECK
    try {
      assertStudentAccess(callingUser, student)
    } catch (err) {
      return {
        agent: this.name,
        action: 'access_denied',
        status: 'forbidden',
        error: err.code || 'FORBIDDEN',
        summary: `⚠️ ${err.message}`,
        citations: []
      }
    }

    const isSelfQuery = String(student.student_id) === String(callingUser.studentId || callingUser.id)
    const subjectPrefix = isSelfQuery ? 'Your' : `${student.name}'s`
    const pronounSubject = isSelfQuery ? 'You' : student.name

    // Sub-intent 1: Attendance inquiry
    if (/\b(attendance|present|absent|classes?)\b/i.test(query)) {
      const att = student.attendance_percentage
      const statusNote = att < 65 
        ? '⚠️ Critical: Attendance is below 65%. Significant risk of semester detention.'
        : att < 75 
        ? '⚠️ Warning: Attendance is below the standard 75% threshold. Attendance condonation may be required.'
        : '✅ Good Standing: Attendance satisfies institutional guidelines (> 75%).'

      return {
        agent: this.name,
        action: 'get_attendance',
        status: 'completed',
        data: {
          studentId: student.student_id,
          name: student.name,
          branch: student.branch,
          attendancePercentage: att,
          statusNote,
          cohortAverage: COHORT_BENCHMARKS.overallAverageAttendance
        },
        summary: `${subjectPrefix} recorded attendance is **${att}%** (${student.branch} Department). ${statusNote}`,
        citations: []
      }
    }

    // Sub-intent 2: Backlogs inquiry
    if (/\b(backlog|arrears?|failed subjects?)\b/i.test(query)) {
      return {
        agent: this.name,
        action: 'get_backlogs',
        status: 'completed',
        data: {
          studentId: student.student_id,
          name: student.name,
          backlogs: student.backlogs,
          cleared: student.backlogs === 0
        },
        summary: student.backlogs === 0
          ? `${pronounSubject} ${isSelfQuery ? 'have' : 'has'} **0 active backlogs**. Academic record is completely clear.`
          : `${pronounSubject} currently ${isSelfQuery ? 'have' : 'has'} **${student.backlogs} active backlog(s)** on record. Focus on clearing these to ensure placement eligibility.`,
        citations: []
      }
    }

    // Sub-intent 3: CGPA inquiry
    if (/\b(cgpa|gpa|grade point|marks?)\b/i.test(query) && !/\b(placement|profile|package)\b/i.test(query)) {
      return {
        agent: this.name,
        action: 'get_cgpa',
        status: 'completed',
        data: {
          studentId: student.student_id,
          name: student.name,
          cgpa: student.cgpa,
          branchAvgCgpa: COHORT_BENCHMARKS.branches[student.branch]?.avgCgpa || 7.50
        },
        summary: `${subjectPrefix} cumulative GPA (CGPA) is **${student.cgpa} / 10.0** (Department average for ${student.branch}: ${COHORT_BENCHMARKS.branches[student.branch]?.avgCgpa || 7.50}).`,
        citations: []
      }
    }

    // Sub-intent 4: Skill assessment profile
    if (/\b(skills?|coding score|aptitude|mock interview|communication score)\b/i.test(query)) {
      return {
        agent: this.name,
        action: 'get_skill_profile',
        status: 'completed',
        data: {
          studentId: student.student_id,
          name: student.name,
          codingScore: student.coding_skill_score,
          aptitudeScore: student.aptitude_score,
          communicationScore: student.communication_skill_score,
          logicalReasoningScore: student.logical_reasoning_score,
          mockInterviewScore: student.mock_interview_score
        },
        summary: `### Skill Assessment Profile for ${student.name}:\n` +
          `- **Coding Skill Score:** ${student.coding_skill_score} / 100\n` +
          `- **Aptitude Score:** ${student.aptitude_score} / 100\n` +
          `- **Communication Score:** ${student.communication_skill_score} / 100\n` +
          `- **Logical Reasoning:** ${student.logical_reasoning_score} / 100\n` +
          `- **Mock Interview Performance:** ${student.mock_interview_score} / 100`,
        citations: []
      }
    }

    // Sub-intent 5: Placement status / package
    if (/\b(placement status|placed|package|salary|offer)\b/i.test(query)) {
      const isPlaced = student.placement_status === 'Placed'
      return {
        agent: this.name,
        action: 'get_placement_status',
        status: 'completed',
        data: {
          studentId: student.student_id,
          name: student.name,
          placementStatus: student.placement_status,
          salaryPackageLpa: isPlaced ? `${student.salary_package_lpa} LPA` : 'N/A'
        },
        summary: isPlaced
          ? `${subjectPrefix} placement status is **Placed** with a verified compensation package of **₹${student.salary_package_lpa} LPA**.`
          : `${subjectPrefix} placement status is currently **Not Placed**. Historical data shows students in ${student.branch} have a ${COHORT_BENCHMARKS.overallPlacementRate} placement rate.`,
        citations: []
      }
    }

    // Default: Comprehensive academic profile summary
    return {
      agent: this.name,
      action: 'get_academic_profile',
      status: 'completed',
      data: {
        studentId: student.student_id,
        name: student.name,
        branch: student.branch,
        collegeTier: student.college_tier,
        cgpa: student.cgpa,
        attendancePercentage: student.attendance_percentage,
        backlogs: student.backlogs,
        codingScore: student.coding_skill_score,
        aptitudeScore: student.aptitude_score,
        placementStatus: student.placement_status,
        salaryPackageLpa: student.salary_package_lpa
      },
      summary: `### Academic Profile: ${student.name} (${student.branch} Department)\n` +
        `- **CGPA:** ${student.cgpa} / 10.0\n` +
        `- **Attendance:** ${student.attendance_percentage}% (Required: > 75%)\n` +
        `- **Active Backlogs:** ${student.backlogs}\n` +
        `- **Placement Readiness Score:** ${student.coding_skill_score}/100 (Coding), ${student.aptitude_score}/100 (Aptitude)\n` +
        `- **Placement Status:** ${student.placement_status}${student.salary_package_lpa > 0 ? ` (₹${student.salary_package_lpa} LPA)` : ''}`,
      citations: []
    }
  }
}

export default new AcademicAgent()
