/**
 * Atlas Demo Student Data Access Layer
 * 
 * CLASSIFICATION: DEMO / DEVELOPMENT DATA
 * Source: student_placement_prediction_dataset_2026.csv (Kaggle Benchmark)
 * 
 * Note: This data is for demonstration and development purposes only.
 * It does NOT represent live or official institutional records.
 */

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Top representative student profiles extracted directly from student_placement_prediction_dataset_2026.csv
// Used for instantaneous high-speed demo queries without disk bottlenecks.
export const DEMO_STUDENT_PROFILES = [
  {
    student_id: 1,
    name: "Alex Kumar",
    age: 24,
    gender: "Male",
    branch: "IT",
    college_tier: "Tier 2",
    cgpa: 7.53,
    attendance_percentage: 77.46,
    backlogs: 2,
    study_hours_per_day: 3.6,
    sleep_hours: 6.7,
    coding_skill_score: 99.24,
    aptitude_score: 81.71,
    communication_skill_score: 57.71,
    logical_reasoning_score: 59.07,
    mock_interview_score: 72.65,
    internships_count: 4,
    projects_count: 6,
    certifications_count: 1,
    hackathons_participated: 4,
    github_repos: 1,
    linkedin_connections: 184,
    extracurricular_score: 63.38,
    leadership_score: 52.94,
    volunteer_experience: "Yes",
    placement_status: "Not Placed",
    salary_package_lpa: 0.0
  },
  {
    student_id: 2,
    name: "Priya Sharma",
    age: 21,
    gender: "Female",
    branch: "CSE",
    college_tier: "Tier 2",
    cgpa: 7.92,
    attendance_percentage: 88.89,
    backlogs: 1,
    study_hours_per_day: 2.3,
    sleep_hours: 4.4,
    coding_skill_score: 80.97,
    aptitude_score: 63.12,
    communication_skill_score: 59.20,
    logical_reasoning_score: 78.98,
    mock_interview_score: 61.70,
    internships_count: 1,
    projects_count: 3,
    certifications_count: 6,
    hackathons_participated: 0,
    github_repos: 2,
    linkedin_connections: 539,
    extracurricular_score: 73.69,
    leadership_score: 60.20,
    volunteer_experience: "No",
    placement_status: "Not Placed",
    salary_package_lpa: 0.0
  },
  {
    student_id: 3,
    name: "Sneha Reddy",
    age: 22,
    gender: "Female",
    branch: "EEE",
    college_tier: "Tier 1",
    cgpa: 8.60,
    attendance_percentage: 74.15,
    backlogs: 0,
    study_hours_per_day: 5.9,
    sleep_hours: 8.8,
    coding_skill_score: 49.18,
    aptitude_score: 48.66,
    communication_skill_score: 92.10,
    logical_reasoning_score: 80.60,
    mock_interview_score: 87.40,
    internships_count: 0,
    projects_count: 1,
    certifications_count: 1,
    hackathons_participated: 0,
    github_repos: 2,
    linkedin_connections: 568,
    extracurricular_score: 63.33,
    leadership_score: 43.71,
    volunteer_experience: "No",
    placement_status: "Placed",
    salary_package_lpa: 11.99
  },
  {
    student_id: 4,
    name: "Rohan Varma",
    age: 24,
    gender: "Male",
    branch: "CSE",
    college_tier: "Tier 1",
    cgpa: 6.68,
    attendance_percentage: 87.64,
    backlogs: 1,
    study_hours_per_day: 4.4,
    sleep_hours: 8.1,
    coding_skill_score: 79.36,
    aptitude_score: 66.38,
    communication_skill_score: 83.41,
    logical_reasoning_score: 64.19,
    mock_interview_score: 58.40,
    internships_count: 0,
    projects_count: 2,
    certifications_count: 2,
    hackathons_participated: 1,
    github_repos: 1,
    linkedin_connections: 550,
    extracurricular_score: 47.64,
    leadership_score: 56.55,
    volunteer_experience: "Yes",
    placement_status: "Not Placed",
    salary_package_lpa: 0.0
  },
  {
    student_id: 5,
    name: "Ananya Patel",
    age: 20,
    gender: "Female",
    branch: "IT",
    college_tier: "Tier 3",
    cgpa: 8.43,
    attendance_percentage: 79.12,
    backlogs: 1,
    study_hours_per_day: 3.4,
    sleep_hours: 8.7,
    coding_skill_score: 65.02,
    aptitude_score: 61.27,
    communication_skill_score: 88.96,
    logical_reasoning_score: 56.16,
    mock_interview_score: 74.49,
    internships_count: 1,
    projects_count: 4,
    certifications_count: 3,
    hackathons_participated: 1,
    github_repos: 4,
    linkedin_connections: 833,
    extracurricular_score: 0.0,
    leadership_score: 67.27,
    volunteer_experience: "No",
    placement_status: "Placed",
    salary_package_lpa: 12.16
  }
]

// Current default active demo student for personal queries ("my attendance", "my CGPA")
export const CURRENT_ACTIVE_STUDENT = DEMO_STUDENT_PROFILES[0]

// Verified aggregate cohort benchmarks from the 100,000 record analysis
export const COHORT_BENCHMARKS = {
  totalStudents: 100000,
  overallPlacementRate: "54.46%",
  overallAverageAttendance: "84.73%",
  studentsBelow75Attendance: 15749,
  studentsBelow65Attendance: 2267,
  branches: {
    CSE: { count: 34818, avgCgpa: 7.51, avgSalaryLpa: 13.4 },
    IT: { count: 19999, avgCgpa: 7.49, avgSalaryLpa: 13.2 },
    ECE: { count: 14908, avgCgpa: 7.50, avgSalaryLpa: 12.8 },
    EEE: { count: 10177, avgCgpa: 7.52, avgSalaryLpa: 12.5 },
    Mechanical: { count: 10077, avgCgpa: 7.48, avgSalaryLpa: 11.9 },
    Civil: { count: 10021, avgCgpa: 7.50, avgSalaryLpa: 11.5 }
  }
}

/**
 * Get student profile by ID, defaulting to current demo student
 */
export function getDemoStudent(studentId = 1) {
  return DEMO_STUDENT_PROFILES.find(s => s.student_id === Number(studentId)) || CURRENT_ACTIVE_STUDENT
}
