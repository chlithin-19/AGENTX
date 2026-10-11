/**
 * Atlas Event Agent
 * 
 * Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md (Section 4 & 5)
 * Data Plan Reference: ATLAS_DATA_ARCHITECTURE_PLAN.md (Section 4.4)
 * 
 * Capabilities:
 * - Upcoming campus events, hackathons, and technical workshops
 * - Event schedule details, dates, and venues
 * - Registration links, eligibility, and deadlines
 */

import { DEMO_EVENTS, getUpcomingEvents, searchDemoEvents } from '../data/demoEvents.js'
import { queryKnowledge } from '../knowledge/retriever.js'

export class EventAgent {
  constructor() {
    this.name = 'event'
    this.description = 'Manages campus events, hackathons, technical workshops, venue schedules, and registration details.'
  }

  canHandle(query) {
    const q = String(query).toLowerCase()
    return /\b(events?|hackathons?|workshops?|fests?|competitions?|fair|upcoming events?|activities|cultural|calendar of events?)\b/i.test(q)
  }

  async execute(task, context = {}) {
    const query = String(task.input?.query || context.message || '').toLowerCase()

    // Sub-intent 1: Specific Hackathon query
    if (/\b(hackathons?|hack)\b/i.test(query)) {
      const hack = DEMO_EVENTS.find(e => e.id === 'evt_hack_2026') || DEMO_EVENTS[0]
      const ragResult = queryKnowledge('hackathon guidelines and team formation', 1)

      return {
        agent: this.name,
        action: 'get_hackathon_details',
        status: 'completed',
        data: hack,
        summary: `### ${hack.title}\n` +
          `- **Dates:** ${hack.date} (${hack.time})\n` +
          `- **Venue:** ${hack.venue}\n` +
          `- **Organizer:** ${hack.organizer}\n` +
          `- **Registration:** ${hack.registrationStatus} (${hack.registeredCount} / ${hack.capacity} slots filled)\n` +
          `- **Deadline:** ${hack.registrationDeadline}\n` +
          `- **Portal Link:** [Event Registration](${hack.registrationLink})\n\n` +
          `**Overview:** ${hack.description}`,
        citations: ragResult.citations
      }
    }

    // Sub-intent 2: AI / Technical Workshop query
    if (/\b(workshop|training|seminar|applied genai)\b/i.test(query)) {
      const ws = DEMO_EVENTS.find(e => e.id === 'evt_ai_workshop') || DEMO_EVENTS[1]

      return {
        agent: this.name,
        action: 'get_workshop_details',
        status: 'completed',
        data: ws,
        summary: `### ${ws.title}\n` +
          `- **Date & Time:** ${ws.date} (${ws.time})\n` +
          `- **Venue:** ${ws.venue}\n` +
          `- **Seats Available:** ${ws.capacity - ws.registeredCount} remaining\n` +
          `- **Link:** [Register Here](${ws.registrationLink})\n\n` +
          `${ws.description}`,
        citations: []
      }
    }

    // Default: List all upcoming campus events
    const events = getUpcomingEvents()
    const ragResult = queryKnowledge('campus events calendar and guidelines', 1)

    return {
      agent: this.name,
      action: 'list_upcoming_events',
      status: 'completed',
      data: events,
      summary: `### Upcoming Campus Events:\n` +
        events.map((e, idx) => 
          `${idx + 1}. **${e.title}** (${e.category})\n` +
          `   - **When:** ${e.date} · ${e.time}\n` +
          `   - **Where:** ${e.venue}\n` +
          `   - **Status:** ${e.registrationStatus} · [Register](${e.registrationLink})`
        ).join('\n\n'),
      citations: ragResult.citations
    }
  }
}

export default new EventAgent()
