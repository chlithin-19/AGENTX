import React from 'react'
import {
  House,
  ChatCircleDots,
  GraduationCap,
  Buildings,
  CalendarBlank,
  MegaphoneSimple,
  Gear,
  ArrowRight
} from '@phosphor-icons/react'

export default function Header({ activeTab, onSelectTab }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: House },
    { id: 'chat', label: 'Ask Atlas', icon: ChatCircleDots },
    { id: 'academics', label: 'Academics', icon: GraduationCap },
    { id: 'campus', label: 'Campus', icon: Buildings },
    { id: 'events', label: 'Events', icon: CalendarBlank },
    { id: 'communication', label: 'Communication', icon: MegaphoneSimple },
    { id: 'settings', label: 'Settings', icon: Gear },
  ]

  return (
    <header className="atlas-header-wrapper" role="banner">
      <div className="atlas-header frosted-panel">
        {/* Left: Brand Monogram & Status */}
        <button
          className="atlas-brand-btn"
          onClick={() => onSelectTab('home')}
          aria-label="Atlas Home"
        >
          <div className="atlas-monogram">
            <span className="atlas-monogram-symbol">✦</span>
          </div>
          <div className="atlas-brand-text">
            <span className="atlas-brand-title">ATLAS</span>
            <div className="atlas-status-pill" title="Hybrid Edge-Cloud Active">
              <span className="atlas-status-dot" />
              <span className="atlas-status-label">Active</span>
            </div>
          </div>
        </button>

        {/* Center: Segmented Navigation Track */}
        <nav className="atlas-nav-track" role="tablist" aria-label="Main Navigation">
          {navItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={isActive}
                aria-controls={`${item.id}-view-mount`}
                className={`atlas-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <IconComponent size={16} weight={isActive ? 'bold' : 'regular'} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right: Quick CTA Pill */}
        <div className="atlas-header-actions">
          <button
            className="atlas-pill-btn atlas-header-cta"
            onClick={() => onSelectTab('chat')}
            aria-label="Ask Atlas"
          >
            <span>Ask Atlas</span>
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </div>
    </header>
  )
}
