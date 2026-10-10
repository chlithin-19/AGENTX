import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import MobileNav from './components/MobileNav'
import HomeView from './views/HomeView'
import ChatArea from './components/ChatArea'
import AcademicsView from './views/AcademicsView'
import CampusView from './views/CampusView'
import EventsView from './views/EventsView'
import CommunicationView from './views/CommunicationView'
import SettingsView from './views/SettingsView'

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
  const [initialPrompt, setInitialPrompt] = useState('')

  const handleSelectTab = (tab, pushState = true) => {
    setActiveTabState(tab)
    if (pushState && typeof window !== 'undefined') {
      const url = tab === 'home' ? '/' : `/?tab=${tab}`
      window.history.pushState({ tab }, '', url)
    }
  }

  const handleNavigateWithPrompt = (tab, prompt = '') => {
    if (prompt) {
      setInitialPrompt(prompt)
    }
    handleSelectTab(tab)
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
        {activeTab === 'home' && (
          <div className="atlas-view-container" id="home-view-mount">
            <HomeView onNavigate={handleNavigateWithPrompt} />
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="atlas-view-container" id="chat-view-mount">
            <ChatArea initialPrompt={initialPrompt} />
          </div>
        )}
        {activeTab === 'academics' && (
          <div className="atlas-view-container" id="academics-view-mount">
            <AcademicsView onNavigate={handleNavigateWithPrompt} />
          </div>
        )}
        {activeTab === 'campus' && (
          <div className="atlas-view-container" id="campus-view-mount">
            <CampusView onNavigate={handleNavigateWithPrompt} />
          </div>
        )}
        {activeTab === 'events' && (
          <div className="atlas-view-container" id="events-view-mount">
            <EventsView onNavigate={handleNavigateWithPrompt} />
          </div>
        )}
        {activeTab === 'communication' && (
          <div className="atlas-view-container" id="communication-view-mount">
            <CommunicationView onNavigate={handleNavigateWithPrompt} />
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="atlas-view-container" id="settings-view-mount">
            <SettingsView />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
