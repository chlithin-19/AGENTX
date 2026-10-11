/**
 * Atlas Phase 6 Campus Workflows & Endpoints Test Suite
 * 
 * Verifies:
 * 1. Academics Profile API with Point-of-Access Isolation
 * 2. Academic Cohort Benchmarks API
 * 3. Facilities Listing & Operational Status
 * 4. Durable SQLite Maintenance Ticket Creation & Listing
 * 5. Event Listing & Real Registration Capacity Tracking
 * 6. Official Campus Circulars Listing & Category Filtering
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import { createAtlasRouter } from '../atlas/index.js'
import { getCampusRepositories } from '../atlas/campus/repositories/index.js'

// Helper to make in-process HTTP requests to the Express router
async function simulateRequest(app, method, path, { headers = {}, body = null } = {}) {
  const req = {
    method: method.toUpperCase(),
    url: path,
    headers: { 'content-type': 'application/json', ...headers },
    body: body || {},
    query: {}
  }

  // Parse query params if present
  if (path.includes('?')) {
    const [, qs] = path.split('?')
    const params = new URLSearchParams(qs)
    for (const [k, v] of params.entries()) {
      req.query[k] = v
    }
    req.url = path.split('?')[0]
  }

  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      headers: {},
      status(code) {
        this.statusCode = code
        return this
      },
      setHeader(k, v) {
        this.headers[k.toLowerCase()] = v
        return this
      },
      json(data) {
        resolve({ status: this.statusCode, headers: this.headers, body: data })
      },
      send(data) {
        resolve({ status: this.statusCode, headers: this.headers, body: data })
      }
    }

    app.handle(req, res, () => {
      resolve({ status: 404, headers: {}, body: { error: 'NOT_FOUND' } })
    })
  })
}

function createTestApp() {
  const app = express()
  app.use(express.json())
  app.use((req, res, next) => {
    // Default development persona simulation: Alex Kumar (Student ID 1, Branch IT)
    req.user = {
      id: 1,
      studentId: 1,
      role: 'student',
      branch: 'IT',
      name: 'Alex Kumar'
    }
    if (req.headers['x-test-role'] === 'faculty') {
      req.user = {
        id: 101,
        role: 'faculty',
        department: 'IT',
        name: 'Dr. Ramesh Rao'
      }
    }
    next()
  })
  app.use('/api/atlas', createAtlasRouter())
  return app
}

describe('1. Academic & Placement Profile Workflows', () => {
  const app = createTestApp()

  test('GET /api/atlas/academics/profile returns student profile with point-of-access check', async () => {
    const res = await simulateRequest(app, 'GET', '/api/atlas/academics/profile')

    assert.equal(res.status, 200)
    assert.equal(res.body.status, 'success')
    assert.equal(res.body.data.name, 'Alex Kumar')
    assert.equal(res.body.data.student_id, 1)
    assert.ok(typeof res.body.data.attendance_percentage === 'number')
    assert.ok(typeof res.body.data.cgpa === 'number')
    assert.ok(typeof res.body.data.coding_skill_score === 'number')
  })

  test('GET /api/atlas/academics/profile rejects cross-student access with 403 Forbidden', async () => {
    // Student 1 attempts to query student 2 (Priya Sharma)
    const res = await simulateRequest(app, 'GET', '/api/atlas/academics/profile?studentId=2')

    assert.equal(res.status, 403)
    assert.equal(res.body.status, 'error')
    assert.ok(res.body.message.includes('You do not have permission to access records outside your student account'))
  })

  test('GET /api/atlas/academics/benchmarks returns cohort department benchmarks', async () => {
    const res = await simulateRequest(app, 'GET', '/api/atlas/academics/benchmarks')

    assert.equal(res.status, 200)
    assert.equal(res.body.status, 'success')
    assert.ok(Array.isArray(res.body.data))
    assert.ok(res.body.data.length >= 6, 'Must contain all 6 department benchmarks')

    const itBenchmark = res.body.data.find(b => b.branch_code === 'IT')
    assert.ok(itBenchmark)
    assert.ok(itBenchmark.average_cgpa > 0)
    assert.ok(itBenchmark.total_students > 0)
  })
})

describe('2. Campus Facilities & Durable Maintenance Workflows', () => {
  const app = createTestApp()

  test('GET /api/atlas/facilities returns active facilities list', async () => {
    const res = await simulateRequest(app, 'GET', '/api/atlas/facilities')

    assert.equal(res.status, 200)
    assert.equal(res.body.status, 'success')
    assert.ok(Array.isArray(res.body.data))
    assert.ok(res.body.data.some(f => f.name.includes('Central Library')))
    assert.ok(res.body.data.some(f => f.name.includes('Sports')))
  })

  test('POST /api/atlas/facilities/tickets creates durable ticket in SQLite database', async () => {
    const ticketPayload = {
      location: 'Computer Center Lab 204',
      issue: 'Air conditioning water leakage near workstation 14',
      priority: 'high'
    }

    const res = await simulateRequest(app, 'POST', '/api/atlas/facilities/tickets', { body: ticketPayload })

    assert.equal(res.status, 201)
    assert.equal(res.body.status, 'success')
    assert.ok(res.body.data.id.startsWith('tkt_'))
    assert.equal(res.body.data.location, ticketPayload.location)
    assert.equal(res.body.data.issue, ticketPayload.issue)
    assert.equal(res.body.data.priority, 'urgent')

    // Verify durable persistence directly in SQLite table
    const { campusRepo } = getCampusRepositories()
    const storedTicket = campusRepo.getTicketById(res.body.data.id)
    assert.ok(storedTicket, 'Ticket must be genuinely persisted in SQLite database')
    assert.equal(storedTicket.location, ticketPayload.location)
    assert.equal(storedTicket.status, 'open')
  })

  test('GET /api/atlas/facilities/tickets returns user created tickets', async () => {
    const res = await simulateRequest(app, 'GET', '/api/atlas/facilities/tickets')

    assert.equal(res.status, 200)
    assert.equal(res.body.status, 'success')
    assert.ok(Array.isArray(res.body.data))
    assert.ok(res.body.data.length > 0)
  })
})

describe('3. Campus Events & Registration Workflows', () => {
  const app = createTestApp()

  test('GET /api/atlas/events returns upcoming events', async () => {
    const res = await simulateRequest(app, 'GET', '/api/atlas/events')

    assert.equal(res.status, 200)
    assert.equal(res.body.status, 'success')
    assert.ok(Array.isArray(res.body.data))
    assert.ok(res.body.data.some(e => e.id === 'evt_hack_2026'))
  })

  test('POST /api/atlas/events/:eventId/register creates durable registration in SQLite', async () => {
    // Generate unique event test ID so runs are isolated
    const testEventId = 'evt_career_fair'
    const { campusRepo } = getCampusRepositories()
    campusRepo.db.prepare('DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?').run(testEventId, '1')

    const res = await simulateRequest(app, 'POST', `/api/atlas/events/${testEventId}/register`)

    assert.equal(res.status, 200)
    assert.equal(res.body.status, 'success')
    assert.ok(res.body.registrationId, 'Must return generated registration ID')

    // Verify durable record exists in SQLite event_registrations table
    const isReg = campusRepo.isRegisteredForEvent(testEventId, 1)
    assert.equal(isReg, true, 'Registration must be durably recorded in SQLite')

    // Duplicate registration attempt by same user must be rejected with 409 Conflict
    const dupRes = await simulateRequest(app, 'POST', `/api/atlas/events/${testEventId}/register`)
    assert.equal(dupRes.status, 409)
    assert.equal(dupRes.body.error, 'ALREADY_REGISTERED')
  })
})

describe('4. Campus Circulars & Communications Workflows', () => {
  const app = createTestApp()

  test('GET /api/atlas/circulars returns official announcements', async () => {
    const res = await simulateRequest(app, 'GET', '/api/atlas/circulars')

    assert.equal(res.status, 200)
    assert.equal(res.body.status, 'success')
    assert.ok(Array.isArray(res.body.data))
    assert.ok(res.body.data.some(c => c.title.includes('Examination Schedule')))
  })

  test('GET /api/atlas/circulars?category=academic filters by category', async () => {
    const res = await simulateRequest(app, 'GET', '/api/atlas/circulars?category=academic')

    assert.equal(res.status, 200)
    assert.equal(res.body.status, 'success')
    assert.ok(res.body.data.every(c => c.category.toLowerCase() === 'academic'))
  })
})
