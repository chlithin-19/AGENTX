---
last_mapped_commit: 5388507e9f3a5d5b9a16089055cce46b10c957a3
last_mapped_at: 2026-10-10
---
# Testing Patterns

**Analysis Date:** 2026-10-10

## Test Framework

**Runner:**
- None detected - Neither `backend/package.json` nor `frontend/frontend/package.json` defines a test script or dependencies for test runners like Vitest, Jest, Mocha, or Playwright.
- Config: None present (no test configuration files found in root or project packages).

**Assertion Library:**
- None detected

**Run Commands:**

```bash

# Current state: No test command exists in package.json

# Recommended addition:

# npm test

```

## Test File Organization

**Location:**
- Currently, zero test files (`*.test.js`, `*.spec.js`, `*.test.jsx`) exist within the repository outside of third-party `node_modules/`.

**Recommended Structure:**

```
backend/
├── test/
│   ├── unit/
│   │   ├── academicAgent.test.js
│   │   ├── campusAgent.test.js
│   │   ├── retriever.test.js
│   │   └── orchestrator.test.js
│   └── integration/
│       ├── api.test.js
│       └── oauth.test.js
frontend/frontend/
└── src/
    └── components/
        └── __tests__/
            └── ChatArea.test.jsx
```

## Test Structure

**Suite Organization:**
- Currently not implemented. Recommended pattern using modern Vitest or Node.js native test runner (`node:test`):

```javascript
import { test, describe } from 'node:test'
import assert from 'node:assert'
import { routeQuery, isAtlasQuery } from '../../atlas/orchestrator/orchestrator.js'

describe('Atlas Orchestrator Routing', () => {
  test('detects academic queries correctly', () => {
    assert.strictEqual(isAtlasQuery('Check my attendance and CGPA'), true)
    const routes = routeQuery('Check my attendance and CGPA')
    assert.deepStrictEqual(routes, ['academic'])
  })
})
```

## Mocking

**Framework:**
- None installed.

**Recommended Mocking Targets:**
- Google Gemini API calls (`@google/genai`) to prevent external quota consumption during tests
- Ollama endpoint calls (`http://127.0.0.1:11434`)
- Google Workspace OAuth and Gmail/Calendar API network requests (`backend/tools.js`)
- Filesystem writes to `backend/data/store.json` using memory fixtures

**What NOT to Mock:**
- Knowledge retriever scoring logic (`backend/atlas/knowledge/retriever.js`)
- Campus demo data lookup and filtering logic (`backend/atlas/data/`)
- Multi-agent intent matching and plan generation (`backend/atlas/orchestrator/orchestrator.js`)

## Fixtures and Factories

**Test Data:**
- In-memory demo datasets in `backend/atlas/data/` (`demoStudents.js`, `demoCampus.js`, `demoEvents.js`, `demoCommunication.js`) currently serve as realistic campus fixtures.
- Default state object in `backend/store.js` (`DEFAULTS()`) serves as the base schema fixture for persistent storage.

## Coverage

**Requirements:**
- None enforced. Current test coverage is 0%.

**View Coverage:**

```bash

# Not configured

```

## Test Types

**Unit Tests:**
- Needed for:
  - Agent `canHandle()` intent detection and rule matching
  - RAG knowledge retrieval and keyword scoring (`retriever.js`)
  - Document generators (PDF, Excel, Word in `docs.js`)
  - OAuth state verification and token refresh expiration math

**Integration Tests:**
- Needed for:
  - Express `/api/atlas/status` and `/api/atlas/orchestrate` endpoints
  - Primary `/api/chat` SSE streaming route
  - Instagram webhook challenge and message receiver
  - Persistence lifecycle (`store.js` get/save/tmp swap)

**E2E Tests:**
- Not used.

## Common Patterns

**Async Testing Pattern:**

```javascript
import { test } from 'node:test'
import assert from 'node:assert'
import { orchestrate } from '../../atlas/orchestrator/orchestrator.js'

test('orchestrates multi-agent query end-to-end', async () => {
  const result = await orchestrate({ message: 'What campus facilities exist and when is the hackathon?' })
  assert.strictEqual(result.status, 'success')
  assert.ok(result.plan.steps.length >= 2)
  assert.ok(result.response.text.length > 50)
})
```

---

*Testing analysis: 2026-10-10*
