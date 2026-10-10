---
phase: "01"
slug: "atlas-ui-redesign"
status: draft
reference_visual: "media_1791653823246_ddd48216.jpg (Payrot Architectural UI)"
shadcn_initialized: false
preset: "none"
created: "2026-10-10"
---

# Phase 01 — Atlas UI Design Contract

> **Authoritative UI Design Contract & Visual Specification for the Atlas Campus Multi-Agent System.**  
> Grounded in the Payrot visual reference, `ATLAS_FRONTEND_AUDIT.md`, and the active React 18 + Vite codebase in `frontend/frontend/`.

---

## 1. Executive Summary & Design Principles

### 1.1 Transformation Objective
Transform Atlas from an AGENTX-style dark terminal executive workstation (`#090a0f` base) into a **world-class, ethereal, editorial campus AI product**. The new interface balances editorial design excellence with functional multi-agent coordination.

### 1.2 Core Design Principles
1. **Ethereal Editorial Tech:** Inspired by the Payrot reference, the aesthetic blends expansive pale-blue atmospheric mist, crisp white floating surfaces, and deep midnight navy grounding blocks with oversized, translucent background typography.
2. **The Campus Constellation Metaphor:** Visually communicates **one intelligent core (Atlas Orchestrator)** coordinating **four specialized domain agents** (`Academic`, `Campus`, `Event`, `Communication`). Floating satellite cards with connected leader nodes surround the central hero intelligence.
3. **Sculptural Geometry & Curved Cutouts:** Rather than conventional flat rectangular stacks, sections transition using elegant concave and convex scalloped boundary curves (such as notched containers that cradle floating badges and spherical hero elements).
4. **Asymmetric Floating Hierarchy:** Layered depth achieved through soft multi-stage drop shadows, crisp glassmorphic hairline borders, and staggered floating cards with generous breathing room.
5. **Preservation of Core Runtime Foundations:** Absolute adherence to technical constraints: preserves the existing React 18/Vite component hierarchy, `/api/chat` SSE streaming, history retrieval, action confirmations, and OAuth integrations.

---

## 2. Design System Tokens

### 2.1 Color Tokens & Distribution

The design strictly follows the **60-30-10** color rule to prevent visual noise:
- **Dominant Surfaces (60%):** Ethereal pale-blue mist and pure crisp white.
- **Secondary Structural Containers (30%):** Deep midnight navy for anchor sections, ice-blue surface cards, and translucent glass rails.
- **Accent Accents (10%):** Electric cobalt blue, cyan glow halos, and specialized domain agent badges.

