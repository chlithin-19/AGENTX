# Campus Data Schemas

**Module Namespace:** `backend/atlas/campus/schemas/`  
**Architecture Reference:** `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md` Section 13 & `ATLAS_DATA_ARCHITECTURE_PLAN.md` Section 2

This directory contains database DDL definitions, table schemas, and data contracts for the relational campus database.
As per Phase 2A constraints, no database tables or migrations are executed yet.

## Planned Schemas:

- `departments`: Academic branches (`CSE`, `IT`, `ECE`, `EEE`, `Civil`, `Mechanical`).
- `students`: Core student demographic profiles.
- `student_academic_records`: CGPA, attendance percentages, backlogs, study hours.
- `student_skill_profiles`: Coding, aptitude, communication, and mock interview scores.
- `student_portfolio_records`: Projects, internships, hackathons, certifications.
- `student_placement_records`: Placement status and compensation records.
- `campus_rooms`: Classroom and laboratory facility records (future).
- `maintenance_requests`: Facility ticket records (future).
- `campus_events`: Campus event registry and bookings (future).
