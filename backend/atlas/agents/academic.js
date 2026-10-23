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
import { getCampusRepositories } from '../campus/repositories/index.js'

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
    // Exclude explicit calendar scheduling actions even if they mention projects or academic meetings
    if (/\b(add|create|schedule|put|set\s?up|book)\b/i.test(q) && /\b(calendar|meeting|appointment|reminder)\b/i.test(q)) {
      return false
    }
    // Exclude explicit email sending/drafting actions
    if (/\b(send|draft|compose)\b/i.test(q) && /\b(email|mail)\b/i.test(q)) {
      return false
    }
    return /\b(academic|attendance|cgpa|gpa|grades?|marks?|backlogs?|skills?|coding score|aptitude|placement|placements?|package|salary|benchmarks?|internships?|projects?|study hours)\b/i.test(q)
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
    let targetStudentId = task.input?.targetStudentId ? Number(task.input.targetStudentId) : null

    if (!targetStudentId) {
      for (const p of DEMO_STUDENT_PROFILES) {
        if (query.includes(p.name.toLowerCase())) {
          targetStudentId = p.student_id
          break
        }
      }
    }

    // Try reading from authorized SQLite repository first
    try {
      const { studentRepo, academicRepo, placementRepo } = getCampusRepositories()
      const resolvedId = targetStudentId || callingUser.studentId || callingUser.id || 1
      const st = studentRepo.getStudentById(resolvedId, callingUser)
      const ac = academicRepo.getAcademicRecord(resolvedId, callingUser)
      const pl = placementRepo.getPlacementProfile(resolvedId, callingUser)

      if (st && ac) {
        student = {
          ...st,
          ...ac,
          ...(pl || {})
        }
      }
    } catch (repoErr) {
      if (repoErr.code?.startsWith('FORBIDDEN') || repoErr.status === 403) {
        const msg = repoErr.message.startsWith('Access Denied') ? repoErr.message : `Access Denied: ${repoErr.message}`
        return {
          agent: this.name,
          action: 'access_denied',
          status: 'forbidden',
          error: repoErr.code || 'FORBIDDEN',
          summary: `⚠️ ${msg}`,
          citations: []
        }
      }
      // If DB is uninitialized or student not in DB, fallback to demo dataset
    }

    if (!student && targetStudentId) {
      student = DEMO_STUDENT_PROFILES.find(s => s.student_id === targetStudentId)
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
      const msg = err.message.startsWith('Access Denied') ? err.message : `Access Denied: ${err.message}`
      return {
        agent: this.name,
        action: 'access_denied',
        status: 'forbidden',
        error: err.code || 'FORBIDDEN',
        summary: `⚠️ ${msg}`,
        citations: []
      }
    }

    const isSelfQuery = String(student.student_id) === String(callingUser.studentId || callingUser.id)
    const subjectPrefix = isSelfQuery ? 'Your' : `${student.name}'s`
    const pronounSubject = isSelfQuery ? 'You' : student.name

    // Fetch dynamic cohort statistics directly from SQLite repository benchmarks
    let cohortBenchmark = null
    try {
      const { placementRepo } = getCampusRepositories()
      cohortBenchmark = placementRepo.getCohortBenchmark(student.branch)
    } catch {
      // fallback to static cohort benchmarks if database uninitialized
    }
    const branchAvgCgpa = cohortBenchmark?.average_cgpa ?? (COHORT_BENCHMARKS.branches[student.branch]?.avgCgpa || 7.50)
    const branchAvgAttendance = cohortBenchmark?.average_attendance ?? (COHORT_BENCHMARKS.overallAverageAttendance || 84.8)
    const branchPlacementRate = cohortBenchmark ? `${cohortBenchmark.placement_rate}%` : (COHORT_BENCHMARKS.overallPlacementRate || '54%')
    const benchmarkDisclaimer = '\n\n*Benchmark Notice: Department benchmarks are statistical cohort references derived from 10,000 historical student records and do not constitute an authoritative institutional guarantee.*'

    // Sub-intent 1: Attendance inquiry
    if (/\b(attendance|present|absent|classes?)\b/i.test(query)) {
      const rawAtt = student.attendance_percentage
      const att = Number(Number(rawAtt).toFixed(2))
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
          cohortAverage: branchAvgAttendance
        },
        summary: `${subjectPrefix} recorded attendance is **${att}%** (${student.branch} Department; cohort benchmark average: ${branchAvgAttendance}%). ${statusNote}`,
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
          branchAvgCgpa
        },
        summary: `${subjectPrefix} cumulative GPA (CGPA) is **${student.cgpa} / 10.0** (Department average for ${student.branch}: ${branchAvgCgpa}).`,
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
    if (/\b(placement|placements?|package|salary|offer|benchmarks?)\b/i.test(query)) {
      const isPlaced = student.placement_status === 'Placed'
      return {
        agent: this.name,
        action: 'get_placement_status',
        status: 'completed',
        data: {
          studentId: student.student_id,
          name: student.name,
          placementStatus: student.placement_status,
          salaryPackageLpa: isPlaced ? `${student.salary_package_lpa} LPA` : 'N/A',
          cohortPlacementRate: branchPlacementRate
        },
        summary: isPlaced
          ? `${subjectPrefix} placement record indicates **Placed** with an indicative package of **₹${student.salary_package_lpa} LPA** (Historical Benchmark Record).${benchmarkDisclaimer}`
          : `${subjectPrefix} placement record is currently **Not Placed**. Historical placement benchmark for ${student.branch} indicates a **${branchPlacementRate}** placement rate (${cohortBenchmark?.total_students || 1000} student cohort).${benchmarkDisclaimer}`,
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
        salaryPackageLpa: student.salary_package_lpa,
        branchAvgCgpa,
        branchPlacementRate
      },
      summary: `### Academic Profile: ${student.name} (${student.branch} Department)\n` +
        `- **CGPA:** ${student.cgpa} / 10.0 (Dept Avg: ${branchAvgCgpa})\n` +
        `- **Attendance:** ${student.attendance_percentage}% (Required: > 75% · Dept Avg: ${branchAvgAttendance}%)\n` +
        `- **Active Backlogs:** ${student.backlogs}\n` +
        `- **Placement Readiness Score:** ${student.coding_skill_score}/100 (Coding), ${student.aptitude_score}/100 (Aptitude)\n` +
        `- **Placement Status:** ${student.placement_status}${student.salary_package_lpa > 0 ? ` (₹${student.salary_package_lpa} LPA - Benchmark Record)` : ''}${benchmarkDisclaimer}`,
      citations: []
    }
  }
}

export default new AcademicAgent()
