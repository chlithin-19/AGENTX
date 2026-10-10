import React, { useState } from 'react'
import {
  House,
  ChatCircleDots,
  GraduationCap,
  Buildings,
  CalendarBlank,
  MegaphoneSimple,
  Gear,
  List,
  X,
  ArrowRight
} from '@phosphor-icons/react'

export default function MobileNav({ activeTab, onSelectTab }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Home', desc: 'Campus Overview & Orbit', icon: House, badge: 'Overview' },
    { id: 'chat', label: 'Ask Atlas', desc: 'Hybrid Multi-Agent Chat', icon: ChatCircleDots, badge: 'AI Copilot' },
    { id: 'academics', label: 'Academics', desc: 'Attendance & CGPA Tracker', icon: GraduationCap, badge: 'Academic' },
    { id: 'campus', label: 'Campus', desc: 'Facilities & Labs', icon: Buildings, badge: 'Facilities' },
    { id: 'events', label: 'Events', desc: 'Hackathons & Schedule', icon: CalendarBlank, badge: 'Events' },
    { id: 'communication', label: 'Communication', desc: 'Circulars & Notices', icon: MegaphoneSimple, badge: 'Circulars' },
    { id: 'settings', label: 'Settings', desc: 'OAuth & Configuration', icon: Gear, badge: 'System' },
  ]

  const bottomItems = [
    { id: 'home', label: 'Home', icon: House },
    { id: 'chat', label: 'Ask Atlas', icon: ChatCircleDots, isCenter: true },
    { id: 'academics', label: 'Academics', icon: GraduationCap },
    { id: 'campus', label: 'Campus', icon: Buildings },
  ]

  const handleSelect = (id) => {
    onSelectTab(id)
    setDrawerOpen(false)
  }

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="atlas-mobile-header frosted-panel" role="banner">
        <button
          className="atlas-mobile-brand"
          onClick={() => handleSelect('home')}
          aria-label="Atlas Home"
        >
          <span className="atlas-monogram-symbol">✦</span>
          <span className="atlas-brand-title">ATLAS</span>
        </button>

        <div className="atlas-mobile-header-right">
          <button
            className="atlas-mobile-quick-chat"
            onClick={() => handleSelect('chat')}
            aria-label="Ask Atlas Quick Chat"
          >
            <span>Ask</span>
            <ArrowRight size={12} weight="bold" />
          </button>
          <button
            className="atlas-mobile-menu-btn"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label={drawerOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
        </div>
      </header>

      {/* Slide-Down Drawer Overlay */}
      {drawerOpen && (
        <div
          className="atlas-mobile-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-Down Navigation Drawer */}
      <nav
        className={`atlas-mobile-drawer frosted-panel ${drawerOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation Drawer"
      >
        <div className="atlas-mobile-drawer-header">
          <span className="atlas-drawer-title">Navigation</span>
          <button
            className="atlas-drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close Navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="atlas-mobile-drawer-list">
          {navItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                className={`atlas-mobile-drawer-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="atlas-mobile-item-icon">
                  <IconComponent size={22} weight={isActive ? 'bold' : 'regular'} />
                </div>
                <div className="atlas-mobile-item-info">
                  <div className="atlas-mobile-item-title-row">
                    <span className="atlas-mobile-item-label">{item.label}</span>
                    <span className="atlas-mobile-item-badge">{item.badge}</span>
                  </div>
                  <span className="atlas-mobile-item-desc">{item.desc}</span>
                </div>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Persistent Bottom Mobile Navigation Bar */}
      <nav className="atlas-bottom-bar frosted-panel" aria-label="Bottom Quick Navigation">
        {bottomItems.map((item) => {
          const IconComponent = item.icon
          const isActive = activeTab === item.id
          if (item.isCenter) {
            return (
              <button
                key={item.id}
                className={`atlas-bottom-center-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(item.id)}
                aria-label="Ask Atlas"
                aria-current={isActive ? 'page' : undefined}
              >
                <IconComponent size={24} weight="bold" />
              </button>
            )
          }
          return (
            <button
              key={item.id}
              className={`atlas-bottom-item ${isActive ? 'active' : ''}`}
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <IconComponent size={20} weight={isActive ? 'bold' : 'regular'} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
