import React, { useState, useEffect } from 'react'
import {
  CalendarBlank,
  MapPin,
  Clock,
  Users,
  Trophy,
  ArrowRight,
  Sparkle,
  CheckCircle
} from '@phosphor-icons/react'

export default function EventsView({ onNavigate }) {
  const defaultEvents = [
    {
      id: 'evt_hack_2026',
      title: 'Atlas 36-Hour National Campus Hackathon 2026',
      category: 'Hackathon / Innovation',
      date: 'October 10-12, 2026',
      time: 'Fri 06:00 PM – Sun 06:00 AM',
      venue: 'Seminar Hall 1 & Computer Lab 204 (Academic Block A)',
      organizer: 'Campus Developer Club & Innovation Cell',
      status: 'Registration Open',
      capacity: 200,
      registeredCount: 145,
      prize: 'Prizes Worth ₹2,50,000',
      description: 'Multi-track national hackathon focusing on AI Agents, Healthcare Robotics, and Campus Automation.'
    },
    {
      id: 'evt_ai_workshop',
      title: 'Applied Generative AI & Large Language Models Workshop',
      category: 'Technical Workshop',
      date: 'October 07, 2026',
      time: 'Wed 02:00 PM – 05:00 PM',
      venue: 'Computer Center Lab 204',
      organizer: 'Department of Computer Science & Engineering',
      status: 'Filling Fast',
      capacity: 60,
      registeredCount: 52,
      prize: 'Certificate & API Credits',
      description: 'Hands-on deployment session with small language models (Gemma 4 / Ollama) and hybrid multi-agent orchestration.'
    },
    {
      id: 'evt_career_fair',
      title: 'Annual Campus Placement & Career Fair 2026',
      category: 'Career & Placement',
      date: 'October 18-19, 2026',
      time: 'Sat & Sun 09:00 AM – 05:00 PM',
      venue: 'Student Activity Center (SAC Auditorium & Exhibition Hall)',
      organizer: 'University Training & Placement Cell',
      status: 'Open',
      capacity: 1000,
      registeredCount: 820,
      prize: '45+ Recruiting Companies',
      description: 'Tier-1 technology firms recruiting final and pre-final year engineering students across software and core domains.'
    }
  ]

  const [events, setEvents] = useState(defaultEvents)
  const [registeredIds, setRegisteredIds] = useState(new Set())
  const [registeringId, setRegisteringId] = useState(null)

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/atlas/events')
      if (res.ok) {
        const json = await res.json()
        if (json.status === 'success' && Array.isArray(json.data)) {
          setEvents(json.data)
        }
      }
    } catch {
      // Offline fallback
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleRegister = async (eventId) => {
    setRegisteringId(eventId)
    try {
      const res = await fetch(`/api/atlas/events/${eventId}/register`, { method: 'POST' })
      if (res.ok) {
        setRegisteredIds(prev => new Set(prev).add(eventId))
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e))
      }
    } catch {
      setRegisteredIds(prev => new Set(prev).add(eventId))
    } finally {
      setRegisteringId(null)
    }
  }

  return (
    <div className="subview-container">
      {/* Subview Header */}
      <div className="subview-header">
        <div>
          <div className="subview-badge-row">
            <span className="atlas-badge event">
              <CalendarBlank size={14} weight="bold" />
              <span>Campus Programming</span>
            </span>
            <span className="demo-badge-pill">LIVE REGISTRATION TRACKING</span>
          </div>
          <h1 className="subview-title">Campus Events & Technical Workshops</h1>
          <p className="subview-subtitle">
            Authoritative schedules, hackathon team registrations, and calendar synchronization.
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="events-stack">
        {events.map((evt) => (
          <div key={evt.id} className="scalloped-card event-row-card">
            <div className="event-date-col">
              <div className="date-badge">
                <span className="date-text">{evt.date.split(',')[0]}</span>
              </div>
              <span className={`event-status-tag ${evt.status?.toLowerCase().includes('open') ? 'open' : ''}`}>
                {evt.status || 'Active'}
              </span>
            </div>

            <div className="event-content-col">
              <div className="event-top-row">
                <span className="event-category-pill">{evt.category}</span>
                {evt.prize && (
                  <span className="event-prize-pill">
                    <Trophy size={14} />
                    <span>{evt.prize}</span>
                  </span>
                )}
              </div>

              <h3 className="event-title">{evt.title}</h3>
              <p className="event-desc">{evt.description || evt.desc}</p>

              <div className="event-details-row">
                <div className="detail-item">
                  <MapPin size={14} />
                  <span>{evt.venue}</span>
                </div>
                <div className="detail-item">
                  <Clock size={14} />
                  <span>{evt.time}</span>
                </div>
                <div className="detail-item">
                  <Users size={14} />
                  <span>{evt.registeredCount} / {evt.capacity} Registered</span>
                </div>
              </div>
            </div>

            <div className="event-action-col">
              {registeredIds.has(evt.id) ? (
                <span className="atlas-badge" style={{ color: '#059669', background: 'rgba(16, 185, 129, 0.1)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} weight="fill" /> Registered
                </span>
              ) : (
                <button
                  className="atlas-pill-btn secondary"
                  style={{ marginBottom: '6px' }}
                  disabled={registeringId === evt.id}
                  onClick={() => handleRegister(evt.id)}
                >
                  <span>{registeringId === evt.id ? 'Registering...' : 'Register'}</span>
                </button>
              )}
              <button
                className="atlas-pill-btn"
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => onNavigate('chat', `Schedule reminder for ${evt.title} on my Google Calendar`)}
              >
                <span>Add to Calendar</span>
                <Sparkle size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
