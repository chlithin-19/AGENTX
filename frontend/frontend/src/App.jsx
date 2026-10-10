import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import MobileNav from './components/MobileNav'
import ChatArea from './components/ChatArea'
import Integrations from './components/Integrations'

function getInitialTab() {
  if (typeof window === 'undefined') return 'home'

  const path = window.location.pathname.toLowerCase()
  const search = window.location.search.toLowerCase()

  if (
    path.includes('integrations') ||
    path.includes('settings') ||
    search.includes('connected') ||
    search.includes('error') ||
    search.includes('tab=integrations') ||
    search.includes('tab=settings')
  ) {
    return 'settings'
  }
  if (path.includes('chat') || search.includes('tab=chat')) return 'chat'
  if (path.includes('academics') || search.includes('tab=academics')) return 'academics'
  if (path.includes('campus') || search.includes('tab=campus')) return 'campus'
  if (path.includes('events') || search.includes('tab=events')) return 'events'
  if (path.includes('communication') || search.includes('tab=communication')) return 'communication'

  return 'home'
}

function App() {
  const [activeTab, setActiveTabState] = useState(getInitialTab)

  const handleSelectTab = (tab, pushState = true) => {
    setActiveTabState(tab)
    if (pushState && typeof window !== 'undefined') {
      const url = tab === 'home' ? '/' : `/?tab=${tab}`
      window.history.pushState({ tab }, '', url)
    }
  }

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        handleSelectTab(event.state.tab, false)
      } else {
        handleSelectTab(getInitialTab(), false)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div className="atlas-app">
      {/* Background Micro-Dots & Atmospheric Lighting */}
      <div className="atlas-grid-bg" aria-hidden="true" />
      <div className="atlas-glow-bloom atlas-glow-top" aria-hidden="true" />
      <div className="atlas-glow-bloom atlas-glow-bottom" aria-hidden="true" />

      {/* Floating Desktop Navigation Header */}
      <Header activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Mobile Top Bar, Slide-Down Drawer & Bottom Nav */}
      <MobileNav activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Main Content Area */}
      <main className="atlas-main-content">
        {activeTab === 'chat' && <ChatArea />}
        {activeTab === 'settings' && <Integrations />}
        {activeTab === 'home' && (
          <div className="atlas-view-container" id="home-view-mount">
            {/* Home view will be rendered by HomeView component in Plan 01-03 */}
            <div className="atlas-view-placeholder">
              <span className="atlas-watermark">ATLAS</span>
              <div className="scalloped-card" style={{ padding: '48px', maxWidth: '720px', margin: '60px auto', textAlign: 'center', zIndex: 1 }}>
                <span className="atlas-badge" style={{ marginBottom: '16px' }}>Campus Intelligence System</span>
                <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--atlas-text-headline)', marginBottom: '16px' }}>
                  Atlas Multi-Agent Platform
                </h1>
                <p style={{ color: 'var(--atlas-text-body)', fontSize: '16px', lineHeight: 1.6, marginBottom: '28px' }}>
                  Privacy-first hybrid architecture connecting academic records, facilities scheduling, campus events, and administrative circulars.
                </p>
                <button className="atlas-pill-btn" onClick={() => handleSelectTab('chat')}>
                  Launch Ask Atlas →
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'academics' && (
          <div className="atlas-view-container" id="academics-view-mount">
            <div className="scalloped-card" style={{ padding: '40px', maxWidth: '800px', margin: '40px auto' }}>
              <span className="atlas-badge academic">Academic Intelligence</span>
              <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '16px 0', color: 'var(--atlas-text-headline)' }}>Academic & Placement Analytics</h2>
              <p style={{ color: 'var(--atlas-text-body)' }}>Track attendance, predict placement readiness, and review course grades.</p>
            </div>
          </div>
        )}
        {activeTab === 'campus' && (
          <div className="atlas-view-container" id="campus-view-mount">
            <div className="scalloped-card" style={{ padding: '40px', maxWidth: '800px', margin: '40px auto' }}>
              <span className="atlas-badge campus">Campus Facilities</span>
              <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '16px 0', color: 'var(--atlas-text-headline)' }}>Facilities & Infrastructure</h2>
              <p style={{ color: 'var(--atlas-text-body)' }}>Real-time Lab 204 occupancy, campus maps, and maintenance requests.</p>
            </div>
          </div>
        )}
        {activeTab === 'events' && (
          <div className="atlas-view-container" id="events-view-mount">
            <div className="scalloped-card" style={{ padding: '40px', maxWidth: '800px', margin: '40px auto' }}>
              <span className="atlas-badge events">Campus Events</span>
              <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '16px 0', color: 'var(--atlas-text-headline)' }}>Events & Hackathons</h2>
              <p style={{ color: 'var(--atlas-text-body)' }}>Discover hackathons, AI workshops, guest lectures, and placement drives.</p>
            </div>
          </div>
        )}
        {activeTab === 'communication' && (
          <div className="atlas-view-container" id="communication-view-mount">
            <div className="scalloped-card" style={{ padding: '40px', maxWidth: '800px', margin: '40px auto' }}>
              <span className="atlas-badge communication">Communications</span>
              <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '16px 0', color: 'var(--atlas-text-headline)' }}>Official Notices & Circulars</h2>
              <p style={{ color: 'var(--atlas-text-body)' }}>Department notifications, urgent circulars, and academic announcements.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
