import { useState, useEffect } from 'react'
import {
  EnvelopeSimple,
  Calendar,
  GithubLogo,
  GoogleLogo,
  LinkedinLogo,
  X,
  CheckCircle,
  WarningCircle,
  Gear,
  Lightning,
  Key
} from '@phosphor-icons/react'

const INTEGRATION_DEFS = [
  { id: 'google', name: 'Google Login', desc: 'Sign in with Google', icon: <GoogleLogo size={24} weight="fill" /> },
  { id: 'gmail', name: 'Gmail API', desc: 'Read and send emails via Hermes', icon: <EnvelopeSimple size={24} weight="fill" /> },
  { id: 'calendar', name: 'Calendar API', desc: 'Manage your schedule', icon: <Calendar size={24} weight="fill" /> },
  { id: 'github', name: 'GitHub', desc: 'Interact with repositories and issues', icon: <GithubLogo size={24} weight="fill" /> },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Share posts and profile updates', icon: <LinkedinLogo size={24} weight="fill" /> },
]

export default function Integrations() {
  const [integrationsData, setIntegrationsData] = useState({})
  const [hoveredId, setHoveredId] = useState(null)
  const [banner, setBanner] = useState(null)
  const [modalApp, setModalApp] = useState(null)
  const [customToken, setCustomToken] = useState('')
  const [connectingDev, setConnectingDev] = useState(false)

  const fetchIntegrations = async () => {
    try {
      const res = await fetch('/api/integrations')
      if (res.ok) {
        const data = await res.json()
        const map = {}
        data.forEach(item => {
          map[item.id] = item
        })
        setIntegrationsData(map)
      }
    } catch (err) {
      console.error('Failed to load integrations status', err)
    }
  }

  useEffect(() => {
    fetchIntegrations()

    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('connected')) {
      setBanner({
        type: 'success',
        message: 'Integration connected successfully!'
      })
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (searchParams.get('error')) {
      const err = searchParams.get('error')
      const msg = err === 'not_configured'
        ? 'OAuth credentials not configured. Please add the Client ID & Secret to backend/.env first.'
        : `Connection error: ${err}`
      setBanner({ type: 'error', message: msg })
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleConnect = (app) => {
    const info = integrationsData[app.id]
    // If provider is configured with client ID & secret, run real OAuth redirect
    if (info && info.configured) {
      window.location.href = `/api/integrations/${app.id}/connect`
      return
    }

    // If not configured, open config modal with Quick Dev Connect or Token entry
    setModalApp(app)
    setCustomToken('')
  }

  const handleQuickConnect = async () => {
    if (!modalApp) return
    setConnectingDev(true)
    try {
      const res = await fetch(`/api/integrations/${modalApp.id}/dev-connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customToken.trim() || undefined })
      })
      if (res.ok) {
        const updated = await res.json()
        setIntegrationsData(prev => ({
          ...prev,
          [modalApp.id]: { ...(prev[modalApp.id] || {}), connected: true, configured: true }
        }))
        setBanner({
          type: 'success',
          message: `${modalApp.name} connected successfully!`
        })
        setModalApp(null)
      } else {
        setBanner({ type: 'error', message: 'Failed to connect.' })
      }
    } catch (err) {
      console.error(err)
      setBanner({ type: 'error', message: 'Failed to connect.' })
    } finally {
      setConnectingDev(false)
    }
  }

  const handleDisconnect = async (id) => {
    try {
      const res = await fetch(`/api/integrations/${id}/disconnect`, { method: 'POST' })
      if (res.ok) {
        const updated = await res.json()
        setIntegrationsData(prev => ({
          ...prev,
          [id]: { ...(prev[id] || {}), connected: false }
        }))
        setBanner({
          type: 'success',
          message: `${updated.name || id} disconnected.`
        })
      }
    } catch (err) {
      console.error('Failed to disconnect', err)
      setBanner({ type: 'error', message: 'Failed to disconnect integration.' })
    }
  }

  return (
    <div className="integrations-panel">
      <div className="integrations-header">
        <h2>Integrations</h2>
        <p>Connect external apps and services to enable Hermes agents.</p>
      </div>


      {banner && (
        <div className={`integration-banner ${banner.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {banner.type === 'success' ? <CheckCircle size={20} weight="fill" /> : <WarningCircle size={20} weight="fill" />}
            <span>{banner.message}</span>
          </div>
          <button
            onClick={() => setBanner(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="integrations-list">
        {INTEGRATION_DEFS.map(app => {
          const live = integrationsData[app.id] || {}
          const isConnected = !!live.connected
          const isConfigured = live.configured !== false

          return (
            <div key={app.id} className="integration-card">
              <div className="integration-info">
                <div className="integration-icon">{app.icon}</div>
                <div className="integration-details">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h3>{app.name}</h3>
                    {!isConfigured && !isConnected && (
                      <span className="integration-badge badge-unconfigured">Setup Required</span>
                    )}
                  </div>
                  <p>{app.desc}</p>
                </div>
              </div>

              {isConnected ? (
                <button
                  className="connect-btn connected"
                  onMouseEnter={() => setHoveredId(app.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleDisconnect(app.id)}
                  title="Click to disconnect"
                >
                  {hoveredId === app.id ? 'Disconnect' : 'Connected'}
                </button>
              ) : (
                <button
                  className="connect-btn"
                  onClick={() => handleConnect(app)}
                >
                  Connect
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal for Unconfigured Integrations */}
      {modalApp && (
        <div className="modal-overlay" onClick={() => setModalApp(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '20px' }}>{modalApp.icon}</div>
                <h3>Connect {modalApp.name}</h3>
              </div>
              <button
                onClick={() => setModalApp(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Choose how you would like to connect {modalApp.name}:
            </p>

            {/* Option 1: Quick Connect */}
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '6px' }}>
                <Lightning size={18} weight="fill" color="#eab308" />
                <span>Instant Connect (Development)</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Connect immediately for testing without setting up OAuth keys.
              </p>

              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Optional Personal Access Token (or leave blank)"
                  value={customToken}
                  onChange={e => setCustomToken(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-primary)',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={handleQuickConnect}
                disabled={connectingDev}
              >
                {connectingDev ? 'Connecting...' : 'Connect Instantly'}
              </button>
            </div>

            {/* Option 2: Real OAuth credentials */}
            <div style={{ padding: '12px', borderRadius: '8px', border: '1px dashed var(--border)', fontSize: '13px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={16} />
                <span>Or Set Up Full OAuth</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Add these to <code>backend/.env</code> and restart <code>npm start</code>:
              </p>
              <div className="code-box">
                {modalApp.id === 'github' ? (
                  <>GITHUB_CLIENT_ID=your_id<br/>GITHUB_CLIENT_SECRET=your_secret</>
                ) : (
                  <>GOOGLE_CLIENT_ID=your_id<br/>GOOGLE_CLIENT_SECRET=your_secret</>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
