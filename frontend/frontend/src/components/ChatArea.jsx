import { useState, useRef, useEffect } from 'react'
import {
  PaperPlaneRight,
  Calendar,
  EnvelopeSimple,
  LinkedinLogo,
  Check,
  Clock,
  Sparkle,
  Trash,
  Lightning,
  ArrowSquareOut,
  ArrowsClockwise,
  Globe,
  CaretDown
} from '@phosphor-icons/react'
import ImageCard from './ImageCard'
import ThoughtLine from './ThoughtLine'

export const LANGUAGES = [
  { code: 'auto', name: 'Auto-Detect', native: 'Auto', flag: '🌐' },
  { code: 'English', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'Telugu', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'Hindi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'Spanish', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'French', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'German', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'Japanese', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'Arabic', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'Portuguese', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { code: 'Chinese', name: 'Chinese', native: '中文', flag: '🇨🇳' },
]

const LOCALIZED_CONTENT = {
  English: {
    greeting: "Hello from Atlas! How can I assist you today? You can ask me questions about your academic standing, check Lab 204 & library availability, discover campus hackathons, or read verified circulars.",
    placeholder: "Ask Atlas about academics, facilities, events, or circulars...",
    suggestions: [
      "Show my academic standing and attendance",
      "When is the Atlas 36h Hackathon?",
      "Is Lab 204 available right now?",
      "What are the library borrowing rules?",
      "Show circular #104 midterm advisory"
    ]
  },
  Telugu: {
    greeting: "నమస్కారం! అట్లాస్ మిమ్మల్ని స్వాగతిస్తోంది. నేను మీకు ఎలా సహాయపడగలను? మీరు నన్ను ప్రశ్నలు అడగవచ్చు, మీ గూగుల్ క్యాలెండర్‌లో ఈవెంట్‌లను షెడ్యూల్ చేయవచ్చు, ఇమెయిల్‌లను తనిఖీ చేయవచ్చు లేదా రాయవచ్చు.",
    placeholder: "అట్లాస్‌కు సందేశం పంపండి (ఉదా: 'సోమవారం ఉదయం 10 గంటలకు క్యాలెండర్‌లో మీటింగ్ జోడించు')...",
    suggestions: [
      "సోమవారం ఉదయం 10 గంటలకు క్యాలెండర్‌లో టీమ్ సింక్ జోడించు",
      "నా ఇన్‌బాక్స్‌లో ఉన్న ఇటీవలి ఇమెయిల్‌లు ఏమిటి?",
      "ప్రాజెక్ట్ లాంచ్ గురించి ఇమెయిల్ డ్రాఫ్ట్ చేయి",
      "తాజా AI వార్తల కోసం వెబ్‌లో శోధించు"
    ]
  },
  Hindi: {
    greeting: "नमस्ते! एटलस में आपका स्वागत है। मैं आपकी क्या मदद कर सकता हूँ? आप मुझसे प्रश्न पूछ सकते हैं, अपने Google कैलेंडर में शेड्यूल कर सकते हैं, ईमेल पढ़ या ड्राफ्ट कर सकते हैं।",
    placeholder: "एटलस को संदेश भेजें (उदा. 'सोमवार सुबह 10 बजे कैलेंडर में टीम सिंक जोड़ें')...",
    suggestions: [
      "सोमवार सुबह 10 बजे कैलेंडर में टीम सिंक जोड़ें",
      "मेरे इनबॉक्स में कौन से नए ईमेल हैं?",
      "प्रोजेक्ट लॉन्च के बारे में ईमेल ड्राफ्ट करें",
      "नवीनतम AI समाचारों के लिए वेब खोजें"
    ]
  },
  Spanish: {
    greeting: "¡Hola desde Atlas! ¿En qué puedo ayudarte hoy? Puedo programar eventos en tu Google Calendar, revisar correos en Gmail, redactar mensajes o buscar en la web.",
    placeholder: "Mensaje a Atlas (ej. 'Añadir reunión el lunes a las 10am al calendario')...",
    suggestions: [
      "Añadir reunión de equipo el lunes a las 10am al calendario",
      "¿Qué correos tengo en mi bandeja de entrada?",
      "Redacta un correo sobre el lanzamiento del proyecto",
      "Buscar en la web las últimas noticias de IA"
    ]
  },
  French: {
    greeting: "Bonjour depuis Atlas ! Comment puis-je vous aider aujourd'hui ? Je peux planifier des événements sur votre Google Agenda, lire ou rédiger des e-mails, ou chercher sur le web.",
    placeholder: "Envoyez un message à Atlas (ex. 'Ajouter une réunion lundi à 10h')...",
    suggestions: [
      "Ajouter une réunion lundi à 10h au calendrier",
      "Quels sont mes e-mails récents ?",
      "Rédiger un e-mail sur le lancement du projet",
      "Rechercher les dernières actus IA sur le web"
    ]
  }
}

export default function ChatArea() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(null)
  const [autoMode, setAutoMode] = useState(false)
  const [actionInProgress, setActionInProgress] = useState({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  
  // Stored language selection
  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem('atlas_language') || 'auto'
  })

  const messagesEndRef = useRef(null)
  const langMenuRef = useRef(null)

  // Current localized pack
  const currentLocale = LOCALIZED_CONTENT[selectedLang] || LOCALIZED_CONTENT['English']

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Close language menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch chat history from backend
  const loadHistory = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true)
    try {
      const res = await fetch('/api/history')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data.map(m => ({
            id: m.id || String(Math.random()),
            text: m.content || '',
            sender: m.role === 'user' ? 'user' : 'agent',
            action: m.action || null,
            attachments: m.attachments || null
          })))
        } else {
          setMessages([
            { id: 'initial-greeting', text: currentLocale.greeting, sender: 'agent' }
          ])
        }
      }
    } catch (err) {
      console.error('Failed to load history:', err)
      if (messages.length === 0) {
        setMessages([
          { id: 'initial-greeting', text: currentLocale.greeting, sender: 'agent' }
        ])
      }
    } finally {
      if (isManualRefresh) {
        setTimeout(() => setIsRefreshing(false), 500)
      }
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentStep])

  const handleLanguageChange = (code) => {
    setSelectedLang(code)
    localStorage.setItem('atlas_language', code)
    setShowLangMenu(false)
  }

  const handleSend = async (customPrompt) => {
    const textToSend = typeof customPrompt === 'string' ? customPrompt : input
    if (!textToSend.trim() || isGenerating) return

    const userMsgId = 'usr_' + Date.now()
    const agentMsgId = 'agt_' + (Date.now() + 1)

    const userMsg = { id: userMsgId, text: textToSend, sender: 'user' }
    setMessages(prev => [...prev, userMsg])
    if (typeof customPrompt !== 'string') setInput("")
    setIsGenerating(true)
    setCurrentStep("Thinking...")

    // Placeholder for streaming agent response
    setMessages(prev => [
      ...prev,
      { id: agentMsgId, text: '', sender: 'agent', action: null, attachments: null }
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          mode: autoMode ? 'auto' : 'manual',
          language: selectedLang
        })
      })

      if (!response.ok) {
        throw new Error(`Chat error (${response.status})`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const block of lines) {
          const trimmed = block.trim()
          if (!trimmed.startsWith('data:')) continue
          const jsonStr = trimmed.slice(5).trim()
          if (!jsonStr) continue

          try {
            const data = JSON.parse(jsonStr)

            if (data.step) {
              setCurrentStep(data.step)
            }

            if (data.token) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === agentMsgId ? { ...m, text: m.text + data.token } : m
                )
              )
            }

            if (data.action) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === agentMsgId ? { ...m, action: data.action } : m
                )
              )
            }

            if (data.attachments) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === agentMsgId ? { ...m, attachments: data.attachments } : m
                )
              )
            }

            if (data.done) {
              setCurrentStep(null)
            }
          } catch {
            // ignore malformed chunk
          }
        }
      }
    } catch (err) {
      console.error(err)
      setMessages(prev =>
        prev.map(m =>
          m.id === agentMsgId
            ? { ...m, text: m.text || `⚠️ Error: Could not get response (${err.message}).` }
            : m
        )
      )
    } finally {
      setIsGenerating(false)
      setCurrentStep(null)
    }
  }

  const handleExecuteAction = async (msgId, action, messageText) => {
    setActionInProgress(prev => ({ ...prev, [msgId]: true }))
    try {
      if (action.type === 'calendar.create') {
        const res = await fetch('/api/actions/calendar/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: action.events })
        })
        const data = await res.json()
        if (res.ok) {
          setMessages(prev =>
            prev.map(m =>
              m.id === msgId
                ? {
                    ...m,
                    action: {
                      ...m.action,
                      done: true,
                      doneLabel: `Added ${data.count || action.events.length} event(s) to Calendar ✓`
                    }
                  }
                : m
            )
          )
        } else {
          alert(`Calendar error: ${data.error || 'Failed to add events'}`)
        }
      } else if (action.type === 'email.send') {
        const res = await fetch('/api/actions/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: action.to, text: messageText })
        })
        const data = await res.json()
        if (res.ok) {
          setMessages(prev =>
            prev.map(m =>
              m.id === msgId
                ? {
                    ...m,
                    action: {
                      ...m.action,
                      done: true,
                      doneLabel: `Email sent to ${action.to} ✓`
                    }
                  }
                : m
            )
          )
        } else {
          alert(`Email error: ${data.error || 'Failed to send email'}`)
        }
      } else if (action.type === 'linkedin.post') {
        const res = await fetch('/api/actions/linkedin/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: messageText })
        })
        const data = await res.json()
        if (res.ok) {
          setMessages(prev =>
            prev.map(m =>
              m.id === msgId
                ? {
                    ...m,
                    action: {
                      ...m.action,
                      done: true,
                      doneLabel: 'Published on LinkedIn ✓'
                    }
                  }
                : m
            )
          )
        } else {
          alert(`LinkedIn error: ${data.error || 'Failed to post'}`)
        }
      }
    } catch (err) {
      console.error(err)
      alert(`Action error: ${err.message}`)
    } finally {
      setActionInProgress(prev => ({ ...prev, [msgId]: false }))
    }
  }

  const handleClearHistory = async () => {
    if (!confirm('Clear conversation history?')) return
    try {
      await fetch('/api/history', { method: 'DELETE' })
      setMessages([{ id: 'initial-greeting', text: currentLocale.greeting, sender: 'agent' }])
    } catch (err) {
      console.error('Failed to clear history', err)
    }
  }

  // Parse markdown images like ![alt](url)
  const renderMessageContent = (text) => {
    if (!text) return null
    const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = imgRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      parts.push(
        <ImageCard key={match.index} src={match[2]} alt={match[1]} />
      )
      lastIndex = imgRegex.lastIndex
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return (
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {parts.map((p, idx) => (typeof p === 'string' ? <span key={idx}>{p}</span> : p))}
      </div>
    )
  }

  const activeLangObj = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0]

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-title-group">
          <h2>Atlas Assistant</h2>
          <span className="model-pill">Gemma 4 Edge</span>
        </div>

        <div className="chat-controls">
          {/* Language Selector Dropdown */}
          <div className="lang-dropdown-wrapper" ref={langMenuRef}>
            <button
              className="lang-selector-btn"
              onClick={() => setShowLangMenu(!showLangMenu)}
              title="Select response language"
            >
              <Globe size={15} color="var(--accent-light)" />
              <span>{activeLangObj.flag} {activeLangObj.name}</span>
              <CaretDown size={12} />
            </button>

            {showLangMenu && (
              <div className="lang-dropdown-menu">
                {LANGUAGES.map(lang => (
                  <div
                    key={lang.code}
                    className={`lang-option ${selectedLang === lang.code ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <span>{lang.flag} {lang.name}</span>
                    <span style={{ fontSize: '11px', opacity: 0.7 }}>{lang.native}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Autopilot Mode Toggle */}
          <div
            className={`mode-toggle ${autoMode ? 'active' : ''}`}
            onClick={() => setAutoMode(!autoMode)}
            title="When active, Atlas executes calendar marks and emails automatically without asking for confirmation"
          >
            <Lightning size={14} weight={autoMode ? "fill" : "regular"} />
            <span>{autoMode ? 'Autopilot: ON' : 'Autopilot: OFF'}</span>
          </div>

          {/* Refresh Chat Button */}
          <button
            className={`header-btn ${isRefreshing ? 'spinning' : ''}`}
            onClick={() => loadHistory(true)}
            disabled={isRefreshing}
            title="Refresh chat messages and state"
          >
            <ArrowsClockwise size={15} />
            <span>Refresh</span>
          </button>

          {/* Clear History Button */}
          <button
            className="header-btn"
            onClick={handleClearHistory}
            title="Clear conversation history"
          >
            <Trash size={15} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="messages">
        {messages.map(m => (
          <div key={m.id} className={`message ${m.sender}`}>
            <div className={`avatar ${m.sender}`}>
              {m.sender === 'user' ? 'U' : 'A'}
            </div>
            <div className="message-content">
              {renderMessageContent(m.text)}

              {/* Attachments if any (emails or calendar events returned) */}
              {m.attachments && m.attachments.length > 0 && (
                <div className="attachment-list">
                  {m.attachments.map((att, attIdx) => (
                    <a
                      key={attIdx}
                      href={att.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-item"
                    >
                      <div className="attachment-info">
                        <span className="attachment-title">
                          {att.type === 'email' ? '✉️ ' : '📅 '}
                          {att.title}
                        </span>
                        {att.subtitle && (
                          <span className="attachment-sub">{att.subtitle}</span>
                        )}
                      </div>
                      {att.url && <ArrowSquareOut size={16} color="var(--text-secondary)" />}
                    </a>
                  ))}
                </div>
              )}

              {/* Action Box if any */}
              {m.action && (
                <div className="action-box">
                  <div className="action-box-header">
                    <div className="action-box-title">
                      {m.action.type === 'calendar.create' && <Calendar size={18} weight="fill" />}
                      {m.action.type === 'email.send' && <EnvelopeSimple size={18} weight="fill" />}
                      {m.action.type === 'linkedin.post' && <LinkedinLogo size={18} weight="fill" />}
                      <span>
                        {m.action.type === 'calendar.create' && 'Calendar Action'}
                        {m.action.type === 'email.send' && `Send Email to ${m.action.to}`}
                        {m.action.type === 'linkedin.post' && 'LinkedIn Post'}
                        {m.action.type === 'job.queued' && 'Background Task'}
                      </span>
                    </div>
                  </div>

                  {/* Calendar events details */}
                  {m.action.type === 'calendar.create' && m.action.events && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {m.action.events.map((ev, evIdx) => (
                        <div key={evIdx} className="action-detail-item">
                          <Clock size={14} />
                          <span>
                            <strong>{ev.title}</strong> — {ev.date} {ev.start ? `at ${ev.start}` : '(all day)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action execute button */}
                  {m.action.type !== 'job.queued' && (
                    <button
                      className={`action-execute-btn ${m.action.done ? 'done' : ''}`}
                      disabled={m.action.done || actionInProgress[m.id]}
                      onClick={() => handleExecuteAction(m.id, m.action, m.text)}
                    >
                      {m.action.done ? (
                        <>
                          <Check size={16} weight="bold" />
                          <span>{m.action.doneLabel || 'Completed ✓'}</span>
                        </>
                      ) : actionInProgress[m.id] ? (
                        'Processing...'
                      ) : (
                        m.action.label || 'Proceed'
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Real-time multi-agent reasoning steps via ThoughtLine */}
        {(isGenerating || currentStep) && (
          <div className="message agent" style={{ maxWidth: '820px', width: '100%' }}>
            <div className="avatar agent">✦</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ThoughtLine
                working={isGenerating}
                label="Orchestrator Reasoning"
                steps={currentStep ? [currentStep] : ['Routing intent to campus agents...', 'Processing knowledge base...']}
                showTimer={true}
                collapseOnSettle={true}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts when few messages */}
      {messages.length <= 1 && !isGenerating && (
        <div className="prompt-chips-container">
          <div className="prompt-chips-label">
            Suggested Prompts ({activeLangObj.name}):
          </div>
          <div className="prompt-chips">
            {currentLocale.suggestions.map((s, idx) => (
              <div key={idx} className="prompt-chip" onClick={() => handleSend(s)}>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="input-area">
        <div className="input-wrapper">
          <textarea
            className="chat-input"
            placeholder={isGenerating ? "Atlas is generating response..." : currentLocale.placeholder}
            value={input}
            disabled={isGenerating}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            rows={1}
          />
          <button
            className="send-button"
            onClick={() => handleSend()}
            disabled={isGenerating || !input.trim()}
            style={{ opacity: isGenerating || !input.trim() ? 0.35 : 1 }}
            title="Send Message (Enter)"
          >
            <PaperPlaneRight size={18} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  )
}
