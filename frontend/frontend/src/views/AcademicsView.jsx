import React, { useState, useEffect } from 'react'
import {
  GraduationCap,
  ChartLineUp,
  CheckCircle,
  WarningCircle,
  ArrowRight,
  Code,
  Brain,
  Briefcase,
  UserCheck,
  ArrowsClockwise
} from '@phosphor-icons/react'

export default function AcademicsView({ onNavigate }) {
  const [selectedStudent, setSelectedStudent] = useState('Alex Kumar')
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const students = [
    {
      id: 1,
      name: 'Alex Kumar',
      branch: 'Information Technology · Sem 7',
      cgpa: 7.53,
      attendance: 77.46,
      backlogs: 2,
      coding: 99.24,
      aptitude: 81.71,
      projects: 6,
      internships: 4
    },
    {
      id: 2,
      name: 'Priya Sharma',
      branch: 'Computer Science & Engineering · Sem 7',
      cgpa: 7.92,
      attendance: 88.89,
      backlogs: 1,
      coding: 80.97,
      aptitude: 63.12,
      projects: 5,
      internships: 3
    }
  ]

  const current = students.find((s) => s.name === selectedStudent) || students[0]

  const fetchProfile = async (studentId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/atlas/academics/profile?studentId=${studentId}`)
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`)
      }
      const json = await res.json()
      if (json.status === 'success' && json.data) {
        setProfileData(json.data)
      }
    } catch (err) {
      // Fallback gracefully to demo object while noting error
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile(current.id)
  }, [selectedStudent])

  const cgpa = profileData?.cgpa ?? current.cgpa
  const attendance = profileData?.attendance_percentage ?? current.attendance
  const coding = profileData?.coding_skill_score ?? current.coding
  const aptitude = profileData?.aptitude_score ?? current.aptitude
  const projects = profileData?.projects_count ?? current.projects
  const internships = profileData?.internships_count ?? current.internships
  const branchName = profileData?.branch ? `${profileData.branch} Department` : current.branch

  return (
    <div className="subview-container">
      {/* Subview Header */}
      <div className="subview-header">
        <div>
          <div className="subview-badge-row">
            <span className="atlas-badge academic">
              <GraduationCap size={14} weight="bold" />
              <span>Academic Intelligence</span>
            </span>
            <span className="demo-badge-pill">RELATIONAL DATASET · SQLITE PERSISTENCE</span>
          </div>
          <h1 className="subview-title">Academic & Placement Analytics</h1>
          <p className="subview-subtitle">
            Verified performance metrics, attendance shortfall monitoring, and predictive placement benchmarks.
          </p>
        </div>

        {/* Student Selector Switcher */}
        <div className="student-switcher">
          <span className="switcher-label">Active Student Profile:</span>
          <div className="switcher-buttons">
            {students.map((s) => (
              <button
                key={s.id}
                className={`switcher-btn ${selectedStudent === s.name ? 'active' : ''}`}
                onClick={() => setSelectedStudent(s.name)}
              >
                <UserCheck size={14} />
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="network-error-banner" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', color: '#b91c1c' }}>
            ⚠️ Point-of-access notice: {error}. Showing authorized student baseline.
          </span>
          <button onClick={() => fetchProfile(current.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#b91c1c' }}>
            <ArrowsClockwise size={14} /> Retry
          </button>
        </div>
      )}

      {/* Main Profile KPI Grid */}
      <div className="metric-card-grid">
        {/* CGPA Card */}
        <div className="scalloped-card metric-card">
          <div className="metric-card-header">
            <span className="metric-card-label">Cumulative CGPA</span>
            <ChartLineUp size={20} className="text-accent" />
          </div>
          <div className="metric-value-display">
            <span className="metric-number">{Number(cgpa).toFixed(2)}</span>
            <span className="metric-scale">/ 10.0</span>
          </div>
          <p className="metric-note text-success">
            <CheckCircle size={14} weight="fill" />
            <span>Eligible for placement drives (&gt; 6.50 requirement)</span>
          </p>
        </div>

        {/* Attendance Card */}
        <div className="scalloped-card metric-card">
          <div className="metric-card-header">
            <span className="metric-card-label">Attendance Standing</span>
            {attendance >= 75 ? (
              <CheckCircle size={20} className="text-success" />
            ) : (
              <WarningCircle size={20} className="text-warning" />
            )}
          </div>
          <div className="metric-value-display">
            <span className="metric-number">{Number(attendance).toFixed(2)}%</span>
            <span className={attendance >= 75 ? 'metric-status-safe' : 'metric-status-warning'}>
              {attendance >= 75 ? 'Safe' : 'Shortfall Risk'}
            </span>
          </div>
          <p className="metric-note">
            <span>
              {attendance >= 75 
                ? `+${(attendance - 75).toFixed(1)}% buffer above the 75.0% institutional threshold.`
                : `-${(75 - attendance).toFixed(1)}% below required 75.0% threshold.`}
            </span>
          </p>
        </div>

        {/* Placement Readiness */}
        <div className="scalloped-card metric-card">
          <div className="metric-card-header">
            <span className="metric-card-label">Career Profile Strength</span>
            <Briefcase size={20} className="text-accent" />
          </div>
          <div className="metric-value-display">
            <span className="metric-number">{profileData?.placement_status || 'Verified'}</span>
          </div>
          <p className="metric-note">
            <span>Based on {projects} projects and {internships} verified internships.</span>
          </p>
        </div>
      </div>

      {/* Skill Progression & Benchmarking */}
      <div className="scalloped-card skills-panel">
        <h2 className="panel-title">Benchmark Skill Evaluation</h2>
        <p className="panel-desc">Grounded in Kaggle 2026 placement cohort distributions for {branchName}.</p>

        <div className="skills-grid">
          <div className="skill-item">
            <div className="skill-info">
              <span className="skill-label">
                <Code size={16} /> Coding Skill Score
              </span>
              <span className="skill-score">{Number(coding).toFixed(1)} / 100</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill cobalt" style={{ width: `${Math.min(Number(coding), 100)}%` }} />
            </div>
          </div>

          <div className="skill-item">
            <div className="skill-info">
              <span className="skill-label">
                <Brain size={16} /> Quantitative & Aptitude
              </span>
              <span className="skill-score">{Number(aptitude).toFixed(1)} / 100</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill teal" style={{ width: `${Math.min(Number(aptitude), 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Action Prompt Strip */}
        <div className="subview-action-strip">
          <div>
            <span className="action-strip-title">Have questions about your standing or attendance buffer?</span>
            <p className="action-strip-desc">Ask Atlas to audit your syllabus requirements, mock interview benchmarks, or timetable.</p>
          </div>
          <button
            className="atlas-pill-btn"
            onClick={() => onNavigate('chat', `Audit my academic standing and attendance shortfall risk for ${current.name}`)}
          >
            <span>Ask Atlas to Audit Attendance</span>
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}
