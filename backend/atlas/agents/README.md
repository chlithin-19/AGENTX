# Atlas Specialized Agents

**Module Namespace:** `backend/atlas/agents/`  
**Architecture Reference:** `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md` Section 4 & 5

This directory contains the specialized domain agents for the Atlas campus multi-agent system.
As per Phase 2A constraints, no actual agent reasoning or business logic is implemented yet.

## Planned Agents (Future Phases):

1. **Academic Agent (`academic.js`):**
   - Owns attendance analysis, timetable queries, academic records, backlogs, and course performance.
   - Bound to `student_academic_records` and `student_skill_profiles`.
2. **Campus Agent (`campus.js`):**
   - Owns physical infrastructure inquiries, room availability, laboratory lookups, and facility maintenance requests.
   - Bound to `campus_rooms` and `maintenance_requests`.
3. **Communication Agent (`communication.js`):**
   - Owns institutional announcements, student notifications, and helpdesk workflow dispatching.
   - Bound to communication channels and templates.
4. **Event Agent (`event.js`):**
   - Owns campus event planning, venue capacity verification, resource allocation, and event registration requests.
   - Bound to `campus_events` and calendar tools.
