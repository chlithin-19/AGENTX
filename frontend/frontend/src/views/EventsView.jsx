import React from 'react'
import {
  CalendarBlank,
  MapPin,
  Clock,
  Users,
  Trophy,
  ArrowRight,
  Sparkle
} from '@phosphor-icons/react'

export default function EventsView({ onNavigate }) {
  const events = [
    {
      id: 'hackathon',
      title: 'Atlas 36-Hour National Campus Hackathon 2026',
      category: 'Hackathon / Innovation',
      date: 'October 10-12, 2026',
      time: 'Fri 06:00 PM – Sun 06:00 AM',
      venue: 'Seminar Hall 1 & Computer Lab 204 (Academic Block A)',
      organizer: 'Campus Developer Club & Innovation Cell',
      status: 'Registration Open',
      capacity: '145 / 200 Registered',
      prize: 'Prizes Worth ₹2,50,000',
      desc: 'Multi-track national hackathon focusing on AI Agents, Healthcare Robotics, and Campus Automation.'
    },
    {
      id: 'ai_workshop',
      title: 'Applied Generative AI & Large Language Models Workshop',
      category: 'Technical Workshop',
      date: 'October 07, 2026',
      time: 'Wed 02:00 PM – 05:00 PM',
      venue: 'Computer Center Lab 204',
      organizer: 'Department of Computer Science & Engineering',
      status: 'Filling Fast',
      capacity: '52 / 60 Registered',
      prize: 'Certificate & API Credits',
      desc: 'Hands-on deployment session with small language models (Gemma 4 / Ollama) and hybrid multi-agent orchestration.'
    },
    {
      id: 'career_fair',
      title: 'Annual Campus Placement & Career Fair 2026',
      category: 'Career & Placement',
      date: 'October 18-19, 2026',
      time: 'Sat & Sun 09:00 AM – 05:00 PM',
      venue: 'Student Activity Center (SAC Auditorium & Exhibition Hall)',
      organizer: 'University Training & Placement Cell',
      status: 'Open',
      capacity: '820 / 1000 Registered',
      prize: '45+ Recruiting Companies',
      desc: 'Tier-1 technology firms recruiting final and pre-final year engineering students across software and core domains.'
    },
    {
      id: 'echoes',
      title: 'Echoes 2026 — Annual University Cultural Fest',
      category: 'Arts & Culture',
      date: 'November 05-07, 2026',
      time: 'Daily 10:00 AM – 09:00 PM',
      venue: 'Open Air Amphitheatre',
      organizer: 'Student Cultural Committee',
      status: 'Upcoming',
      capacity: 'All Campus Welcome',
      prize: 'Inter-College Trophies',
      desc: 'Three-day flagship fest featuring music, drama, digital art exhibitions, and national band performances.'
    }
  ]

  return (
    <div className="subview-container">
      {/* Subview Header */}
      <div className="subview-header">
        <div>
          <div className="subview-badge-row">
            <span className="atlas-badge events">
              <CalendarBlank size={14} weight="bold" />
              <span>Campus Events</span>
            </span>
            <span className="demo-badge-pill">DEMO DATA · CAMPUS EVENTS CALENDAR</span>
          </div>
          <h1 className="subview-title">Campus Events & Hackathons</h1>
          <p className="subview-subtitle">
            Upcoming technical workshops, hackathons, placement fairs, and cultural gatherings.
          </p>
        </div>

        <button
          className="atlas-pill-btn"
          onClick={() => onNavigate('chat', 'Tell me about upcoming campus hackathons and how to register')}
        >
          <span>Ask Atlas About Hackathons</span>
          <ArrowRight size={14} weight="bold" />
        </button>
      </div>

      {/* Events Timeline List */}
      <div className="events-list">
        {events.map((evt) => (
          <div key={evt.id} className="scalloped-card event-card-item">
            <div className="event-date-col">
              <div className="date-badge">
                <span className="date-text">{evt.date.split(',')[0]}</span>
              </div>
              <span className={`event-status-tag ${evt.status === 'Registration Open' ? 'open' : ''}`}>
                {evt.status}
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
              <p className="event-desc">{evt.desc}</p>

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
                  <span>{evt.capacity}</span>
                </div>
              </div>
            </div>

            <div className="event-action-col">
              <button
                className="atlas-pill-btn secondary"
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
