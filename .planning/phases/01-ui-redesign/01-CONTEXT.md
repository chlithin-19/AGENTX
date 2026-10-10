# Phase 01: ui-redesign - Context

**Gathered:** 2026-10-11  
**Status:** Ready for planning  

<domain>
## Phase Boundary

Phase 01 establishes the foundational frontend application shell, top floating navigation, and core visual redesign for the Atlas Campus Multi-Agent System in `frontend/frontend/`.

- **In Scope:**
  - Premium Atlas application shell in `frontend/frontend/`.
  - Responsive global navigation supporting all 7 destinations: Home, Ask Atlas, Academics, Campus, Events, Communication, and Settings.
  - Polished Home landing experience faithfully translating the Payrot visual language and locked design contract (`01-UI-SPEC.md`).
  - Functional navigation between all seven destinations with cohesive, styled placeholders for modules not yet implemented.
  - Seamless embedding of the existing Ask Atlas chat workspace and external Integrations within the new shell.
  - Integration of `ThoughtLine.jsx` for real-time agent execution progress.
  - Comprehensive desktop, tablet, and mobile responsiveness with zero horizontal overflow.
- **Out of Scope (Deferred):**
  - Full functional workflows for Academics, Campus, Events, or Communication (deferred to dedicated subsequent phases).
  - Backend modifications, API contract alterations, or database schema changes.
  - Introducing additional npm dependencies or state libraries.

</domain>

<decisions>
## Implementation Decisions

### 1. Design Direction & Aesthetic Tokens
- **D-01: Ethereal Editorial Tech Identity** — Strictly implement the design contract specified in `.planning/phases/01-ui-redesign/01-UI-SPEC.md`. Maintain the Payrot architectural aesthetic: pale sky mist canvas (`#F4F8FC`), pure crisp white cards (`#FFFFFF`), deep midnight navy grounding blocks (`#0B1528`), and electric cobalt accents (`#0062FF`). — **Reversibility:** costly — Visual foundation governs all future views.
- **D-02: Hero Constellation Composition** — Render the central glowing Atlas Core focal point linked to four satellite agent cards (Academic, Campus, Event, Communication) using hairline SVG leader lines with circular connector pips. Preserve the giant translucent background `ATLAS` watermark (`rgba(10, 25, 47, 0.04)`). — **Reversibility:** reversible — Component-local layout and styling.
- **D-03: Sculptural Curved Geometry** — Implement concave and convex scalloped boundary transitions (e.g. notched top cards cradling floating badges) without breaking standard CSS box-sizing. — **Reversibility:** reversible.

### 2. Navigation & View Routing Architecture
- **D-04: Floating Frosted-Glass Global Navigation** — Replace the legacy 270px dark sidebar with a floating top frosted-glass navigation bar (`backdrop-filter: blur(20px)`, `border-radius: 9999px`) on desktop and a compact header with slide-down drawer and persistent bottom bar on mobile (< 640px). — **Reversibility:** costly — Affects top-level shell layout across all views.
- **D-05: Zero-Dependency View Switching** — Implement the 7-destination view router in `App.jsx` using React state coupled to browser History API (`window.history.pushState` / `popstate`) without installing `react-router-dom` or additional routing packages. Maintain instant zero-latency view switching. — **Reversibility:** reversible.
- **D-06: Placeholder Sub-Views** — Provide visually consistent, editorial sub-view components for Academics, Campus, Events, Communication, and Settings that cleanly present available demo metrics, upcoming feature roadmaps, and contextual prompt triggers into Ask Atlas. — **Reversibility:** reversible.

