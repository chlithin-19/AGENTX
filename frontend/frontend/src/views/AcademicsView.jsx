import React, { useState } from 'react'
import {
  GraduationCap,
  ChartLineUp,
  CheckCircle,
  WarningCircle,
  ArrowRight,
  Code,
  Brain,
  Briefcase,
  UserCheck
} from '@phosphor-icons/react'

export default function AcademicsView({ onNavigate }) {
  const [selectedStudent, setSelectedStudent] = useState('Alex Kumar')

  const students = [
    {
      id: 1,
      name: 'Alex Kumar',
      branch: 'Information Technology · Sem 7',
      cgpa: 8.92,
      attendance: 88.0,
      backlogs: 0,
      placementReadiness: 'High (89%)',
      coding: 92,
      aptitude: 84,
      technical: 86,
      projects: 6,
      internships: 4
    },
    {
      id: 2,
      name: 'Priya Sharma',
      branch: 'Computer Science & Engineering · Sem 7',
      cgpa: 7.92,
      attendance: 88.9,
      backlogs: 0,
      placementReadiness: 'High (85%)',
      coding: 81,
      aptitude: 64,
      technical: 78,
      projects: 5,
      internships: 3
    }
  ]

  const current = students.find((s) => s.name === selectedStudent) || students[0]

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
            <span className="demo-badge-pill">DEMO DATA · KAGGLE BENCHMARKS</span>
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

      {/* Main Profile KPI Grid */}
      <div className="metric-card-grid">
        {/* CGPA Card */}
        <div className="scalloped-card metric-card">
          <div className="metric-card-header">
            <span className="metric-card-label">Cumulative CGPA</span>
            <ChartLineUp size={20} className="text-accent" />
          </div>
          <div className="metric-value-display">
            <span className="metric-number">{current.cgpa}</span>
            <span className="metric-scale">/ 10.0</span>
          </div>
          <p className="metric-note text-success">
            <CheckCircle size={14} weight="fill" />
            <span>Eligible for Tier-1 placements (&gt; 7.50 requirement)</span>
          </p>
        </div>

        {/* Attendance Card */}
        <div className="scalloped-card metric-card">
          <div className="metric-card-header">
            <span className="metric-card-label">Attendance Standing</span>
            <CheckCircle size={20} className="text-success" />
          </div>
          <div className="metric-value-display">
            <span className="metric-number">{current.attendance}%</span>
            <span className="metric-status-safe">Safe</span>
          </div>
          <p className="metric-note">
            <span>+13.0% buffer above the 75.0% institutional shortfall threshold.</span>
          </p>
        </div>

        {/* Placement Readiness */}
        <div className="scalloped-card metric-card">
          <div className="metric-card-header">
            <span className="metric-card-label">Placement Readiness</span>
            <Briefcase size={20} className="text-accent" />
          </div>
          <div className="metric-value-display">
            <span className="metric-number">{current.placementReadiness}</span>
          </div>
          <p className="metric-note">
            <span>Based on {current.projects} projects and {current.internships} verified internships.</span>
          </p>
        </div>
      </div>

      {/* Skill Progression & Benchmarking */}
      <div className="scalloped-card skills-panel">
        <h2 className="panel-title">Benchmark Skill Evaluation</h2>
        <p className="panel-desc">Grounded in Kaggle 2026 placement cohort distributions for {current.branch}.</p>

        <div className="skills-grid">
          <div className="skill-item">
            <div className="skill-info">
              <span className="skill-label">
                <Code size={16} /> Coding Skill Score
              </span>
              <span className="skill-score">{current.coding} / 100</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill cobalt" style={{ width: `${current.coding}%` }} />
            </div>
          </div>

          <div className="skill-item">
            <div className="skill-info">
              <span className="skill-label">
                <Brain size={16} /> Quantitative & Aptitude
              </span>
              <span className="skill-score">{current.aptitude} / 100</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill teal" style={{ width: `${current.aptitude}%` }} />
            </div>
          </div>

          <div className="skill-item">
            <div className="skill-info">
              <span className="skill-label">
                <GraduationCap size={16} /> Technical Core
              </span>
              <span className="skill-score">{current.technical} / 100</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill violet" style={{ width: `${current.technical}%` }} />
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
