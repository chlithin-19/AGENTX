import React, { useState, useEffect } from 'react'
import {
  MegaphoneSimple,
  ShieldCheck,
  Calendar,
  Building,
  Bell,
  ArrowRight,
  FileText
} from '@phosphor-icons/react'

export default function CommunicationView({ onNavigate }) {
  const defaultCirculars = [
    {
      id: 'ann_104',
      number: 'Circular #104',
      title: 'Mid-Semester Examination Schedule & Seating Allotment',
      date: 'October 01, 2026',
      department: 'Controller of Examinations',
      category: 'Academic',
      urgency: 'High Priority',
      summary: 'Mid-term examinations will commence from October 26, 2026. Official hall tickets and exam venue rules available on the portal. No electronic devices permitted.'
    },
    {
      id: 'ann_102',
      number: 'Advisory #102',
      title: 'Central Library Extended Reading Room Hours for Exam Period',
      date: 'September 28, 2026',
      department: 'Library Services',
      category: 'Facilities',
      urgency: 'General Advisory',
      summary: 'Central Library 1st floor reading hall will remain operational until 12:00 AM (Midnight) throughout October. Security badges required after 10:00 PM.'
    },
    {
      id: 'ann_98',
      number: 'Circular #98',
      title: 'Phase-1 Campus Placement Drive Registration & Verification',
      date: 'September 25, 2026',
      department: 'Training & Placement Office',
      category: 'Placement',
      urgency: 'High Priority',
      summary: 'All eligible final year students with 0 active backlogs must verify their placement portal profile by October 10. Resumes must comply with university templates.'
    }
  ]

  const defaultNotifications = [
    { id: 1, text: 'Reminder: Applied GenAI Workshop registration closes October 06.', time: '2 hours ago', unread: true },
    { id: 2, text: 'Attendance advisory: Keep cumulative attendance above 75% for exam hall clearance.', time: '1 day ago', unread: false },
    { id: 3, text: 'Facilities update: Lab 204 hardware servicing completed today.', time: '2 days ago', unread: false }
  ]

  const [circulars, setCirculars] = useState(defaultCirculars)
  const [notifications, setNotifications] = useState(defaultNotifications)

  useEffect(() => {
    fetch('/api/atlas/circulars')
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success' && Array.isArray(json.data)) {
          setCirculars(json.data.map((item, idx) => ({
            id: item.id || `ann_${idx}`,
            number: `Circular #${item.id?.replace(/[^0-9]/g, '') || idx + 100}`,
            title: item.title,
            date: item.date,
            department: item.department,
            category: item.category,
            urgency: item.urgency === 'High' ? 'High Priority' : 'General Advisory',
            summary: item.summary
          })))
          if (Array.isArray(json.notifications)) {
            setNotifications(json.notifications.map((n, i) => ({
              id: n.id || i,
              text: n.text,
              time: n.time || 'Today',
              unread: !n.read
            })))
          }
        }
      })
      .catch(() => {
        // Offline fallback
      })
  }, [])

  return (
    <div className="subview-container">
      {/* Subview Header */}
      <div className="subview-header">
        <div>
          <div className="subview-badge-row">
            <span className="atlas-badge communication">
              <MegaphoneSimple size={14} weight="bold" />
              <span>Official Circulars</span>
            </span>
            <span className="demo-badge-pill">INSTITUTIONAL BROADCAST ENGINE</span>
          </div>
          <h1 className="subview-title">Campus Communications & Announcements</h1>
          <p className="subview-subtitle">
            Authoritative circulars, administrative advisories, and single-use confirmed communication drafts.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Circulars, Right Live Notifications */}
      <div className="comm-content-layout">
        {/* Circulars List */}
        <div className="circulars-column">
          <div className="circulars-list">
            {circulars.map((item) => (
              <div key={item.id} className="scalloped-card circular-card">
                <div className="circular-card-top">
                  <span className="circular-number">{item.number}</span>
                  <div className="circular-pill-group">
                    <span className="category-pill">{item.category}</span>
                    <span className={`urgency-pill ${item.urgency.toLowerCase().includes('high') ? 'high' : 'advisory'}`}>
                      {item.urgency}
                    </span>
                  </div>
                </div>

                <h3 className="circular-title">{item.title}</h3>
                <p className="circular-summary">{item.summary}</p>

                <div className="circular-footer">
                  <div className="circular-info-meta">
                    <span className="info-item">
                      <Building size={14} />
                      <span>{item.department}</span>
                    </span>
                    <span className="info-item">
                      <Calendar size={14} />
                      <span>{item.date}</span>
                    </span>
                  </div>

                  <button
                    className="circular-cite-btn"
                    onClick={() => onNavigate('chat', `Explain the rules and deadlines mentioned in ${item.number} (${item.title})`)}
                  >
                    <span>Inspect Policy</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Notification Feed */}
        <div className="notifications-column">
          <div className="scalloped-card notif-card">
            <div className="notif-card-header">
              <div className="notif-title-row">
                <Bell size={20} className="text-accent" />
                <h3 className="notif-title">Recent Broadcasts</h3>
              </div>
              <span className="notif-count-pill">{notifications.filter(n => n.unread).length} New</span>
            </div>

            <div className="notif-list">
              {notifications.map((n) => (
                <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                  <div className="notif-dot" />
                  <div className="notif-body">
                    <p className="notif-text">{n.text}</p>
                    <span className="notif-time">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="notif-footer-action">
              <button
                className="atlas-pill-btn secondary"
                style={{ width: '100%' }}
                onClick={() => onNavigate('chat', 'Draft a campus inquiry to the Controller of Examinations regarding midterm seating')}
              >
                <span>Draft Campus Inquiry via Atlas</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