### 3. Preserving Runtime & Technical Constraints
- **D-07: Zero Backend / API Changes** — Make zero changes to `backend/server.js`, `backend/atlas/`, database migrations, or API contracts. The existing `/api/chat` SSE protocol, history endpoints, actions, and OAuth connectors must remain 100% operational. — **Reversibility:** one-way — Altering backend contracts breaks existing AGENTX capabilities and production deployments.
- **D-08: Zero Additional npm Dependencies** — Retain existing package setup in `frontend/frontend/package.json` (`react`, `react-dom`, `@phosphor-icons/react`, `vite`). Do not add Tailwind, Radix, Lucide, or external UI component suites. All styling must be authored in Vanilla CSS variables and utility classes. — **Reversibility:** costly — Adding dependencies increases bundle size and complicates build toolchains.
- **D-09: Single Authoritative Frontend Root** — Confine all frontend implementation strictly to `frontend/frontend/`. Do not edit legacy shell scripts or files in the parent `frontend/` directory. — **Reversibility:** reversible.

### 4. Chat & Agent Reasoning Visibility
- **D-10: Reuse Existing ChatArea & Integrations** — Embed the existing 631-line `ChatArea.jsx` into the "Ask Atlas" tab, preserving its full streaming reader, image parser, language selector, and action confirmation logic. Relocate `Integrations.jsx` into the "Settings" tab. — **Reversibility:** reversible.
- **D-11: Truthful Agent Execution Progress** — Wire `ThoughtLine.jsx` to render active multi-agent execution steps based solely on genuine backend events (e.g. `data.step: "Routing to Atlas Campus Multi-Agent System"`). Do not fabricate simulated reasoning events or expose private internal thought traces. — **Reversibility:** reversible.

### 5. Data Integrity, Accessibility & Quality Gates
- **D-12: Honest Demo Data Labeling** — Display real data from `backend/atlas/data/demoStudents.js`, `demoCampus.js`, `demoEvents.js`, and `demoCommunication.js`. Explicitly tag demo data with visible indicators; never fabricate imaginary student metrics or institutional policies. — **Reversibility:** reversible.
- **D-13: WCAG 2.1 AA Compliance Target** — Enforce contrast ratios exceeding 4.5:1 (minimum) and 7:1 for headers. Ensure keyboard navigability (visible 2px cobalt focus halos), semantic HTML landmarks, and mobile viewport adaptability across 375px, 768px, and 1280px+. — **Reversibility:** reversible.
- **D-14: Verification Gates** — Every implementation phase must verify: (1) `npm run build` exits 0 with clean bundling, (2) chat streaming works interactively, (3) all 7 tabs navigate cleanly, and (4) `git diff` confirms zero changes to backend or runtime files. — **Reversibility:** reversible.

### the agent's Discretion
- Exact CSS class naming conventions and structural breakdown between `index.css`, `App.css`, and view-specific stylesheets.
- Icon assignments from `@phosphor-icons/react` for the new navigation items and domain cards.
- Subtle micro-animations, hover transitions, and timing functions for the frosted-glass drawer and satellite card elevation.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design & Architecture Specifications
- `.planning/phases/01-ui-redesign/01-UI-SPEC.md` — Authoritative UI design contract, tokens, layout geometry, and acceptance criteria.
- `ATLAS_FRONTEND_AUDIT.md` — Complete frontend codebase inventory, active component analysis, and API registry.
- `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md` — Comprehensive system architecture for Atlas Campus multi-agent platform.
- `ATLAS_MVP_IMPLEMENTATION.md` — Operational MVP report detailing multi-agent backend and demo datasets.

### Frontend Active Codebase
- `frontend/frontend/src/App.jsx` — Active root component and tab state controller.
- `frontend/frontend/src/index.css` — Active design tokens and global reset styles.
- `frontend/frontend/src/App.css` — Active styling rules for sidebar, chat, and action components.
- `frontend/frontend/src/components/Sidebar.jsx` — Current navigation rail to be replaced by the top floating nav.
- `frontend/frontend/src/components/ChatArea.jsx` — Core chat workspace, SSE stream reader, and action executor.
- `frontend/frontend/src/components/Integrations.jsx` — OAuth integration management component.
- `frontend/frontend/src/components/ThoughtLine.jsx` — Orphaned reasoning step progress component to be integrated.
- `frontend/frontend/src/components/ImageCard.jsx` — Multimodal image generator card with shimmer loading.

