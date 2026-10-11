/**
 * Atlas Demo Communication & Notification Data Layer
 * 
 * CLASSIFICATION: DEMO / DEVELOPMENT DATA
 * Note: Clearly marked demo communication for Atlas Communication Agent MVP.
 */

export const DEMO_ANNOUNCEMENTS = [
  {
    id: 'ann_2026_01',
    title: 'Mid-Semester Examination Schedule Published',
    date: '2026-10-01',
    category: 'Academic',
    department: 'Controller of Examinations',
    summary: 'Mid-term examinations will commence from October 26, 2026. Hall tickets available on the student portal.',
    urgency: 'High'
  },
  {
    id: 'ann_2026_02',
    title: 'Central Library Extended Reading Room Hours',
    date: '2026-09-28',
    category: 'Facility',
    department: 'Library Services',
    summary: 'Central Library reading hall will remain open until midnight (12:00 AM) during exam preparation month.',
    urgency: 'Medium'
  },
  {
    id: 'ann_2026_03',
    title: 'Phase-1 Campus Placement Drive Guidelines',
    date: '2026-09-25',
    category: 'Placement',
    department: 'Training & Placement Office',
    summary: 'All eligible final year students with 0 active backlogs must verify their resume by October 10.',
    urgency: 'High'
  }
]

export const DEMO_NOTIFICATIONS = [
  { id: 'notif_1', text: 'Reminder: Applied GenAI Workshop registration closes October 06.', read: false, time: '2 hours ago' },
  { id: 'notif_2', text: 'Attendance advisory: Keep cumulative attendance above 75% for exam clearance.', read: true, time: '1 day ago' },
  { id: 'notif_3', text: 'Maintenance update: Lab 204 projector servicing scheduled for tomorrow 10 AM.', read: true, time: '2 days ago' }
]

/**
 * Draft a professional campus message/email draft.
 * Returns a confirmation-required payload so no real message is sent without approval.
 */
export function draftCampusMessage({ to, subject, body, actionType = 'campus_inquiry' }) {
  return {
    requiresConfirmation: true,
    action: {
      type: 'communication.send',
      provider: 'campus_mail',
      recipient: to || 'campus-office@campus.edu',
      subject: subject || 'Campus Inquiry',
      body: body || 'Hello, I would like to inquire about...',
      label: `Send message to ${to || 'Campus Office'}`,
      requiresConfirmation: true
    }
  }
}