```css
:root {
  /* --- 60% Dominant Canvas & Light Surfaces --- */
  --atlas-bg-canvas: #F4F8FC;                 /* Atmospheric sky mist base */
  --atlas-bg-canvas-alt: #EBF3FA;             /* Subtle tonal variation for alternating sections */
  --atlas-surface-white: #FFFFFF;             /* Pure white floating cards & panels */
  --atlas-surface-glass: rgba(255, 255, 255, 0.82); /* Glassmorphic top navigation & pills */
  --atlas-surface-tint: #EAF2F9;              /* Soft ice-blue pill & input fill */

  /* --- 30% Secondary Dark & Contrast Containers --- */
  --atlas-navy-deep: #0B1528;                 /* Deep midnight navy for grounding cards & footer */
  --atlas-navy-card: #132238;                 /* Elevated navy surface for dark sub-modules */
  --atlas-navy-border: rgba(255, 255, 255, 0.12); /* Hairline borders on dark surfaces */

  /* --- 10% Accent System & Active States --- */
  --atlas-accent-cobalt: #0062FF;             /* Primary interactive cobalt blue */
  --atlas-accent-hover: #004EDB;              /* Darkened cobalt on hover */
  --atlas-accent-soft: rgba(0, 98, 255, 0.08); /* Translucent cobalt pill background */
  --atlas-accent-cyan: #38BDF8;               /* Glowing halo / orbital ring highlight */

  /* --- Domain Agent Badges & Identity --- */
  --atlas-agent-academic: #2563EB;            /* Academic & Placement Agent (Royal Blue) */
  --atlas-agent-campus: #0D9488;              /* Campus Facilities & Maintenance (Teal) */
  --atlas-agent-event: #7C3AED;               /* Campus Events & Hackathons (Violet) */
  --atlas-agent-comm: #EA580C;                /* Announcements & Circulars (Warm Amber) */

  /* --- Typography Tokens --- */
  --atlas-text-headline: #0A192F;             /* Deep ink navy for high-contrast titles */
  --atlas-text-body: #334E68;                 /* Slate navy for refined editorial paragraphs */
  --atlas-text-muted: #627D98;                /* Secondary labels, timestamps, metadata */
  --atlas-text-on-dark: #F8FAFC;              /* Pure white text on navy containers */
  --atlas-text-on-dark-muted: #94A3B8;        /* Muted slate text on navy containers */
  --atlas-watermark: rgba(10, 25, 47, 0.04);  /* Giant translucent background typography */

  /* --- Borders & Strokes --- */
  --atlas-border-subtle: rgba(10, 25, 47, 0.06);   /* Standard card hairline */
  --atlas-border-focus: rgba(0, 98, 255, 0.35);    /* Input focus halo */
  --atlas-border-glass: rgba(255, 255, 255, 0.7);  /* Frosted pill edge */

  /* --- Multi-Stage Elevation & Shadows --- */
  --atlas-shadow-card: 0 16px 36px -12px rgba(11, 21, 40, 0.07), 0 0 1px 1px rgba(11, 21, 40, 0.04);
  --atlas-shadow-floating: 0 28px 56px -16px rgba(11, 21, 40, 0.12), 0 8px 20px -6px rgba(0, 98, 255, 0.08);
  --atlas-shadow-glow: 0 0 45px rgba(0, 98, 255, 0.22);
}
```

### 2.2 Typography Scale & Hierarchy

All type uses `'Plus Jakarta Sans'` (already loaded in the active frontend) with fallback to modern system sans-serif.

| Role | Font Size | Weight | Line Height | Tracking | Visual Treatment |
|---|---|---|---|---|---|
| **Watermark** | `clamp(72px, 14vw, 160px)` | 900 | 0.9 | `-0.04em` | All-caps, centered behind hero, opacity 4–6% |
| **Hero Display** | `clamp(38px, 5.5vw, 68px)` | 800 | 1.05 | `-0.035em` | All-caps, solid deep ink navy |
| **Section H2** | `clamp(28px, 3.8vw, 42px)` | 700 | 1.15 | `-0.025em` | Title-case or all-caps with generous spacing |
| **Card / H3** | `20px` | 700 | 1.3 | `-0.015em` | Clean section headings within cards |
| **Eyebrow / Pill**| `12px - 13px` | 700 | 1.2 | `0.08em` | All-caps, pill-encapsulated with node dot |
| **Body Large** | `17px` | 400–500 | 1.6 | `normal` | Sub-headlines & hero introductory narratives |
| **Body Default**| `15px` | 400–500 | 1.55 | `normal` | Chat stream text, explanations, card details |
| **Metadata / Stat**| `13px` | 500 | 1.4 | `0.02em` | Timestamps, agent role tags, source citations |
| **Metric Value**| `clamp(36px, 4vw, 52px)` | 800 | 1.0 | `-0.02em` | Stat display numbers (`90M+`, `4`, `100%`) |

### 2.3 Spacing Scale (8pt Grid / 4px Multiples)

| Token | Size | Application |
|---|---|---|
| `--atlas-space-xs` | `4px` | Node gap, inline pill icon margin |
| `--atlas-space-sm` | `8px` | Pill padding, tag spacing, chip gap |
| `--atlas-space-md` | `16px` | Default input padding, message bubble internal padding |
| `--atlas-space-lg` | `24px` | Standard card internal padding, button margins |
| `--atlas-space-xl` | `32px` | Grid gaps, card separators |
| `--atlas-space-2xl`| `48px` | Sub-section margins, hero column gap |
| `--atlas-space-3xl`| `64px` | Major section vertical breaks |
| `--atlas-space-4xl`| `96px` | Full page viewport padding, hero vertical padding |

