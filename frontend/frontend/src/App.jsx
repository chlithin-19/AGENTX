import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import Integrations from './components/Integrations'

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.pathname.includes('integrations') ||
        window.location.search.includes('connected') ||
        window.location.search.includes('error') ||
        window.location.search.includes('tab=integrations'))
    ) {
      return 'integrations'
    }
    return 'chat'
  })

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        {activeTab === 'chat' ? <ChatArea /> : <Integrations />}
      </div>
    </div>
  )
}

export default App
