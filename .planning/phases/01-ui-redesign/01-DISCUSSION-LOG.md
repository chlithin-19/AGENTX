# Phase 01: ui-redesign - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-11  
**Phase:** 01-ui-redesign  
**Areas discussed:** Design direction, Phase scope, Preserving existing functionality, Chat and agent progress, Data integrity, Responsive design and accessibility, Implementation and verification preferences  

---

## 1. Design Direction & Aesthetic Tokens

| Option | Description | Selected |
|---|---|---|
| Ethereal Editorial Tech (Payrot Reference) | Pale sky mist `#F4F8FC`, crisp white cards `#FFFFFF`, deep midnight navy `#0B1528`, electric cobalt `#0062FF`, oversized ATLAS watermark, central glowing core, 4 satellite cards with hairline SVG connectors, sculptural transitions | ✓ |
| Retain Dark Terminal Workstation | Keep `#090a0f` background and dark executive workstation styling | |
| Generic SaaS Modern Flat | Standard dashboard grid with rectangular containers and generic slate palette | |

**User's choice:** Ethereal Editorial Tech (strictly aligned with `01-UI-SPEC.md` and Payrot visual reference).  
**Notes:** Do not replace the agreed design with a generic SaaS dashboard or invent a competing design system.

---

## 2. Phase Scope & Destinations

| Option | Description | Selected |
|---|---|---|
| Complete 7-Destination Shell + Polished Home | Implement premium shell, responsive nav for Home, Ask Atlas, Academics, Campus, Events, Communication, and Settings; polished Payrot-style Home; styled placeholders for future domain modules; preserved chat and integrations | ✓ |
| Single-Page Landing Only | Redesign only the Home page and leave other views unlinked | |
| Full Implementation of All 7 Domains | Attempt to build full academic analysis, maintenance forms, and circular feeds in Phase 1 | |

**User's choice:** Complete 7-Destination Shell + Polished Home.  
**Notes:** Do not implement complete academic, campus, event, or communication workflows in this phase.

---

## 3. Preserving Existing Functionality

| Option | Description | Selected |
|---|---|---|
| Strict Preservation of React/Vite + Backend | Preserve existing React/Vite app, `/api/chat` SSE, history, actions, attachments, error handling, orchestrator, OAuth, and backend runtime. Zero backend edits, zero extra dependencies | ✓ |
| Full Rewrite / Refactor | Restructure backend endpoints and install new UI component libraries | |

**User's choice:** Strict preservation of existing runtime and zero backend modifications.  
**Notes:** Do not install additional npm dependencies. Do not replace functional components with mock implementations.

---

## 4. Chat and Agent Progress

| Option | Description | Selected |
|---|---|---|
| Reuse ChatArea + ThoughtLine for Real Events | Reuse existing ChatArea and Integrations components. Unhide and connect ThoughtLine to present genuine execution progress based on actual backend events | ✓ |
| Simulated / Fabricated Thought Traces | Generate mock reasoning steps or fake agent handoffs | |

**User's choice:** Reuse ChatArea and ThoughtLine for real events only.  
**Notes:** Show useful progress such as agent routing or task completion when supported. Do not invent execution events or expose private internal reasoning.

---

## 5. Responsive Design & Accessibility

| Option | Description | Selected |
|---|---|---|
| Multi-Breakpoint + WCAG 2.1 AA Target | Support desktop, laptop, tablet, and mobile. Zero horizontal overflow, functional mobile navigation, keyboard accessible, visible focus rings, appropriate contrast, reduced motion support | ✓ |
| Desktop Only | Optimize for 1280px+ and defer mobile layout | |

**User's choice:** Multi-Breakpoint responsive design with WCAG 2.1 AA verification target.  

---

## the agent's Discretion

- Breakdown of CSS classes and module structures across `index.css`, `App.css`, and view components.
- Specific Phosphor icon mappings for new navigation items.
- Micro-interactions, hover states, and smooth transition curves.

## Deferred Ideas

- Full functional workflows and deep interactive widgets for Academics, Campus Facilities, Events, and Communication (deferred to Phases 2–5).
