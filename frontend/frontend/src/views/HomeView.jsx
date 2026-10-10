import React from 'react'
import {
  GraduationCap,
  Buildings,
  CalendarBlank,
  MegaphoneSimple,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  Lightning
} from '@phosphor-icons/react'

export default function HomeView({ onNavigate }) {
  return (
    <div className="home-view-wrapper">
      {/* ====================================================================
          SECTION 1: HERO & AGENT CONSTELLATION
          ==================================================================== */}
      <section className="home-hero-section">
        {/* Giant Watermark Typography */}
        <div className="atlas-watermark" aria-hidden="true">ATLAS</div>

        <div className="home-hero-header">
          <div className="atlas-badge" style={{ marginBottom: '16px' }}>
            <span className="atlas-badge-node" />
            <span>CAMPUS INTELLIGENCE LAYER</span>
          </div>

          <h1 className="home-hero-headline">
            <span className="home-hero-brand">ATLAS</span>
            <span className="home-hero-subhead">YOUR CAMPUS. ONE INTELLIGENT SYSTEM.</span>
          </h1>

          <p className="home-hero-narrative">
            Privacy-first hybrid AI coordinating academic analytics, physical infrastructure,
            campus events, and administrative circulars with zero hallucinations.
          </p>

          <div className="home-hero-ctas">
            <button
              className="atlas-pill-btn"
              onClick={() => onNavigate('chat')}
              aria-label="Ask Atlas Anything"
            >
              <span>Ask Atlas Anything</span>
              <ArrowRight size={16} weight="bold" />
            </button>
            <a href="#architecture" className="atlas-pill-btn secondary">
              <span>Explore Architecture</span>
              <span>↓</span>
            </a>
          </div>
        </div>

        {/* Interactive Constellation Visualizer */}
        <div className="home-constellation-container">
          <svg className="constellation-svg" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0062FF" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="lineGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0D9488" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0062FF" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="lineGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0062FF" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="lineGrad4" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#EA580C" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0062FF" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Bezier connector lines */}
            <path d="M 230 110 Q 360 180 500 250" stroke="url(#lineGrad1)" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            <path d="M 770 110 Q 640 180 500 250" stroke="url(#lineGrad2)" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            <path d="M 230 390 Q 360 320 500 250" stroke="url(#lineGrad3)" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            <path d="M 770 390 Q 640 320 500 250" stroke="url(#lineGrad4)" strokeWidth="2" strokeDasharray="4 4" fill="none" />

            {/* Connector anchor nodes */}
            <circle cx="230" cy="110" r="4" fill="#2563EB" />
            <circle cx="770" cy="110" r="4" fill="#0D9488" />
            <circle cx="230" cy="390" r="4" fill="#7C3AED" />
            <circle cx="770" cy="390" r="4" fill="#EA580C" />
            <circle cx="500" cy="250" r="6" fill="#0062FF" />
          </svg>

          {/* Central Atlas Core Hologram */}
          <div className="constellation-center-core">
            <div className="core-orbital-ring ring-outer" />
            <div className="core-orbital-ring ring-inner" />
            <div className="core-center-sphere">
              <span className="core-symbol">✦</span>
              <span className="core-title">ATLAS CORE</span>
              <span className="core-sub">Hybrid Edge Router</span>
            </div>
          </div>

          {/* Satellite Agent Cards (4 Agents with Live Demo Data) */}
          <div className="constellation-grid">
            {/* Top-Left: Academic Agent */}
            <div
              className="satellite-card card-academic scalloped-card"
              onClick={() => onNavigate('academics')}
              role="button"
              tabIndex={0}
            >
              <div className="satellite-header">
                <span className="atlas-badge academic">
                  <GraduationCap size={14} weight="bold" />
                  <span>Academic Agent</span>
                </span>
                <span className="satellite-status-pill">Active</span>
              </div>
              <div className="satellite-body">
                <div className="satellite-user">Alex Kumar · CS-2022</div>
                <div className="satellite-metric-row">
                  <div className="satellite-metric">
                    <span className="metric-label">CGPA</span>
                    <span className="metric-val">8.92</span>
                  </div>
                  <div className="satellite-metric">
                    <span className="metric-label">Attendance</span>
                    <span className="metric-val text-success">88% ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top-Right: Campus Facilities Agent */}
            <div
              className="satellite-card card-campus scalloped-card"
              onClick={() => onNavigate('campus')}
              role="button"
              tabIndex={0}
            >
              <div className="satellite-header">
                <span className="atlas-badge campus">
                  <Buildings size={14} weight="bold" />
                  <span>Campus Agent</span>
                </span>
                <span className="satellite-status-pill">Active</span>
              </div>
              <div className="satellite-body">
                <div className="satellite-user">Lab 204 & Library</div>
                <div className="satellite-metric-row">
                  <div className="satellite-metric">
                    <span className="metric-label">Lab 204</span>
                    <span className="metric-val text-success">Open</span>
                  </div>
                  <div className="satellite-metric">
                    <span className="metric-label">Desks Free</span>
                    <span className="metric-val">14 / 40</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-Left: Campus Events Agent */}
            <div
              className="satellite-card card-events scalloped-card"
              onClick={() => onNavigate('events')}
              role="button"
              tabIndex={0}
            >
              <div className="satellite-header">
                <span className="atlas-badge events">
                  <CalendarBlank size={14} weight="bold" />
                  <span>Event Agent</span>
                </span>
                <span className="satellite-status-pill">Active</span>
              </div>
              <div className="satellite-body">
                <div className="satellite-user">Atlas 36h Hackathon</div>
                <div className="satellite-metric-row">
                  <div className="satellite-metric">
                    <span className="metric-label">Date</span>
                    <span className="metric-val">Oct 24-25</span>
                  </div>
                  <div className="satellite-metric">
                    <span className="metric-label">Status</span>
                    <span className="metric-val text-accent">Open</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-Right: Communication Agent */}
            <div
              className="satellite-card card-communication scalloped-card"
              onClick={() => onNavigate('communication')}
              role="button"
              tabIndex={0}
            >
              <div className="satellite-header">
                <span className="atlas-badge communication">
                  <MegaphoneSimple size={14} weight="bold" />
                  <span>Comm Agent</span>
                </span>
                <span className="satellite-status-pill">Active</span>
              </div>
              <div className="satellite-body">
                <div className="satellite-user">Circular #104 · Midterms</div>
                <div className="satellite-metric-row">
                  <div className="satellite-metric">
                    <span className="metric-label">Issuer</span>
                    <span className="metric-val">Dean Academics</span>
                  </div>
                  <div className="satellite-metric">
                    <span className="metric-label">Trust</span>
                    <span className="metric-val text-success">Verified ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: NOTCHED ARCHITECTURAL TRANSITION & CAPABILITY TRIO
          ==================================================================== */}
      <section id="architecture" className="home-notched-container">
        {/* Sculptural Notched Badge Cradle */}
        <div className="notched-badge-cradle">
          <span className="atlas-badge">
            <span className="atlas-badge-node" />
            <span>4 SPECIALIZED AGENTS · ZERO HALLUCINATIONS</span>
          </span>
        </div>

        <div className="notched-content-inner">
          <div className="notched-header">
            <h2 className="notched-title">
              Engineered for High-Trust Institutional Decisions
            </h2>
            <p className="notched-subtitle">
              Every request is dynamically evaluated by the central orchestrator, routed to domain-specific
              agents, and verified against deterministic campus records before response delivery.
            </p>
          </div>

          <div className="capability-grid">
            <div className="capability-card scalloped-card">
              <div className="capability-icon-wrap academic">
                <GraduationCap size={28} weight="duotone" />
              </div>
              <h3 className="capability-card-title">Academic Analytics & Placement</h3>
              <p className="capability-card-desc">
                Real-time tracking of semester CGPA thresholds, attendance warning levels, and predicted
                placement readiness percentiles using verified benchmark records.
              </p>
              <div className="capability-card-footer">
                <button
                  className="capability-link"
                  onClick={() => onNavigate('academics')}
                >
                  <span>Explore Academic View</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="capability-card scalloped-card">
              <div className="capability-icon-wrap campus">
                <Buildings size={28} weight="duotone" />
              </div>
              <h3 className="capability-card-title">Campus Physical Infrastructure</h3>
              <p className="capability-card-desc">
                Live monitoring of Lab 204 workstation availability, library study slots,
                infrastructure issues, and automated maintenance ticketing.
              </p>
              <div className="capability-card-footer">
                <button
                  className="capability-link"
                  onClick={() => onNavigate('campus')}
                >
                  <span>Explore Campus View</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="capability-card scalloped-card">
              <div className="capability-icon-wrap communication">
                <ShieldCheck size={28} weight="duotone" />
              </div>
              <h3 className="capability-card-title">Verified Knowledge & Circulars</h3>
              <p className="capability-card-desc">
                Grounded RAG citations directly cross-referencing published institutional circulars,
                official academic bylaws, and fee schedules with cryptographic provenance.
              </p>
              <div className="capability-card-footer">
                <button
                  className="capability-link"
                  onClick={() => onNavigate('communication')}
                >
                  <span>Explore Circulars View</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3: DEEP MIDNIGHT NAVY CONTRAST MODULE
          ==================================================================== */}
      <section className="navy-metric-module scalloped-card-dark">
        <div className="navy-metric-inner">
          <div className="navy-header">
            <span className="atlas-badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC', borderColor: 'rgba(255,255,255,0.2)' }}>
              INSTITUTIONAL METRICS
            </span>
            <h2 className="navy-title">
              POWERING CAMPUS OPERATIONS WITH COMPLETE PRIVACY
            </h2>
            <p className="navy-subtitle">
              Atlas runs local on-premise models for private records, selectively querying verified cloud reasoning
              only when sanctioned by institutional policy.
            </p>
          </div>

          <div className="metric-stat-grid">
            <div className="metric-stat-item">
              <div className="stat-number">5</div>
              <div className="stat-label">Authoritative Demo Profiles Loaded</div>
            </div>

            <div className="metric-stat-item">
              <div className="stat-number">4</div>
              <div className="stat-label">Coordinated Specialized Agents</div>
            </div>

            <div className="metric-stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Grounded RAG Citation Provenance</div>
            </div>

            <div className="metric-stat-item">
              <div className="stat-number">&lt; 150ms</div>
              <div className="stat-label">Edge Intent Classification Latency</div>
            </div>
          </div>

          <div className="navy-cta-row">
            <button
              className="atlas-pill-btn"
              onClick={() => onNavigate('chat')}
              style={{ padding: '12px 28px', fontSize: '15px' }}
            >
              <span>Launch Campus Assistant</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          INSTITUTIONAL FOOTER
          ==================================================================== */}
      <footer className="home-footer" role="contentinfo">
        <div className="home-footer-inner">
          <div className="footer-brand">
            <span className="footer-monogram">✦ ATLAS</span>
            <p className="footer-desc">
              Campus Multi-Agent Intelligence System · Privacy-First Hybrid Architecture
            </p>
          </div>
          <div className="footer-meta">
            <div className="atlas-status-pill">
              <span className="atlas-status-dot" />
              <span className="atlas-status-label">Hybrid Edge-Cloud Active</span>
            </div>
            <p className="footer-copy">© 2026 Atlas Intelligence System. All institutional data protected.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