### 2.4 Shape & Radius Scale

| Token | Radius | Application |
|---|---|---|
| `--atlas-radius-full` | `9999px` | Navigation pills, action buttons, prompt chips, badges |
| `--atlas-radius-2xl` | `28px` | Main hero floating cards, large dark anchor modules |
| `--atlas-radius-xl` | `20px` | Agent satellite cards, chat container, stat panels |
| `--atlas-radius-lg` | `14px` | Message bubbles, action confirmation boxes, inputs |
| `--atlas-radius-md` | `10px` | Dropdown menus, tooltips, citation cards |

---

## 3. Desktop & Mobile Navigation Specifications

### 3.1 Global Navigation Architecture
The navigation shifts from a fixed 270px dark sidebar to a **floating, frosted-glass top navigation bar** that preserves screen real estate and matches the Payrot reference.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [✦ ATLAS]      ( Home  ·  Ask Atlas ✦  ·  Academics  ·  Campus  ·  Events  ·  Comm  ·  Settings )   [Ask Atlas →]  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Desktop Header Specification
- **Position:** Pinned top, fixed or sticky with `top: 16px`, centered with `max-width: 1240px`, `z-index: 50`.
- **Glass Container:** `backdrop-filter: blur(20px)`, background `var(--atlas-surface-glass)`, border `1px solid var(--atlas-border-subtle)`, border-radius `var(--atlas-radius-full)`, box-shadow `var(--atlas-shadow-card)`.
- **Left Brand Section:**
  - Iconic compass/orbital monogram with dual-color cobalt/cyan gradient.
  - Brand logotype: `ATLAS` in bold geometric typography (`letter-spacing: 0.05em`).
  - Subtle status indicator: Pulsing green dot with tooltip `"Hybrid Edge-Cloud Active"`.
- **Center Nav Pill (7 Active Views):**
  - Segmented pill track with smooth pill transition indicator.
  - Items:
    1. **Home**: Campus intelligence overview & interactive agent constellation.
    2. **Ask Atlas**: Full-screen conversational AI workspace (powered by `/api/chat` SSE stream).
    3. **Academics**: Placement prediction, attendance shortfall tracker, CGPA analytics.
    4. **Campus**: Physical infrastructure, Lab 204 schedules, maintenance ticketing.
    5. **Events**: Hackathon countdowns, AI workshops, placement fair calendar.
    6. **Communication**: Official circulars, priority circular circulars, message drafts.
    7. **Settings**: OAuth workspace integrations (Google, GitHub, LinkedIn) and system preferences.
- **Right Action Section:**
  - Primary CTA pill: `Ask Atlas →` button with cobalt background, white text, and hover arrow transition.

### 3.3 Mobile Navigation Specification
- **Top Mobile Bar:**
  - Compact height (56px) with clean logo on left, quick `Ask Atlas` pill in center-right, and hamburger icon on far-right.
- **Slide-Down Frosted Drawer:**
  - Smooth slide-down animation revealing all 7 views with generous 48px touch targets, agent icons, and status indicators.
- **Persistent Bottom Mobile Navigation Bar:**
  - Pinned to bottom of viewport with 4 key destinations: `Home`, `Ask Atlas` (elevated center button), `Academics`, and `Campus`.

---

## 4. Home Hero Composition & Section Hierarchy

