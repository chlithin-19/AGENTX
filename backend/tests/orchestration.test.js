/**
 * Atlas Phase 4 Orchestration & Reliability Test Suite
 * 
 * Verifies:
 * 1. Action Idempotency Classification
 * 2. Concurrent Parallel Execution of Independent Tasks
 * 3. Bounded Execution Timeouts & AbortController ETIMEDOUT
 * 4. Safe Idempotent Retries with Exponential Backoff
 * 5. Non-Idempotent Mutation Single-Execution Safety (No Retries)
 * 6. Partial Fault Recovery & Transparent Degradation
 * 7. Upstream Cancellation via AbortSignal
 * 8. Real-time Progress Streaming Event Emission
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  orchestrate,
  isIdempotent,
  decomposeQuery,
  AGENT_REGISTRY
} from '../atlas/orchestrator/orchestrator.js'

describe('1. Action Idempotency Classification', () => {
  test('correctly identifies read-only inquiries as idempotent', () => {
    assert.equal(isIdempotent('academic', 'resolve_academic_intent'), true)
    assert.equal(isIdempotent('campus', 'get_facility_hours'), true)
    assert.equal(isIdempotent('event', 'list_upcoming_events'), true)
    assert.equal(isIdempotent('communication', 'query_circulars'), true)
  })

  test('correctly identifies mutating operations and drafting as non-idempotent', () => {
    assert.equal(isIdempotent('campus', 'create_maintenance_ticket'), false)
    assert.equal(isIdempotent('communication', 'draft_broadcast'), false)
    assert.equal(isIdempotent('event', 'submit_registration'), false)
    assert.equal(isIdempotent('system', 'execute_action'), false)
  })
})

describe('2. Safe Parallel Execution of Independent Multi-Agent Tasks', () => {
  test('executes independent sub-tasks concurrently with individual timing metrics', async () => {
    const progressEvents = []
    const res = await orchestrate({
      message: 'Check my attendance and tell me what time the library closes',
      user: { id: 1, studentId: 1, role: 'student', branch: 'IT', name: 'Alex Kumar' },
      onProgress: (p) => progressEvents.push(p)
    })

    assert.equal(res.status, 'completed')
    assert.equal(res.plan.totalTasks, 2)
    assert.ok(res.plan.tasks.every(t => typeof t.durationMs === 'number' && t.durationMs >= 0))

    // Both sub-agents started and completed
    const startEvents = progressEvents.filter(p => p.type === 'task_start')
    const completeEvents = progressEvents.filter(p => p.type === 'task_complete')

    assert.equal(startEvents.length, 2)
    assert.equal(completeEvents.length, 2)
    assert.ok(startEvents.some(p => p.agent === 'academic'))
    assert.ok(startEvents.some(p => p.agent === 'campus'))
  })
})

describe('3. Bounded Execution Timeouts & Cancellation', () => {
  test('aborts with ETIMEDOUT when an agent exceeds bounded timeout threshold', async () => {
    // Temporarily mock an agent with artificial delay
    const originalExecute = AGENT_REGISTRY.campus.execute
    AGENT_REGISTRY.campus.execute = async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { agent: 'campus', status: 'completed', summary: 'Late response' }
    }

    try {
      const progressEvents = []
      const res = await orchestrate({
        message: 'What time does the library close?',
        timeoutMs: 50, // strictly enforce 50ms timeout
        maxRetries: 0,
        onProgress: (p) => progressEvents.push(p)
      })

      assert.equal(res.status, 'error')
      assert.ok(res.plan.tasks[0].error.includes('ETIMEDOUT') || res.plan.tasks[0].error.includes('AGENT_TIMEOUT'))
      assert.ok(res.response.text.includes('Unable to complete campus agent inquiry'))

      const errEvents = progressEvents.filter(p => p.type === 'task_error')
      assert.ok(errEvents.length > 0)
    } finally {
      AGENT_REGISTRY.campus.execute = originalExecute
    }
  })

  test('aborts immediately and returns status cancelled when AbortSignal is triggered', async () => {
    const controller = new AbortController()
    controller.abort() // pre-aborted

    const res = await orchestrate({
      message: 'Check my attendance',
      abortSignal: controller.signal
    })

    assert.equal(res.status, 'cancelled')
    assert.ok(res.message.includes('cancelled'))
  })
})

describe('4. Safe Idempotent Retries with Backoff', () => {
  test('retries transient failures for idempotent operations and succeeds', async () => {
    const originalExecute = AGENT_REGISTRY.academic.execute
    let attempts = 0

    // Fails on attempt 1 with transient error, succeeds on attempt 2
    AGENT_REGISTRY.academic.execute = async (task, ctx) => {
      attempts++
      if (attempts === 1) {
        throw new Error('Transient database socket timeout')
      }
      return originalExecute.call(AGENT_REGISTRY.academic, task, ctx)
    }

    try {
      const retryEvents = []
      const res = await orchestrate({
        message: 'Check my attendance',
        user: { id: 1, studentId: 1, role: 'student', branch: 'IT', name: 'Alex Kumar' },
        maxRetries: 2,
        onProgress: (p) => {
          if (p.type === 'task_retry') retryEvents.push(p)
        }
      })

      assert.equal(attempts, 2, 'Must have attempted exactly twice')
      assert.equal(retryEvents.length, 1, 'Must emit 1 retry progress event')
      assert.equal(retryEvents[0].attempt, 1)
      assert.equal(res.status, 'completed')
      assert.ok(res.response.text.includes('77.46%'))
    } finally {
      AGENT_REGISTRY.academic.execute = originalExecute
    }
  })

  test('does not retry security errors (401 / 403 Forbidden)', async () => {
    const originalExecute = AGENT_REGISTRY.academic.execute
    let attempts = 0

    AGENT_REGISTRY.academic.execute = async () => {
      attempts++
      const secErr = new Error('Access Denied: Forbidden')
      secErr.status = 403
      secErr.code = 'FORBIDDEN_STUDENT_ISOLATION'
      throw secErr
    }

    try {
      const retryEvents = []
      const res = await orchestrate({
        message: 'Check my attendance',
        maxRetries: 2,
        onProgress: (p) => {
          if (p.type === 'task_retry') retryEvents.push(p)
        }
      })

      assert.equal(attempts, 1, 'Security errors must fail closed without retry')
      assert.equal(retryEvents.length, 0)
      assert.equal(res.status, 'error')
    } finally {
      AGENT_REGISTRY.academic.execute = originalExecute
    }
  })
})

describe('5. Partial Fault Recovery & Transparent Degradation', () => {
  test('recovers partially when one agent fails, preserving successful agent outputs', async () => {
    const originalCampusExecute = AGENT_REGISTRY.campus.execute

    // Campus fails, but academic succeeds
    AGENT_REGISTRY.campus.execute = async () => {
      throw new Error('Facilities microservice unavailable (503 Service Unavailable)')
    }

    try {
      const res = await orchestrate({
        message: 'Check my attendance and tell me what time the library closes',
        user: { id: 1, studentId: 1, role: 'student', branch: 'IT', name: 'Alex Kumar' },
        maxRetries: 0
      })

      assert.equal(res.status, 'partial', 'Workflow status must be partial')
      // Academic output is intact
      assert.ok(res.response.text.includes('77.46%'))
      // Failed agent has transparent notice
      assert.ok(res.response.text.includes('CAMPUS Agent Notice'))
      assert.ok(res.response.text.includes('Facilities microservice unavailable'))
    } finally {
      AGENT_REGISTRY.campus.execute = originalCampusExecute
    }
  })
})
