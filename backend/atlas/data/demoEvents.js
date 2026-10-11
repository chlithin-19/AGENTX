/**
 * Atlas Demo Campus Events Data Layer
 * 
 * CLASSIFICATION: DEMO / DEVELOPMENT DATA
 * Note: Clearly marked demo events for Atlas Event Agent MVP.
 */

export const DEMO_EVENTS = [
  {
    id: 'evt_hack_2026',
    title: 'Atlas 36-Hour National Campus Hackathon 2026',
    category: 'Hackathon / Innovation',
    date: 'October 10-12, 2026',
    time: 'Friday 06:00 PM to Sunday 06:00 AM',
    venue: 'Seminar Hall 1 & Computer Lab 204 (Academic Block A)',
    organizer: 'Campus Developer Club & Innovation Cell',
    capacity: 200,
    registeredCount: 145,
    registrationDeadline: 'October 08, 2026',
    registrationStatus: 'Open',
    registrationLink: 'https://campus.edu/events/hackathon2026',
    description: 'A 36-hour multi-track hackathon focusing on AI Agents, Healthcare Tech, and Campus Automation. Prizes worth ₹2,50,000.'
  },
  {
    id: 'evt_ai_workshop',
    title: 'Applied Generative AI & Large Language Models Workshop',
    category: 'Technical Workshop',
    date: 'October 07, 2026',
    time: 'Wednesday 02:00 PM - 05:00 PM',
    venue: 'Computer Center Lab 204',
    organizer: 'Department of Computer Science & Engineering',
    capacity: 60,
    registeredCount: 52,
    registrationDeadline: 'October 06, 2026',
    registrationStatus: 'Filling Fast',
    registrationLink: 'https://campus.edu/events/ai-workshop',
    description: 'Hands-on training session on deploying local small language models and building multi-agent architectures with Ollama and Gemini.'
  },
  {
    id: 'evt_career_fair',
    title: 'Annual Campus Placement & Career Fair 2026',
    category: 'Career / Placement',
    date: 'October 18-19, 2026',
    time: 'Saturday & Sunday 09:00 AM - 05:00 PM',
    venue: 'Student Activity Center (SAC Auditorium & Exhibition Hall)',
    organizer: 'University Training & Placement Cell',
    capacity: 1000,
    registeredCount: 820,
    registrationDeadline: 'October 14, 2026',
    registrationStatus: 'Open',
    registrationLink: 'https://campus.edu/events/careerfair2026',
    description: 'Over 45 technology and engineering firms recruiting final and pre-final year students across software, embedded, and core sectors.'
  },
  {
    id: 'evt_cultural_fest',
    title: 'Echoes 2026 — Annual University Cultural Extravaganza',
    category: 'Cultural & Arts',
    date: 'November 05-07, 2026',
    time: 'Daily 10:00 AM - 09:00 PM',
    venue: 'Open Air Amphitheatre',
    organizer: 'Student Life Committee',
    capacity: 3000,
    registeredCount: 1200,
    registrationDeadline: 'November 01, 2026',
    registrationStatus: 'Open',
    registrationLink: 'https://campus.edu/events/echoes2026',
    description: 'Three days of music, dance, theatrical performances, literary debates, and celebrity artist night.'
  }
]

export function getUpcomingEvents() {
  return DEMO_EVENTS
}

export function searchDemoEvents(query) {
  const q = String(query).toLowerCase()
  return DEMO_EVENTS.filter(e => 
    e.title.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q) ||
    e.venue.toLowerCase().includes(q) ||
    e.description.toLowerCase().includes(q)
  )
}