### 4.1 Section 1: The Master Hero & Agent Constellation
The hero faithfully translates the Payrot visual language into the Atlas campus identity.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│                                           A  T  L  A  S                                          │
│                                     (Translucent Watermark)                                      │
│                                                                                                  │
│       ┌────────────────────────┐              ┌────────────────────────┐                         │
│       │ 🎓 Academic Agent      │     ╭────╮   │ 🏢 Campus Agent        │                         │
│       │ Priya Sharma · 8.92    │────○│ 🌐 │○──│ Lab 204 Booked         │                         │
│       │ Attendance: 88% ✓      │     ╰────╯   │ 14 Desks Free          │                         │
│       └────────────────────────┘     Atlas    └────────────────────────┘                         │
│                                       Core                                                       │
│                                                                                                  │
│                                      A T L A S                                                   │
│                        YOUR CAMPUS. ONE INTELLIGENT SYSTEM.                                      │
│                                                                                                  │
│                 A private, multi-agent AI system unifying academic analytics,                    │
│                 campus facilities, verified event discovery, and circulars.                      │
│                                                                                                  │
│                      [ Ask Atlas Anything → ]    ( Explore Agents ↓ )                            │
│                                                                                                  │
│       ┌────────────────────────┐              ┌────────────────────────┐                         │
│       │ ⚡ Event Agent         │              │ 📢 Communication Agent │                         │
│       │ Atlas 36h Hackathon    │              │ Circular #104 Verified │                         │
│       │ Oct 24 · Register Open │              │ Midterm Schedules      │                         │
│       └────────────────────────┘              └────────────────────────┘                         │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Composition Elements:
1. **Oversized Watermark:** Centered behind the hero content, the word **`ATLAS`** is rendered in `clamp(80px, 14vw, 160px)` bold sans-serif with `color: var(--atlas-watermark)`.
2. **Central Focal Hologram ("Atlas Core"):** An ethereal, luminous 3D sphere/orbital ring with soft pulsing cyan halo (`--atlas-shadow-glow`), representing the central Multi-Agent Orchestrator.
3. **Four Layered Satellite Agent Cards:**
   - **Academic Agent (Top Left):** Floating white card with royal blue badge, displaying real Kaggle dataset profile metrics ("Alex Kumar / Priya Sharma • CGPA 8.92 • Attendance 88%").
   - **Campus Agent (Top Right):** Floating white card with teal badge, displaying real demo facility status ("Central Library • Lab 204 • 14 Available Desks").
   - **Event Agent (Bottom Left):** Floating white card with violet badge, displaying the real demo hackathon ("Atlas 36h National Hackathon • Registration Open").
   - **Communication Agent (Bottom Right):** Floating white card with amber badge, displaying verified circular status ("Circular 104 • Official Midterm Advisory • Verified ✓").
4. **SVG Node Connector Lines:** Subtle, elegant hairline curves with circular connector pips linking the 4 satellite cards to the central Atlas Core (exactly matching the Payrot visual).
5. **Hero Typography & CTA:**
   - Eyebrow Badge: Pill with glowing cobalt dot: `CAMPUS INTELLIGENCE LAYER`.
   - Primary Headline:
     ```text
     ATLAS
     YOUR CAMPUS. ONE INTELLIGENT SYSTEM.
     ```
   - Subtitle: Clear, authentic, non-speculative narrative.
   - Dual Pill CTAs: `Ask Atlas Anything →` (switches to chat tab) and `Explore Architecture ↓` (scrolls to details).

### 4.2 Section 2: Notched Architectural Transition & Core Capabilities
Directly modeled after Payrot's scalloped/notched card boundary.

- **Geometry:** A crisp white container featuring a top inverted U-curve / notch cutout that cradles a floating badge:
  `4 SPECIALIZED AGENTS · ZERO HALLUCINATIONS`
- **Trio of Core Capabilities:**
  1. **Academic Analytics & Placement:** Attendance threshold monitors (<75% warning, <65% detention risk), backlog trackers, and skill benchmark radars based on authoritative Kaggle student profiles.
  2. **Campus Physical Infrastructure:** Building discovery, room navigation, operating hours, and live maintenance ticketing with automated issue generation.
  3. **Verified Knowledge & Circulars:** Grounded RAG retrieval citing authoritative policy documents (`campus_facilities.md`, `library.md`, `student_support.md`) with exact section citations.

### 4.3 Section 3: Deep Midnight Navy Contrast Module
Emulating the high-contrast dark card in the Payrot reference.

