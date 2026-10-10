import React from 'react'
import {
  Gear,
  Cpu,
  CloudCheck,
  ShieldCheck,
  Database
} from '@phosphor-icons/react'
import Integrations from '../components/Integrations'

export default function SettingsView() {
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
