---
last_mapped_commit: 5388507e9f3a5d5b9a16089055cce46b10c957a3
last_mapped_at: 2026-10-10
---
# Coding Conventions

**Analysis Date:** 2026-10-10

## Naming Patterns

**Files:**
- JavaScript modules use `camelCase.js` (e.g. `backend/server.js`, `backend/tools.js`, `backend/oauth.js`, `backend/docs.js`, `backend/atlas/knowledge/retriever.js`)
- React components use `PascalCase.jsx` (e.g. `frontend/frontend/src/components/ChatArea.jsx`, `frontend/frontend/src/components/Sidebar.jsx`)
- SQL migration files use prefix sequence numbers and snake_case: `001_initial_student_schema.sql`
- Documentation and planning files use `UPPERCASE.md` or `UPPER_SNAKE_CASE.md` (e.g. `README.md`, `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md`)

**Functions:**
- `camelCase` for standard functions and methods (e.g. `createAtlasRouter`, `routeQuery`, `isAtlasQuery`, `renderPDF`, `ensureGoogleToken`, `logEvent`)
- Async functions explicitly declared `async function ...` or `const func = async (...) => ...`

**Variables:**
- `camelCase` for local variables and instances (e.g. `activeTab`, `setActiveTab`, `agentResults`, `planSteps`)
- `UPPER_SNAKE_CASE` for module-level constants and environment variables (e.g. `APP_BASE`, `DEFAULTS`, `AGENT_REGISTRY`, `DEMO_STUDENT_PROFILES`, `IG_VERIFY`)

**Types:**
- Plain JavaScript / JSDoc annotations; no TypeScript compiler active. Types are documented using JSDoc comments (`@param`, `@returns`).

## Code Style

**Formatting:**
- 2-space indentation throughout JavaScript and JSX
- Semi-colons omitted in several backend modules (`store.js`, `tools.js`, `oauth.js`), while used in `server.js` and `docs.js`
- Single quotes preferred for strings in backend modules and React components
- Object shorthand notation frequently used (e.g. `{ message, user }`, `{ from, subject, date }`)

**Linting:**
- No automated ESLint or Prettier config present in repository root or subfolders
- Clean, consistent indentation maintained manually across files

## Import Organization

**Order:**
1. Node.js built-in modules using `node:` protocol (e.g. `import { readFileSync } from 'node:fs'`, `import { randomBytes } from 'node:crypto'`)
2. External third-party packages (e.g. `import express from 'express'`, `import { GoogleGenAI } from '@google/genai'`)
3. Internal local modules using relative paths with `.js` extensions (e.g. `import { get, save } from './store.js'`, `import academicAgent from '../agents/academic.js'`)

**Path Aliases:**
- Standard relative paths used (`./`, `../`); no path aliases configured in `vite.config.js` or `package.json`

## Error Handling

**Patterns:**
- Try/catch blocks in API routes returning JSON error responses:
  ```javascript
  try {
    const result = await orchestrate({ message, user })
    res.status(200).json(result)
  } catch (err) {
    console.error('[Atlas Orchestrator Error]', err)
    res.status(500).json({
      status: 'error',
      error: 'INTERNAL_ORCHESTRATION_ERROR',
      message: err.message,
      timestamp: new Date().toISOString()
    })
  }
  ```
- Individual agent failure isolation in `backend/atlas/orchestrator/orchestrator.js`:
  Each agent runs within an isolated try/catch so a single agent crash does not fail the entire orchestration plan.
- Fallback defaults for missing files:
  In `backend/store.js`, `load()` falls back to `DEFAULTS()` if `store.json` does not exist or fails to parse.

## Logging

**Framework:**
- `console.log` / `console.error` with subsystem prefixes (e.g. `[Atlas Orchestrator Error]`, `[Atlas Chat Route Error]`)
- Custom persistent event logging via `logEvent(action, detail, level)` in `backend/store.js`, persisting events to `store.json` and viewable via `/logs`.

## Comments

**When to Comment:**
- Header blocks at the start of modules explaining purpose, architectural references (e.g. referencing `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md`), and phase alignment
- Inline comments highlighting architectural trade-offs (e.g. `// ponytail: single JSON file, synchronous writes`) and side-effect guards (`// side-effecting actions stay behind explicit user approval`)

**JSDoc/TSDoc:**
- Used on public module functions (`createAtlasRouter`, `routeQuery`, `orchestrate`) detailing parameters and return shapes.

## Function Design

**Size:**
- Modular functions inside `backend/atlas/` (typically 20-80 lines)
- Large procedural functions inside `backend/server.js` (some request handlers exceed 200 lines)

**Parameters:**
- Destructured options objects preferred for functions with multiple arguments (e.g. `{ message, user }`, `{ q = '', count = 5 } = {}`)

**Return Values:**
- Structured objects with descriptive keys (e.g. `{ status, plan, results, citations, actions, response }`)

## Module Design

**Exports:**
- Named exports alongside a default export containing the module API (e.g. `export { orchestrate, routeQuery, isAtlasQuery }; export default { ... }`)
- Node.js ES Modules (`"type": "module"` in `backend/package.json` and `frontend/frontend/package.json`)

**Barrel Files:**
- `backend/atlas/index.js` acts as a barrel file and router factory for the entire `atlas` subsystem.

---

*Convention analysis: 2026-10-10*
