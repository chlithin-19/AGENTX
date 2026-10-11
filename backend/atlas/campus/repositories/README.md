# Campus Data Repositories

**Module Namespace:** `backend/atlas/campus/repositories/`  
**Architecture Reference:** `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md` Section 9.7 & `ATLAS_DATA_ARCHITECTURE_PLAN.md` Section 9

This directory contains typed service repository modules encapsulating database access.
As per Phase 2A constraints, no database connections or queries are executed yet.

## Planned Repositories:

- `studentRepo.js`: Parameterized queries for student profile lookup, filtered strictly by authenticated identity.
- `academicRepo.js`: Attendance percentages, CGPA, backlogs, and study metrics retrieval.
- `placementRepo.js`: Placement status checks, skill profiles, and aggregated branch benchmarks.
- `facilityRepo.js`: Room availability, laboratory equipment status, and maintenance ticket operations (future).

## Architectural Constraints:
- Repositories enforce user-level data isolation (no client-supplied arbitrary student IDs).
- LLMs never execute raw SQL; they access data strictly through compiled repository methods.