### Backend Interfaces & Data Source Anchors
- `backend/server.js` — Core Express server (`POST /api/chat`, `GET /api/history`, `GET /api/integrations`).
- `backend/atlas/index.js` — Atlas router (`POST /api/atlas/orchestrate`, `GET /api/atlas/status`).
- `backend/atlas/data/demoStudents.js` — Authoritative student placement demo data (Alex Kumar, Priya Sharma).
- `backend/atlas/data/demoCampus.js` — Authoritative campus facilities, buildings, and maintenance tickets demo data.
- `backend/atlas/data/demoEvents.js` — Authoritative campus events and hackathon schedule demo data.
- `backend/atlas/data/demoCommunication.js` — Authoritative campus circulars and announcements demo data.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/frontend/src/components/ChatArea.jsx`: Complete SSE stream reader, markdown image parser, language selector (11 languages), Autopilot toggle, and interactive action buttons.
- `frontend/frontend/src/components/Integrations.jsx`: Working OAuth connect/disconnect and instant dev connect modal.
- `frontend/frontend/src/components/ThoughtLine.jsx`: High-quality reasoning timer, collapsible step accordion, and breathing animation.
- `frontend/frontend/src/components/ImageCard.jsx`: Robust image preview with skeleton shimmer and full-res link.
- `frontend/frontend/src/components/LatticeLoader.jsx`: 3x3 matrix lattice spinner for ambient loading.
- `@phosphor-icons/react`: Icon library already installed with extensive icon coverage.

### Established Patterns
- Pure Vanilla CSS design tokens declared in `:root` with CSS custom properties.
- React 18 functional components with local state and clean hook patterns.
- Vite build pipeline targeting `/dist` with proxy configuration forwarding `/api` to `http://localhost:8080`.

### Integration Points
- `frontend/frontend/src/App.jsx`: Top-level mount where new floating navigation and 7-destination view switching reside.
- `frontend/frontend/src/components/ChatArea.jsx`: Connected to `/api/chat` via fetch and TextDecoder stream.
- `frontend/frontend/src/components/Integrations.jsx`: Connected to `/api/integrations` and `/api/oauth/*`.

</code_context>

<specifics>
## Specific Ideas

- **Visual Inspiration:** Payrot Architectural UI reference (`media_1791653823246_ddd48216.jpg`). Ethereal pale-sky mist backdrop, crisp floating white cards, deep midnight navy grounding modules, and oversized watermark typography.
- **Hero Constellation:** Floating white cards with royal blue (Academic), teal (Campus), violet (Event), and warm amber (Communication) badges connected to the central pulsing Atlas Core via fine hairline SVG lines.
- **Scalloped Cutouts:** Elegant notched container geometry cradling badges like `4 SPECIALIZED AGENTS · ZERO HALLUCINATIONS`.
- **Top Navigation:** Frosted-glass pill container pinned to top (`max-width: 1240px`) with segmented pill track and cobalt primary action CTA (`Ask Atlas →`).

</specifics>

<deferred>
## Deferred Ideas

- **Phase 02 (Academics):** Deep interactive CGPA forecast calculator, subject-level attendance drill-downs, and personalized placement improvement roadmaps.
- **Phase 03 (Campus & Facilities):** Interactive campus map, 3D building exploration, live desk availability sensors, and maintenance ticket tracking lifecycle.
- **Phase 04 (Events & Workshops):** Live hackathon team formation, automated calendar sync push, and workshop ticket generation.
- **Phase 05 (Communication & Circulars):** Broadcast push notifications, automated institutional announcement drafting with approval workflow, and student grievance portal.

</deferred>

---

*Phase: 01-ui-redesign*  
*Context gathered: 2026-10-11*  