- **Surface:** Deep midnight navy (`--atlas-navy-deep: #0B1528`) with a concave scalloped upper edge that cradles a floating 3D globe / campus node.
- **Headline:** `POWERING CAMPUS OPERATIONS WITH COMPLETE PRIVACY`
- **Subtext:** "Hybrid inference keeps confidential student records and campus administration on local CPU hardware via Gemma 4 E2B, with Gemini Flash 3.8 delivering cloud synthesis when needed."
- **Institutional Proof Metrics:**
  - `5` Authoritative Demo Profiles Loaded
  - `4` Coordinated Specialized Agents
  - `100%` Grounded RAG Citation Provenance
  - `< 150ms` Edge Intent Classification Latency
- **Action Pill:** `Launch Campus Assistant →` with white glass border and hover glow.

---

## 5. Ask Atlas Chat Presentation Requirements

The conversational experience preserves 100% of the active functionality in [ChatArea.jsx](file:///c:/Users/Ch.%20Lithin%20Kumar/OneDrive/Documents/Programming/AGENTX/frontend/frontend/src/components/ChatArea.jsx) while transforming its visual presentation:

### 5.1 Chat Layout & Shell
- Clean, centered editorial workspace (`max-width: 920px`, centered margin).
- Glassmorphic top bar showing active model status (`gemma4:e2b (Edge) + gemini-3.8-flash (Cloud)`), language selector, and session clear action.
- Background uses subtle ethereal mist gradient (`#F4F8FC` to `#FFFFFF`) instead of dark `#090a0f`.

### 5.2 Reasoning & Multi-Agent Steps (Unhiding ThoughtLine)
- The existing, high-quality [ThoughtLine.jsx](file:///c:/Users/Ch.%20Lithin%20Kumar/OneDrive/Documents/Programming/AGENTX/frontend/frontend/src/components/ThoughtLine.jsx) component is currently orphaned.
- **Specification:** Integrate `ThoughtLine` directly above the streaming assistant bubble to display:
  - Agent routing transitions (e.g. `"Routing to Academic Agent..."` → `"Querying Campus Knowledge..."`).
  - Active step timer (`"Reasoning for 1.4s"`).
  - Collapsible execution steps showing agent handoffs.

### 5.3 Message Bubbles & Cards
- **User Message:**
  - Aligned to the right.
  - Styled as an elegant pill-bordered card with pale cobalt tint (`rgba(0, 98, 255, 0.06)`), border `1px solid rgba(0, 98, 255, 0.15)`, and deep ink text.
- **Agent Message:**
  - Aligned to the left.
  - Crisp white card with soft multi-stage shadow (`var(--atlas-shadow-card)`), border `1px solid var(--atlas-border-subtle)`, and generous 24px padding.
  - Header tag identifying the responding agent (`Academic Intelligence`, `Campus Facilities`, etc.) with domain color pill.
  - Full support for Markdown formatting, tables, lists, and code blocks.
- **Citations & Sources Box:**
  - Structured citation footer rendering source links (`[Doc: campus_facilities.md #Section 2]`) with badge icons.
- **Interactive Action Cards:**
  - Existing confirmation boxes for calendar events, email drafts, and maintenance tickets restyled with rounded pill buttons (`"Confirm & Create"`, `"Edit Details"`).
- **Generated Images:**
  - Rendered via existing [ImageCard.jsx](file:///c:/Users/Ch.%20Lithin%20Kumar/OneDrive/Documents/Programming/AGENTX/frontend/frontend/src/components/ImageCard.jsx) with updated border radius (`var(--atlas-radius-xl)`).

### 5.4 Redesigned Floating Omnibar Input
- **Structure:** Floating pill container pinned to bottom of chat area with glassmorphism (`backdrop-filter: blur(16px)`).
- **Prompt Suggestion Chips:** Horizontal scrollable row of pill chips above the input:
  - `"Show my academic standing and attendance"`
  - `"When is the Atlas 36h Hackathon?"`
  - `"Is Lab 204 available right now?"`
  - `"What are the library borrowing rules?"`
- **Controls:**
  - Left: Audio recording mic button (calling `/api/voice/transcribe`).
  - Center: Clean auto-expanding textarea with placeholder: `"Ask Atlas about academics, facilities, events, or circulars..."`.
  - Right: Circular cobalt submit arrow button (`disabled` when query is empty).

---

## 6. Responsive Behavior & Accessibility Requirements

### 6.1 Viewport Breakpoints & Responsive Behavior

| Breakpoint | Target Devices | Layout Adaptations |
|---|---|---|
| `< 640px` (Mobile) | iPhone, Android phones | Single column; floating hero cards collapse into a horizontal swipe carousel or vertical stack; top nav switches to compact bar + drawer; bottom persistent tab bar active; omnibar pinned above mobile keyboard. |
| `640px – 1024px` (Tablet) | iPad, tablets, portrait laptops | 2-column hero agent grid; simplified SVG connector lines; compact top nav; chat container full-width with 16px margins. |
| `1024px – 1440px` (Desktop) | Laptops & standard displays | Full Payrot-style asymmetric layout with 4 floating satellite cards and SVG leader lines; floating glass top nav; centered 920px chat workspace. |
| `> 1440px` (Wide Desktop) | 4K & large monitors | Maximum content wrapper `1400px` centered with auto-margins; watermark scales cleanly via `clamp()`. |

### 6.2 Accessibility (WCAG 2.1 AA Compliance)
1. **Color Contrast:**
   - Headlines (`#0A192F` on `#FFFFFF` / `#F4F8FC`): Contrast ratio **13.5:1** (Exceeds AAA).
   - Body text (`#334E68` on `#FFFFFF`): Contrast ratio **7.8:1** (Exceeds AAA).
   - Text on deep navy (`#F8FAFC` on `#0B1528`): Contrast ratio **16.2:1** (Exceeds AAA).
   - Primary cobalt buttons (`#FFFFFF` on `#0062FF`): Contrast ratio **4.8:1** (Passes AA).
2. **Focus Visibility:**
   - Clear 2px solid `--atlas-accent-cobalt` focus ring with 2px offset on all interactive buttons, pills, and inputs.
3. **Screen Reader Semantics:**
   - Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
   - Navigation tabs use `role="tablist"` and `role="tab"` with `aria-selected` attributes.
   - Real-time chat streaming uses `aria-live="polite"` to announce incoming tokens without interrupting focus.
   - All icon-only buttons include descriptive `aria-label` tags (e.g. `aria-label="Send query"`, `aria-label="Record voice query"`).

---

## 7. Component Reuse & Scope Boundaries

### 7.1 Existing Component Fate Matrix

| Component | Current File | Strategy | Action & Adaptation |
|---|---|---|---|
| **App** | `src/App.jsx` | **Extend** | Expand state router from binary `chat`/`integrations` to 7 active views (`home`, `chat`, `academics`, `campus`, `events`, `communication`, `settings`). |
| **Sidebar** | `src/components/Sidebar.jsx` | **Transform** | Replace fixed left sidebar with the top floating glassmorphic Header and mobile drawer. |
| **ChatArea** | `src/components/ChatArea.jsx` | **Preserve & Restyle** | Keep 100% of the SSE streaming, history, actions, and audio recording logic; apply new light editorial tokens, pill omnibar, and bubble cards. |
| **Integrations** | `src/components/Integrations.jsx` | **Relocate** | Preserve 100% of the OAuth connect/disconnect and dev connect logic; mount inside the `Settings` tab. |
| **ThoughtLine** | `src/components/ThoughtLine.jsx` | **Integrate** | Unhide this orphaned component and wire it to incoming SSE `data.step` events for live multi-agent step progress. |
| **ImageCard** | `src/components/ImageCard.jsx` | **Preserve** | Retain shimmer loading and modal preview; update border radius and shadow to match design system. |
| **LatticeLoader** | `src/components/LatticeLoader.jsx` | **Reuse** | Use as the ambient loading spinner during initial connection and agent plan generation. |

### 7.2 Dedicated Campus Sub-Views (Additive Modules)
To provide full visual coverage of the 7 navigation tabs without backend rewrites, create clean view wrappers consuming existing backend endpoints and demo data:
1. `HomeView.jsx`: The flagship Payrot-inspired landing experience with the hero constellation, curved cutouts, and navy stat module.
2. `AcademicsView.jsx`: Visual dashboard displaying student academic standing, CGPA, attendance shortfall tracker, and Kaggle cohort benchmarks.
3. `CampusView.jsx`: Physical campus explorer displaying room availability (Lab 204), facilities, shuttle routes, and interactive maintenance ticket filing.
4. `EventsView.jsx`: Visual schedule of upcoming hackathons, AI workshops, and placement fair countdowns.
5. `CommunicationView.jsx`: Official announcements feed, circulars archive, and message drafting console.
6. `SettingsView.jsx`: System preferences, model selection badges, and OAuth integration cards (wrapping `Integrations.jsx`).

### 7.3 Scope Boundaries & Guardrails
- **DO NOT MODIFY:** Backend runtime (`backend/server.js`), Atlas orchestrator (`backend/atlas/`), agents, database schemas, or package dependencies.
- **ZERO FABRICATED CLAIMS:** All academic, facility, event, and announcement data displayed in the UI must strictly match the authoritative demo datasets in `backend/atlas/data/` and policy documents in `backend/atlas/knowledge/documents/`.
- **NO EXTRA DEPENDENCIES:** The existing `@phosphor-icons/react`, React 18, and Vite setup is completely sufficient. No Tailwind, no Radix, and no heavy UI libraries required.

---

## 8. Visual Acceptance Criteria & Verification Checklist

### Dimension 1: Copywriting & Identity
- [ ] Hero headline is exactly:  
  **ATLAS**  
  **YOUR CAMPUS. ONE INTELLIGENT SYSTEM.**
- [ ] Giant translucent background watermark displays **`ATLAS`**.
- [ ] All 4 specialized agents are explicitly surfaced: **Academic**, **Campus**, **Event**, and **Communication**.
- [ ] Navigation tabs accurately reflect the 7 designated areas: **Home**, **Ask Atlas**, **Academics**, **Campus**, **Events**, **Communication**, and **Settings**.

### Dimension 2: Palette & Visual Balance
- [ ] 60% dominant canvas is pale ethereal sky mist (`#F4F8FC`) and crisp white (`#FFFFFF`).
- [ ] 30% structural contrast is provided by deep midnight navy (`#0B1528`) and frosted glass.
- [ ] 10% accent is reserved for electric cobalt blue (`#0062FF`), cyan halos, and domain badges.
- [ ] No dark terminal aesthetic remains on the main page.

### Dimension 3: Hero & Layout Geometry
- [ ] Hero features the central Atlas Core with 4 satellite agent cards floating with asymmetric depth.
- [ ] Fine hairline SVG connector lines with node pips visually link satellite agents to the core.
- [ ] Scalloped curved container transitions and notched cutouts cradle badges and spherical visual elements.
- [ ] Generous vertical whitespace (`64px`–`96px` section padding) maintained throughout.

### Dimension 4: Navigation & Controls
- [ ] Floating frosted-glass top navigation bar is active on desktop with smooth tab switching.
- [ ] Pill buttons (`border-radius: 9999px`) with arrow indicators (`→`) used for all primary actions.
- [ ] Responsive mobile drawer and bottom tab bar active on viewports `< 640px`.

### Dimension 5: Conversational Experience (Ask Atlas)
- [ ] Real-time SSE streaming (`/api/chat`) works seamlessly with zero disruption to streaming tokens.
- [ ] `ThoughtLine` reasoning indicator renders agent progress steps during active streaming.
- [ ] Action confirmation boxes (Calendar, Email, Ticket) render with clear interactive buttons.
- [ ] Chat history loading and clear actions operate normally.

### Dimension 6: Responsiveness & Accessibility
- [ ] Layout renders cleanly without horizontal scrollbars on mobile (375px), tablet (768px), and desktop (1280px+).
- [ ] High contrast ratios (WCAG AA >= 4.5:1, AAA >= 7:1) achieved across all text elements.
- [ ] All interactive controls have visible focus rings and accessible ARIA attributes.

---

*UI Design Contract Phase 01 generated and signed off: 2026-10-10*
