/**
 * Atlas Communication Agent
 * 
 * Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md (Section 4 & 5)
 * Data Plan Reference: ATLAS_DATA_ARCHITECTURE_PLAN.md (Section 4.3)
 * Security Reference: Plan 02-01 (Action Confirmation Lifecycle)
 * 
 * Capabilities:
 * - Institutional announcements & official circulars
 * - Student notifications & priority advisories
 * - Professional campus message & email drafting
 * - Side-effect protection (confirmation-required actions with cryptographic tokens)
 */

import { DEMO_ANNOUNCEMENTS, DEMO_NOTIFICATIONS, draftCampusMessage } from '../data/demoCommunication.js'
import { createConfirmationIntent } from '../security/index.js'

export class CommunicationAgent {
  constructor() {
    this.name = 'communication'
    this.description = 'Manages campus announcements, student notices, broadcast alerts, and professional message drafting.'
  }

  canHandle(query) {
    const q = String(query).toLowerCase()
    return /\b(announcements?|notices?|notifications?|circulars?|draft|send message|email|write an? (email|message)|contact office)\b/i.test(q)
  }

  async execute(task, context = {}) {
    const query = String(task.input?.query || context.message || '').toLowerCase()
    const callingUser = context.user || { id: 1, name: 'Alex Kumar' }

    // Sub-intent 1: Message drafting (e.g., asking about opening hours, faculty inquiry, event inquiry)
    if (/\b(draft|write|compose|send message|ask about|inquire)\b/i.test(query)) {
      const isLibrary = /\b(library|reading room|books?)\b/i.test(query)
      const isExam = /\b(exam|admit card|hall ticket)\b/i.test(query)
      const isMaintenance = /\b(projector|lab|maintenance|repair)\b/i.test(query)

      const recipient = isLibrary 
        ? 'library@campus.edu'
        : isExam 
        ? 'exams@campus.edu'
        : isMaintenance 
        ? 'facilities@campus.edu'
        : 'campus-office@campus.edu'

      const subject = isLibrary 
        ? 'Inquiry Regarding Extended Central Library Operating Hours'
        : isExam 
        ? 'Inquiry Regarding Mid-Semester Examination Schedule'
        : 'Inquiry Regarding Campus Services'

      const draftBody = isLibrary
        ? `Dear Library Administration,\n\nI am an undergraduate student writing to inquire about the current operating hours of the Central Library and whether the ground-floor reading room will remain open extended hours during the upcoming examination weeks.\n\nThank you for your guidance.\n\nSincerely,\n${callingUser.name || 'Alex Kumar'}\nStudent ID: ${callingUser.id || 1}`
        : `Dear Campus Administration,\n\nI am writing to respectfully inquire regarding the schedule and procedures announced for the upcoming semester activities.\n\nThank you.\n\nSincerely,\n${callingUser.name || 'Alex Kumar'}`

      const proposal = {
        to: recipient,
        subject,
        body: draftBody
      }

      const confirmation = createConfirmationIntent({
        userId: callingUser.id || 1,
        actionType: 'communication.draft_broadcast',
        proposal
      })

      const draftResult = draftCampusMessage(proposal)

      return {
        agent: this.name,
        action: 'draft_message',
        status: 'completed',
        data: draftResult,
        confirmation,
        summary: `### Drafted Campus Communication (Approval Required):\n` +
          `- **To:** \`${recipient}\`\n` +
          `- **Subject:** ${subject}\n\n` +
          `\`\`\`text\n${draftBody}\n\`\`\`\n\n` +
          `*Action Guard: Message is held in draft state. Confirmation token: \`${confirmation.confirmationToken.slice(0, 10)}...\`*`,
        actionPayload: { requiresConfirmation: true, confirmationToken: confirmation.confirmationToken, ...draftResult.action },
        citations: []
      }
    }

    // Sub-intent 2: Active student notifications
    if (/\b(notifications?|alerts?|updates? for me)\b/i.test(query)) {
      return {
        agent: this.name,
        action: 'get_notifications',
        status: 'completed',
        data: DEMO_NOTIFICATIONS,
        summary: `### Recent Campus Notifications for You:\n` +
          DEMO_NOTIFICATIONS.map(n => `• [${n.time}] ${n.text}`).join('\n'),
        citations: []
      }
    }

    // Default: Campus broadcast announcements
    return {
      agent: this.name,
      action: 'get_announcements',
      status: 'completed',
      data: DEMO_ANNOUNCEMENTS,
      summary: `### Official Campus Announcements & Circulars:\n` +
        DEMO_ANNOUNCEMENTS.map(a => 
          `• **${a.title}** (${a.date} · ${a.department})\n  ${a.summary} [Priority: ${a.urgency}]`
        ).join('\n\n'),
      citations: []
    }
  }
}

export default new CommunicationAgent()
