/**
 * Atlas Campus Agent
 * 
 * Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md (Section 4 & 5)
 * Data Plan Reference: ATLAS_DATA_ARCHITECTURE_PLAN.md (Section 4.2)
 * Security Reference: Plan 02-01 (Action Confirmation Lifecycle)
 * 
 * Capabilities:
 * - Campus facilities overview and operating hours (Library, Sports Complex, Cafeteria, Health Center)
 * - Building and room locations (Academic Block A/B, Lab 204, Seminar Hall 1)
 * - Classroom and laboratory maintenance reporting (ticketing workflow with confirmation)
 * - Campus services (IT Helpdesk, Shuttle Transport, Academic Section)
 */

import { 
  DEMO_BUILDINGS, 
  DEMO_ROOMS, 
  DEMO_FACILITIES, 
  DEMO_CAMPUS_SERVICES,
  DEMO_MAINTENANCE_TICKETS,
  createDemoMaintenanceTicket 
} from '../data/demoCampus.js'
import { queryKnowledge } from '../knowledge/retriever.js'
import { createConfirmationIntent } from '../security/index.js'

export class CampusAgent {
  constructor() {
    this.name = 'campus'
    this.description = 'Manages campus physical infrastructure, room navigation, facilities, services, and maintenance work orders.'
  }

  canHandle(query) {
    const q = String(query).toLowerCase()
    return /\b(facilities|facility|library|building|room|lab 204|classroom|maintenance|broken|repair|projector|shuttle|transport|health center|cafeteria|sports|campus services?)\b/i.test(q)
  }

  async execute(task, context = {}) {
    const query = String(task.input?.query || context.message || '').toLowerCase()
    const callingUser = context.user || { id: 1, name: 'Alex Kumar' }

    // Sub-intent 1: Maintenance issue reporting (Protected Action)
    if (/\b(report|broken|repair|fix|not working|maintenance issue|malfunction)\b/i.test(query)) {
      const locationMatch = query.match(/\b(lab\s*204|room\s*\d+|seminar\s*hall\s*\d+|library|cafeteria)\b/i)
      const location = locationMatch ? locationMatch[0].toUpperCase() : 'Lab 204'
      const issue = task.input?.issue || query.replace(/^(please\s+)?(report|create|fix)\s+/i, '').trim() || 'Classroom maintenance issue reported'

      const proposal = {
        location,
        issue,
        priority: 'Medium',
        reportedBy: callingUser.name || 'Alex Kumar'
      }

      // Generate server-side confirmation intent
      const confirmation = createConfirmationIntent({
        userId: callingUser.id || 1,
        actionType: 'campus.create_maintenance_ticket',
        proposal
      })

      const ticket = createDemoMaintenanceTicket(proposal)

      return {
        agent: this.name,
        action: 'create_maintenance_request',
        status: 'completed',
        data: ticket,
        confirmation,
        actionPayload: {
          type: 'campus.create_maintenance_ticket',
          actionType: 'campus.create_maintenance_ticket',
          confirmationToken: confirmation.confirmationToken,
          proposal,
          requiresConfirmation: true,
          label: `Submit Maintenance Request for ${location}`
        },
        summary: `### Maintenance Request Submitted (Demo Proposal):\n` +
          `- **Ticket ID:** \`${ticket.id}\`\n` +
          `- **Location:** ${ticket.location}\n` +
          `- **Category:** ${ticket.category}\n` +
          `- **Status:** ${ticket.status}\n` +
          `- **Assigned Unit:** ${ticket.assignedTo}\n\n` +
          `*Action Guard: Confirmation token \`${confirmation.confirmationToken.slice(0, 10)}...\` generated.*`,
        citations: []
      }
    }

    // Sub-intent 2: Library specific lookup
    if (/\b(library|reading room|books?|borrow)\b/i.test(query)) {
      const lib = DEMO_FACILITIES.find(f => f.id === 'fac_library')
      const ragResult = queryKnowledge('library operating hours and borrowing rules', 1)

      return {
        agent: this.name,
        action: 'get_library_info',
        status: 'completed',
        data: lib,
        summary: `### Central Library Information:\n` +
          `- **Location:** ${lib.location}\n` +
          `- **Operating Hours:** ${lib.timings}\n` +
          `- **Available Services:**\n  ${lib.services.map(s => '• ' + s).join('\n  ')}\n\n` +
          `*Note: Extended reading room hours (until 12:00 AM Midnight) are active during examination months.*`,
        citations: ragResult.citations
      }
    }

    // Sub-intent 3: Specific room / laboratory location
    if (/\b(where is|location of|locate|lab 204|room \d+|seminar hall)\b/i.test(query)) {
      const rm = DEMO_ROOMS.find(r => query.includes(r.name.toLowerCase()) || (query.includes('204') && r.id === 'room_lab_204')) || DEMO_ROOMS[0]

      return {
        agent: this.name,
        action: 'get_room_location',
        status: 'completed',
        data: rm,
        summary: `### Room Location: ${rm.name}\n` +
          `- **Building:** ${rm.buildingName} (Floor ${rm.floor})\n` +
          `- **Facility Type:** ${rm.type} (Capacity: ${rm.capacity} seats)\n` +
          `- **Status:** ${rm.status}\n` +
          `- **Key Equipment:** ${rm.equipment.join(', ')}`,
        citations: []
      }
    }

    // Sub-intent 4: Campus services inquiry
    if (/\b(campus services?|shuttle|transport|health center|helpdesk|medical)\b/i.test(query)) {
      const ragResult = queryKnowledge('campus services transport and health center', 2)
      return {
        agent: this.name,
        action: 'get_campus_services',
        status: 'completed',
        data: DEMO_CAMPUS_SERVICES,
        summary: `### Key Campus Services & Support Units:\n` +
          DEMO_CAMPUS_SERVICES.map(s => `• **${s.name}**\n  - Location: ${s.location} | Hours: ${s.hours}\n  - Contact: \`${s.contact}\``).join('\n'),
        citations: ragResult.citations
      }
    }

    // Default: Campus facilities directory
    const ragResult = queryKnowledge('campus facilities sports library cafeteria', 2)
    return {
      agent: this.name,
      action: 'get_campus_facilities',
      status: 'completed',
      data: DEMO_FACILITIES,
      summary: `### Key Campus Facilities Available:\n` +
        DEMO_FACILITIES.map(f => `• **${f.name}**\n  - Location: ${f.location}\n  - Hours: ${f.timings}`).join('\n'),
      citations: ragResult.citations
    }
  }
}

export default new CampusAgent()
