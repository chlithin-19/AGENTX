import React, { useState } from 'react'
import {
  Buildings,
  Desktop,
  BookOpen,
  Coffee,
  Barbell,
  FirstAid,
  Wrench,
  CheckCircle,
  ArrowRight,
  Clock,
  MapPin
} from '@phosphor-icons/react'

export default function CampusView({ onNavigate }) {
  const [ticketSubmitted, setTicketSubmitted] = useState(false)
  const [ticketRoom, setTicketRoom] = useState('Lab 204')
  const [ticketIssue, setTicketIssue] = useState('Projector HDMI connection intermittent')

  const facilities = [
    {
      id: 'lab_204',
      name: 'Computer Center Lab 204',
      location: 'Academic Block A · 2nd Floor',
      status: 'Open · 14 Desks Available',
      statusType: 'available',
      timings: '8:00 AM - 8:30 PM',
      icon: Desktop,
      specs: '60 Dell Workstations, Gigabit Ethernet, HD Ceiling Projector'
    },
    {
      id: 'central_lib',
      name: 'Central Library',
      location: 'Central Library Building · Ground & 1st Floor',
      status: 'Quiet Hours Active',
      statusType: 'active',
      timings: '8:00 AM - 10:00 PM (Daily)',
      icon: BookOpen,
      specs: 'Borrowing: 4 books for 14 days, IEEE/ACM Digital Access, 200 Study Desks'
    },
    {
      id: 'sac_sports',
      name: 'Sports & Fitness Center',
      location: 'Student Activity Center (SAC)',
      status: 'Open',
      statusType: 'available',
      timings: '6:00 AM - 9:00 AM & 4:30 PM - 8:30 PM',
      icon: Barbell,
      specs: 'Gymnasium, Badminton Courts, Table Tennis, Outdoor Sports Field'
    },
    {
      id: 'campus_cafe',
      name: 'Campus Food Court & Cafeteria',
      location: 'Ground Floor · SAC Building',
      status: 'Open',
      statusType: 'available',
      timings: '7:30 AM - 9:30 PM',
      icon: Coffee,
      specs: 'Multi-cuisine meals, Healthy Juice Bar, Digital payment enabled'
    },
    {
      id: 'health_center',
      name: 'Campus Health Center',
      location: 'Science Block · Ground Floor',
      status: '24/7 Emergency Active',
      statusType: 'emergency',
      timings: '24/7 Emergency; Outpatient 9:00 AM - 5:00 PM',
      icon: FirstAid,
      specs: 'Resident Medical Officer, First Aid Triage, On-call Ambulance'
    }
  ]

  const handleTicketSubmit = (e) => {
    e.preventDefault()
    setTicketSubmitted(true)
    setTimeout(() => setTicketSubmitted(false), 5000)
  }

  return (
    <div className="subview-container">
      {/* Subview Header */}
      <div className="subview-header">
        <div>
          <div className="subview-badge-row">
            <span className="atlas-badge campus">
              <Buildings size={14} weight="bold" />
              <span>Campus Facilities</span>
            </span>
            <span className="demo-badge-pill">DEMO DATA · CAMPUS INFRASTRUCTURE</span>
          </div>
          <h1 className="subview-title">Facilities & Physical Infrastructure</h1>
          <p className="subview-subtitle">
            Live lab desk availability, facility operating schedules, and direct maintenance dispatch.
          </p>
        </div>

        <button
          className="atlas-pill-btn"
          onClick={() => onNavigate('chat', 'Is Lab 204 available right now and what are the library hours?')}
        >
          <span>Ask Atlas for Lab Status</span>
          <ArrowRight size={14} weight="bold" />
        </button>
      </div>

      {/* Facilities Grid */}
      <div className="facilities-grid">
        {facilities.map((fac) => {
          const IconComp = fac.icon
          return (
            <div key={fac.id} className="scalloped-card facility-card">
              <div className="facility-card-header">
                <div className="facility-icon-wrap">
                  <IconComp size={24} weight="duotone" />
                </div>
                <span className={`facility-status-pill ${fac.statusType}`}>
                  {fac.status}
                </span>
              </div>
              <h3 className="facility-title">{fac.name}</h3>
              <div className="facility-meta">
                <div className="meta-row">
                  <MapPin size={14} />
                  <span>{fac.location}</span>
                </div>
                <div className="meta-row">
                  <Clock size={14} />
                  <span>{fac.timings}</span>
                </div>
              </div>
              <p className="facility-specs">{fac.specs}</p>
            </div>
          )
        })}
      </div>

      {/* Maintenance Ticketing Box */}
      <div className="scalloped-card maintenance-panel">
        <div className="maintenance-header">
          <div>
            <span className="atlas-badge" style={{ marginBottom: '8px' }}>
              <Wrench size={14} />
              <span>Facilities Dispatch</span>
            </span>
            <h2 className="panel-title">Report a Campus Issue</h2>
            <p className="panel-desc">
              Submit maintenance tickets directly to campus facility coordinators via the Atlas Agent network.
            </p>
          </div>
        </div>

        {ticketSubmitted ? (
          <div className="ticket-success-alert">
            <CheckCircle size={24} weight="fill" className="text-success" />
            <div>
              <strong>Ticket #FACS-2026-88 Logged Successfully</strong>
              <p>Campus facilities operations dispatched to {ticketRoom}. Estimated resolution: 4 hours.</p>
            </div>
          </div>
        ) : (
          <form className="maintenance-form" onSubmit={handleTicketSubmit}>
            <div className="form-group">
              <label htmlFor="room-input">Room / Location</label>
              <input
                id="room-input"
                className="atlas-input"
                value={ticketRoom}
                onChange={(e) => setTicketRoom(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="issue-input">Issue Description</label>
              <input
                id="issue-input"
                className="atlas-input"
                value={ticketIssue}
                onChange={(e) => setTicketIssue(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="atlas-pill-btn secondary" style={{ alignSelf: 'flex-start' }}>
              Log Maintenance Request
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
