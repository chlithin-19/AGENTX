import React, { useState, useEffect } from 'react'
import {
  Gear,
  Cpu,
  CloudCheck,
  ShieldCheck,
  UserSwitch,
  Warning
} from '@phosphor-icons/react'
import Integrations from '../components/Integrations'

const DEV_PERSONAS = [
  { id: '1', name: 'Alex Kumar', role: 'Student', department: 'IT', desc: 'Undergraduate student (77.46% attendance, 2 backlogs)' },
  { id: '2', name: 'Priya Sharma', role: 'Student', department: 'CSE', desc: 'Undergraduate student (88.89% attendance, 1 backlog)' },
  { id: '3', name: 'Sneha Reddy', role: 'Student', department: 'EEE', desc: 'Undergraduate student (74.15% attendance, 0 backlogs)' },
  { id: '101', name: 'Dr. Ramesh Rao', role: 'Faculty', department: 'CSE', desc: 'Associate Professor (Authorized for CSE student records only)' },
  { id: '201', name: 'Prof. S. Swaminathan', role: 'Admin', department: 'Academic Section', desc: 'Dean of Academic Affairs (Institutional audit access)' }
]

export default function SettingsView() {
  const isDev = import.meta.env.DEV
  const [activePersonaId, setActivePersonaId] = useState(() => {
    return localStorage.getItem('atlas_dev_persona_id') || '1'
  })

  const handlePersonaChange = (id) => {
    setActivePersonaId(id)
    localStorage.setItem('atlas_dev_persona_id', id)
  }

  return (
    <div className="subview-container">
      {/* Subview Header */}
      <div className="subview-header">
        <div>
          <div className="subview-badge-row">
            <span className="atlas-badge">
              <Gear size={14} weight="bold" />
              <span>System Preferences</span>
            </span>
          </div>
          <h1 className="subview-title">Settings & Institutional Integrations</h1>
          <p className="subview-subtitle">
            Manage AI runtime execution models, institutional data boundaries, and OAuth workspace connectors.
          </p>
        </div>
      </div>

      {/* Quarantined Development Persona Simulator (Strictly omitted in production) */}
      {isDev && (
        <div className="scalloped-card settings-dev-persona-card" style={{ marginBottom: '24px' }}>
          <div className="arch-card-header">
            <div className="arch-title-group">
              <UserSwitch size={22} className="text-accent" />
              <h2 className="arch-title">Development Persona Simulator</h2>
            </div>
            <span className="atlas-status-pill" style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' }}>
              <span className="atlas-status-dot" style={{ background: '#ea580c' }} />
              <span className="atlas-status-label">Quarantined Test Mode</span>
            </span>
          </div>

          <div style={{
            background: 'rgba(234, 88, 12, 0.08)',
            border: '1px solid rgba(234, 88, 12, 0.25)',
            borderRadius: '10px',
            padding: '12px 16px',
            margin: '16px 0',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            fontSize: '13px',
            color: '#9a3412',
            lineHeight: '1.5'
          }}>
            <Warning size={20} weight="fill" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>DEVELOPMENT TEST SIMULATOR ONLY · NOT FOR PRODUCTION</strong><br />
              Simulated personas are strictly restricted to local development testing. Production environments unconditionally reject simulation headers and require verified institutional authentication tokens.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '16px' }}>
            {DEV_PERSONAS.map(p => {
              const isSelected = activePersonaId === p.id
              return (
                <div
                  key={p.id}
                  onClick={() => handlePersonaChange(p.id)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #0062FF' : '1px solid #E2E8F0',
                    background: isSelected ? 'rgba(0, 98, 255, 0.04)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#0F172A' }}>{p.name}</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: p.role === 'Student' ? 'rgba(0, 98, 255, 0.1)' : p.role === 'Faculty' ? 'rgba(13, 148, 136, 0.1)' : 'rgba(124, 58, 237, 0.1)',
                      color: p.role === 'Student' ? '#0062FF' : p.role === 'Faculty' ? '#0d9488' : '#7c3aed'
                    }}>
                      {p.role} · {p.department}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>{p.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Hybrid System Architecture Card */}
      <div className="scalloped-card settings-arch-card">
        <div className="arch-card-header">
          <div className="arch-title-group">
            <Cpu size={22} className="text-accent" />
            <h2 className="arch-title">Active AI Model Configuration</h2>
          </div>
          <span className="atlas-status-pill">
            <span className="atlas-status-dot" />
            <span className="atlas-status-label">Operational</span>
          </span>
        </div>

        <div className="arch-tiers-grid">
          <div className="arch-tier-item">
            <div className="tier-header">
              <Cpu size={18} />
              <span className="tier-name">Local Edge Tier</span>
            </div>
            <div className="tier-model">Google Gemma 4 E2B</div>
            <p className="tier-desc">
              On-premise edge reasoning for private student records, attendance auditing, and internal database queries. Zero institutional leakage.
            </p>
            <div className="tier-tags">
              <span className="tier-tag">128K Context</span>
              <span className="tier-tag">Local CPU / NPU</span>
              <span className="tier-tag">Offline Capable</span>
            </div>
          </div>

          <div className="arch-tier-item">
            <div className="tier-header">
              <CloudCheck size={18} />
              <span className="tier-name">Cloud Reasoning Tier</span>
            </div>
            <div className="tier-model">Google Gemini 3.8 Flash</div>
            <p className="tier-desc">
              High-throughput cloud intelligence orchestrated via the Google Gen AI SDK for deep multimodal analysis and long-form document synthesis.
            </p>
            <div className="tier-tags">
              <span className="tier-tag">Google Gen AI SDK</span>
              <span className="tier-tag">Fast Streaming SSE</span>
              <span className="tier-tag">Policy Sanctioned</span>
            </div>
          </div>
        </div>

        <div className="arch-privacy-banner">
          <ShieldCheck size={20} className="text-success" />
          <span>Institutional Data Governance: Sensitive student records are filtered and masked before cloud reasoning routing.</span>
        </div>
      </div>

      {/* Embedded Integrations Module */}
      <div className="scalloped-card settings-integrations-wrapper">
        <Integrations />
      </div>
    </div>
  )
}
