# Campus Multi-Agent Orchestrator

**Module Namespace:** `backend/atlas/orchestrator/`  
**Architecture Reference:** `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md` Section 9, 10, 11 & 36

This directory contains the central workflow orchestration engine for Atlas.
As per Phase 2A constraints, no workflow state machine or task planning is executed yet.

## Planned Modules:

- `planner.js`: Decomposes high-level campus user intents into a Directed Acyclic Graph (DAG) of discrete tasks.
- `state.js`: Maintains structured `WorkflowState` and `TaskState` with explicit dependencies and status transitions (`pending` → `ready` → `running` → `completed`/`failed`).
- `router.js`: Dispatches ready tasks to specialized agents (Academic, Campus, Communication, Event) using typed JSON handoff payloads.
- `results.js`: Aggregates intermediate agent results and synthesizes the verified final response.
