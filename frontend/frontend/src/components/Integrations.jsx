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
  Lightning,
  Key,
  ArrowSquareOut
} from '@phosphor-icons/react'

const INTEGRATION_DEFS = [
  { id: 'google', name: 'Google Login', desc: 'Sign in with Google (OpenID Connect)', icon: <GoogleLogo size={24} weight="fill" /> },
  { id: 'gmail', name: 'Gmail API', desc: 'Read and send emails via Atlas agents', icon: <EnvelopeSimple size={24} weight="fill" /> },
  { id: 'calendar', name: 'Calendar API', desc: 'Manage your campus schedule & events', icon: <Calendar size={24} weight="fill" /> },
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
        ? 'OAuth credentials not configured. Please add GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET to backend/.env.'
        : `Connection error: ${err}`
      setBanner({ type: 'error', message: msg })
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleStartOAuth = (id) => {
    window.location.href = `/api/integrations/${id}/connect`
  }

  const handleConnect = (app) => {
    const info = integrationsData[app.id]
    // If provider is configured with client ID & secret, run real OAuth redirect directly
    if (info && info.configured) {
      handleStartOAuth(app.id)
      return
    }

    // If not configured yet, open configuration modal with real OAuth action & setup instructions
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
        await res.json()
        setIntegrationsData(prev => ({
          ...prev,
          [modalApp.id]: { ...(prev[modalApp.id] || {}), connected: true, configured: true }
        }))
        setBanner({
          type: 'success',
          message: `${modalApp.name} connected successfully (Development Mode).`
        })
        setModalApp(null)
      } else {
        setBanner({ type: 'error', message: 'Failed to connect in dev mode.' })
      }
    } catch (err) {
      console.error(err)
      setBanner({ type: 'error', message: 'Failed to connect in dev mode.' })
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
          [id]: { ...(prev[id] || {}), connected: false, user_email: null, user_name: null }
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
        <h2>Institutional Integrations</h2>
        <p>Connect institutional Google Workspace and tools to enable Atlas Campus Agents.</p>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {live.user_email && (
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {live.user_email}
                    </span>
                  )}
                  <button
                    className="connect-btn connected"
                    onMouseEnter={() => setHoveredId(app.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleDisconnect(app.id)}
                    title="Click to disconnect"
                  >
                    {hoveredId === app.id ? 'Disconnect' : 'Connected'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    className="connect-btn"
                    onClick={() => handleConnect(app)}
                  >
                    Connect
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal for Google & Institutional Integrations */}
      {modalApp && (
        <div className="modal-overlay" onClick={() => setModalApp(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
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

            {/* Section 1: Real OAuth 2.0 Flow (Primary Action) */}
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '18px',
              borderRadius: '10px',
              marginBottom: '16px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <Key size={18} weight="fill" color="var(--primary, #0062FF)" />
                  <span>Full OAuth 2.0 Authentication</span>
                </div>
                {integrationsData[modalApp.id]?.configured ? (
                  <span style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                    <CheckCircle size={14} weight="fill" /> Ready
                  </span>
                ) : (
                  <span style={{ fontSize: '12px', color: '#ca8a04', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                    <WarningCircle size={14} weight="fill" /> Needs Config
                  </span>
                )}
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                Authenticates directly with {modalApp.name} through the official OAuth authorization code flow.
                Grants verified permissions without exposing credentials.
              </p>

              <button
                className="btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  fontWeight: 600,
                  fontSize: '14px',
                  marginBottom: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => handleStartOAuth(modalApp.id)}
              >
                {modalApp.id === 'google' || modalApp.id === 'gmail' || modalApp.id === 'calendar' ? (
                  <GoogleLogo size={18} weight="bold" />
                ) : (
                  <ArrowSquareOut size={18} weight="bold" />
                )}
                <span>Connect with {modalApp.name}</span>
              </button>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Redirect Callback URI:</div>
                <code style={{ wordBreak: 'break-all', fontSize: '11px', color: 'var(--text-primary)' }}>
                  {`http://localhost:8080/api/oauth/${modalApp.id}/callback`}
                </code>
              </div>
            </div>

            {/* Section 2: Environment Setup Instructions if not configured */}
            {!integrationsData[modalApp.id]?.configured && (
              <div style={{ padding: '12px', borderRadius: '8px', border: '1px dashed var(--border)', fontSize: '12px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Configuration Required in backend/.env:</div>
                <div className="code-box" style={{ fontSize: '11px' }}>
                  {modalApp.id === 'github' ? (
                    <>GITHUB_CLIENT_ID=your_id<br/>GITHUB_CLIENT_SECRET=your_secret</>
                  ) : (
                    <>GOOGLE_CLIENT_ID=your_id<br/>GOOGLE_CLIENT_SECRET=your_secret</>
                  )}
                </div>
              </div>
            )}

            {/* Section 3: Instant Connect (Development Sandbox Only) */}
            <details style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              <summary style={{ cursor: 'pointer', padding: '6px 0', userSelect: 'none' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Lightning size={14} color="#eab308" />
                  Development Mode Bypass (Testing Only)
                </span>
              </summary>
              <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', marginTop: '8px', border: '1px solid var(--border)' }}>
                <p style={{ marginBottom: '8px', fontSize: '12px' }}>
                  Simulates connection for offline development. Real email sending or calendar events will fail closed without genuine OAuth authorization.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Optional token (or leave blank)"
                    value={customToken}
                    onChange={e => setCustomToken(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-secondary)',
                      fontSize: '12px'
                    }}
                  />
                  <button
                    className="btn-secondary"
                    onClick={handleQuickConnect}
                    disabled={connectingDev}
                    style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  >
                    {connectingDev ? 'Connecting...' : 'Dev Connect'}
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}
