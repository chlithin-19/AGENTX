import { ChatCircleDots, PlugsConnected, Robot, Sparkle } from '@phosphor-icons/react'

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Robot size={20} weight="fill" />
          </div>
          <div className="brand-text">
            <h1>Atlas OS</h1>
            <p>Agentic Workstation</p>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="nav-section-title">Workspace</div>

        <div 
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <div className="nav-item-left">
            <ChatCircleDots size={20} weight={activeTab === 'chat' ? "fill" : "regular"} />
            <span>Chat & Assistant</span>
          </div>
          <Sparkle size={14} weight="fill" color={activeTab === 'chat' ? '#818cf8' : 'transparent'} />
        </div>

        <div 
          className={`nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <div className="nav-item-left">
            <PlugsConnected size={20} weight={activeTab === 'integrations' ? "fill" : "regular"} />
            <span>Integrations</span>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="agent-status-badge">
          <div className="status-dot"></div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12px' }}>Atlas Agent</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>gemma4:e2b (Edge)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
