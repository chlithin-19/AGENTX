/**
 * Atlas Campus Intelligence Layer - Root Module Entrypoint
 * 
 * Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md (Phase A, B, C, D, E, F)
 * Security Reference: Plan 02-01 (Security, Identity & Action Confirmation)
 * 
 * This module establishes the additive namespace for the Atlas campus multi-agent system.
 * It mounts non-breaking /api/atlas routes while preserving all existing AGENTX runtime capabilities.
 */

import { Router } from 'express'
import { orchestrate, routeQuery, isAtlasQuery, isIdempotent } from './orchestrator/orchestrator.js'
import { DEMO_STUDENT_PROFILES } from './data/demoStudents.js'
import { DEMO_FACILITIES, DEMO_CAMPUS_SERVICES, createDemoMaintenanceTicket } from './data/demoCampus.js'
import { DEMO_EVENTS } from './data/demoEvents.js'
import { DEMO_ANNOUNCEMENTS, DEMO_NOTIFICATIONS, draftCampusMessage } from './data/demoCommunication.js'
import { AUTH_CONFIG, executeConfirmedAction } from './security/index.js'

import { getCampusRepositories } from './campus/repositories/index.js'

/**
 * Action executor callback executing the verified stored server proposal.
 */
async function defaultActionExecutor(actionType, proposal, user) {
  if (actionType === 'campus.create_maintenance_ticket') {
    try {
      const { campusRepo } = getCampusRepositories()
      let prio = (proposal.priority || 'normal').toLowerCase()
      if (prio === 'medium') prio = 'normal'
      if (prio === 'high') prio = 'urgent'
      if (!['low', 'normal', 'urgent', 'critical'].includes(prio)) prio = 'normal'

      return campusRepo.createMaintenanceTicket({
        location: proposal.location,
        issue: proposal.issue,
        priority: prio,
        reportedBy: user?.name || proposal.reportedBy || 'Alex Kumar',
        reporterId: user?.id || user?.studentId || null
      })
    } catch {
      return createDemoMaintenanceTicket({
        ...proposal,
        reportedBy: user?.name || proposal.reportedBy || 'Alex Kumar'
      })
    }
  }

  if (actionType === 'communication.draft_broadcast') {
    return draftCampusMessage(proposal)
  }

  if (actionType === 'email.send') {
    const { get } = await import('../store.js')
    const { ensureGoogleToken, gmailSend } = await import('../tools.js')
    const it = get().integrations?.find(x => x.id === 'gmail')
    if (!it?.token) {
      const err = new Error('Gmail integration is not connected. Connect your Google account in Settings > Integrations.')
      err.code = 'INTEGRATION_NOT_CONNECTED'
      err.status = 400
      throw err
    }
    if (it.token.startsWith('dev_') || it.token.startsWith('token_') || it.token.startsWith('simulated_')) {
      const err = new Error('Cannot execute external email action with simulated/development tokens. Real Google OAuth credentials are required.')
      err.code = 'REAL_CREDENTIALS_REQUIRED'
      err.status = 403
      throw err
    }
    const token = await ensureGoogleToken(it)
    const result = await gmailSend(it, proposal.to, proposal.text || proposal.body, proposal.attachment)
    return {
      success: true,
      provider: 'google_gmail',
      id: result.id,
      threadId: result.threadId,
      recipient: proposal.to,
      subject: result.subject
    }
  }

  if (actionType === 'calendar.create_event') {
    const { get } = await import('../store.js')
    const { ensureGoogleToken, calendarCreate } = await import('../tools.js')
    const it = get().integrations?.find(x => x.id === 'calendar')
    if (!it?.token) {
      const err = new Error('Google Calendar integration is not connected. Connect Google Calendar in Settings > Integrations.')
      err.code = 'INTEGRATION_NOT_CONNECTED'
      err.status = 400
      throw err
    }
    if (it.token.startsWith('dev_') || it.token.startsWith('token_') || it.token.startsWith('simulated_')) {
      const err = new Error('Cannot execute external calendar action with simulated/development tokens. Real Google OAuth credentials are required.')
      err.code = 'REAL_CREDENTIALS_REQUIRED'
      err.status = 403
      throw err
    }
    const events = Array.isArray(proposal) ? proposal : [proposal]
    const created = await calendarCreate(it, events)
    return {
      success: true,
      provider: 'google_calendar',
      count: created.length,
      events: created
    }
  }

  throw new Error(`Execution handler not configured for action type "${actionType}".`)
}

/**
 * Creates and configures the Express router for /api/atlas routes.
 * 
 * @returns {Router} Configured Express router
 */
export function createAtlasRouter() {
  const router = Router()

  function resolveRequestUser(req) {
    if (AUTH_CONFIG.isProduction) {
      return req.user || null
    }
    return req.user || (AUTH_CONFIG.enableDevPersonas ? { id: 1, studentId: 1, role: 'student', branch: 'IT', name: 'Alex Kumar' } : null)
  }

  /**
   * GET /api/atlas/status
   * Health, auth mode, and registry status of the Atlas multi-agent subsystem.
   */
  router.get('/status', (req, res) => {
    res.status(200).json({
      status: 'active',
      system: 'Atlas Campus Multi-Agent Intelligence Layer',
      mode: AUTH_CONFIG.isProduction ? 'PRODUCTION (Authenticated / SQLite Relational DB)' : 'DEVELOPMENT (Simulated Persona / SQLite Relational DB)',
      authMode: AUTH_CONFIG.authMode,
      isProduction: AUTH_CONFIG.isProduction,
      enableDevPersonas: AUTH_CONFIG.enableDevPersonas,
      agents: [
        { name: 'academic', role: 'Academic & Placement Intelligence', status: 'ready' },
        { name: 'campus', role: 'Campus Facilities, Locations & Maintenance', status: 'ready' },
        { name: 'event', role: 'Campus Events & Workshops', status: 'ready' },
        { name: 'communication', role: 'Announcements & Message Drafting', status: 'ready' }
      ],
      datasetMetrics: {
        demoStudentsLoaded: DEMO_STUDENT_PROFILES.length,
        facilitiesLoaded: DEMO_FACILITIES.length,
        servicesLoaded: DEMO_CAMPUS_SERVICES.length,
        eventsLoaded: DEMO_EVENTS.length,
        announcementsLoaded: DEMO_ANNOUNCEMENTS.length,
        sqlite: (() => {
          try {
            const { db } = getCampusRepositories()
            return {
              connected: true,
              studentsCount: db.prepare('SELECT COUNT(*) as c FROM students').get()?.c || 0,
              benchmarksCount: db.prepare('SELECT COUNT(*) as c FROM cohort_benchmarks').get()?.c || 0,
              engine: 'node:sqlite'
            }
          } catch {
            return { connected: false }
          }
        })()
      },
      timestamp: new Date().toISOString()
    })
  })

  /**
   * POST /api/atlas/orchestrate
   * 
   * Main multi-agent orchestration endpoint.
   * Accepts: { "message": "user inquiry", "user": { ... } }
   * Returns: Full execution plan, agent results, citations, and unified response.
   */
  router.post('/orchestrate', async (req, res) => {
    try {
      const { message } = req.body || {}
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
          status: 'error',
          error: 'BAD_REQUEST',
          message: 'The "message" field is required and must be a non-empty string.'
        })
      }

      // Exclusively use req.user established by extractIdentity middleware
      const user = req.user || null
      const result = await orchestrate({ message, user })
      res.status(200).json(result)
    } catch (err) {
      console.error('[Atlas Orchestrator Error]', err)
      res.status(500).json({
        status: 'error',
        error: 'INTERNAL_ORCHESTRATION_ERROR',
        message: err.message || 'An unexpected error occurred during multi-agent orchestration.',
        timestamp: new Date().toISOString()
      })
    }
  })

  /**
   * POST /api/atlas/actions/confirm
   * 
   * Protected Consequential Action Confirmation Endpoint.
   * Receives: { "confirmationToken": "..." }
   * Executes the exact STORED server proposal with atomic single-use replay prevention.
   */
  router.post('/actions/confirm', async (req, res) => {
    try {
      const { confirmationToken } = req.body || {}
      if (!confirmationToken || typeof confirmationToken !== 'string') {
        return res.status(400).json({
          status: 'error',
          error: 'BAD_REQUEST',
          message: 'The "confirmationToken" field is required and must be a string.'
        })
      }

      const user = req.user
      if (!user) {
        return res.status(401).json({
          status: 'error',
          error: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required to confirm consequential actions.'
        })
      }

      const result = await executeConfirmedAction({
        token: confirmationToken,
        reqUser: user,
        actionExecutor: defaultActionExecutor
      })

      res.status(200).json({
        status: 'success',
        message: 'Action confirmed and executed successfully.',
        actionType: result.actionType,
        result: result.data,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      const statusCode = err.status || 500
      res.status(statusCode).json({
        status: 'error',
        error: err.code || 'ACTION_CONFIRMATION_FAILED',
        message: err.message || 'Failed to execute confirmed action.',
        timestamp: new Date().toISOString()
      })
    }
  })

  /**
   * GET /api/atlas/academics/profile
   * Returns authenticated user's academic and placement profile from campus.db.
   */
  router.get('/academics/profile', (req, res) => {
    try {
      const user = resolveRequestUser(req)
      if (!user) {
        return res.status(401).json({ status: 'error', error: 'AUTHENTICATION_REQUIRED', message: 'Authentication required to access academic metrics.' })
      }
      const targetId = req.query.studentId ? Number(req.query.studentId) : (user.studentId || user.id || 1)

      const { studentRepo, academicRepo, placementRepo } = getCampusRepositories()
      const student = studentRepo.getStudentById(targetId, user)
      if (!student) {
        return res.status(404).json({ status: 'error', error: 'NOT_FOUND', message: 'Student profile not found.' })
      }
      const academic = academicRepo.getAcademicRecord(targetId, user)
      const placement = placementRepo.getPlacementProfile(targetId, user)

      res.status(200).json({
        status: 'success',
        data: {
          ...student,
          ...(academic || {}),
          ...(placement || {})
        }
      })
    } catch (err) {
      const statusCode = err.status || (err.code?.startsWith('FORBIDDEN') ? 403 : 500)
      res.status(statusCode).json({
        status: 'error',
        error: err.code || 'PROFILE_FETCH_FAILED',
        message: err.message
      })
    }
  })

  /**
   * GET /api/atlas/academics/benchmarks
   * Returns cohort benchmarks from cohort_benchmarks table.
   */
  router.get('/academics/benchmarks', (req, res) => {
    try {
      const { placementRepo } = getCampusRepositories()
      const branch = req.query.branch ? String(req.query.branch).trim().toUpperCase() : null
      if (branch) {
        const bm = placementRepo.getCohortBenchmark(branch)
        return res.status(200).json({ status: 'success', data: bm ? [bm] : [] })
      }
      const all = placementRepo.getAllCohortBenchmarks()
      res.status(200).json({ status: 'success', data: all })
    } catch (err) {
      res.status(500).json({ status: 'error', error: 'BENCHMARK_FETCH_FAILED', message: err.message })
    }
  })

  /**
   * GET /api/atlas/facilities
   * Returns active campus facilities and services.
   */
  router.get('/facilities', (req, res) => {
    res.status(200).json({
      status: 'success',
      data: DEMO_FACILITIES,
      services: DEMO_CAMPUS_SERVICES
    })
  })

  /**
   * GET /api/atlas/facilities/tickets
   * Lists maintenance tickets for authenticated user (or all tickets if faculty/admin).
   */
  router.get('/facilities/tickets', (req, res) => {
    try {
      const user = resolveRequestUser(req)
      if (!user) {
        return res.status(401).json({ status: 'error', error: 'AUTHENTICATION_REQUIRED', message: 'Authentication required to view tickets.' })
      }
      const { campusRepo } = getCampusRepositories()
      const role = user.role || 'student'
      const tickets = (role === 'admin' || role === 'faculty')
        ? campusRepo.listAllTickets(50)
        : campusRepo.listTicketsByReporter(user.id || user.studentId || 1)
      res.status(200).json({ status: 'success', data: tickets })
    } catch (err) {
      res.status(500).json({ status: 'error', error: 'TICKETS_FETCH_FAILED', message: err.message })
    }
  })

  /**
   * POST /api/atlas/facilities/tickets
   * Creates a durable maintenance ticket in SQLite campus.db.
   */
  router.post('/facilities/tickets', (req, res) => {
    try {
      const { location, issue, priority } = req.body || {}
      if (!location || !issue) {
        return res.status(400).json({
          status: 'error',
          error: 'BAD_REQUEST',
          message: 'Both "location" and "issue" are required to report a maintenance ticket.'
        })
      }

      const user = resolveRequestUser(req)
      if (!user) {
        return res.status(401).json({ status: 'error', error: 'AUTHENTICATION_REQUIRED', message: 'Authentication required to report a maintenance ticket.' })
      }
      const { campusRepo } = getCampusRepositories()
      const rawPriority = String(priority || 'normal').toLowerCase()
      const validPriorities = ['low', 'normal', 'urgent', 'critical']
      const normalizedPriority = rawPriority === 'high' ? 'urgent' : (validPriorities.includes(rawPriority) ? rawPriority : 'normal')

      const ticket = campusRepo.createMaintenanceTicket({
        location,
        issue,
        priority: normalizedPriority,
        reportedBy: user.name || 'Alex Kumar',
        reporterId: user.id || user.studentId || 1
      })

      res.status(201).json({
        status: 'success',
        message: 'Maintenance ticket created successfully.',
        data: ticket
      })
    } catch (err) {
      res.status(500).json({ status: 'error', error: 'TICKET_CREATE_FAILED', message: err.message })
    }
  })

  /**
   * GET /api/atlas/events
   * Returns list of campus events and registration status.
   */
  router.get('/events', (req, res) => {
    res.status(200).json({
      status: 'success',
      data: DEMO_EVENTS
    })
  })

  /**
   * POST /api/atlas/events/:eventId/register
   * Registers authenticated user for an event and durably records in SQLite.
   */
  router.post('/events/:eventId/register', (req, res) => {
    try {
      const user = resolveRequestUser(req)
      if (!user) {
        return res.status(401).json({ status: 'error', error: 'AUTHENTICATION_REQUIRED', message: 'Authentication required to register for campus events.' })
      }
      const { eventId } = req.params
      const evt = DEMO_EVENTS.find(e => e.id === eventId)
      if (!evt) {
        return res.status(404).json({ status: 'error', error: 'NOT_FOUND', message: `Event "${eventId}" not found.` })
      }
      if (evt.registeredCount >= evt.capacity) {
        return res.status(400).json({ status: 'error', error: 'CAPACITY_REACHED', message: 'Event has reached full capacity.' })
      }

      const { campusRepo } = getCampusRepositories()
      const durableReg = campusRepo.registerForEvent({
        eventId,
        userId: user.id || user.studentId || 1,
        userName: user.name || 'Alex Kumar'
      })

      evt.registeredCount = Math.max(evt.registeredCount + 1, durableReg.totalRegistrations)
      res.status(200).json({
        status: 'success',
        message: `Successfully registered for "${evt.title}".`,
        registrationId: durableReg.id,
        data: evt
      })
    } catch (err) {
      const statusCode = err.status || (err.code === 'ALREADY_REGISTERED' ? 409 : 500)
      res.status(statusCode).json({
        status: 'error',
        error: err.code || 'REGISTRATION_FAILED',
        message: err.message
      })
    }
  })

  /**
   * GET /api/atlas/circulars
   * Returns verified institutional announcements and notifications.
   */
  router.get('/circulars', (req, res) => {
    const category = req.query.category ? String(req.query.category).toLowerCase() : null
    let list = DEMO_ANNOUNCEMENTS
    if (category) {
      list = list.filter(a => a.category.toLowerCase() === category)
    }
    res.status(200).json({
      status: 'success',
      data: list,
      notifications: DEMO_NOTIFICATIONS
    })
  })

  return router
}

export { defaultActionExecutor, orchestrate, routeQuery, isAtlasQuery, isIdempotent }

export default {
  defaultActionExecutor,
  createAtlasRouter,
  orchestrate,
  routeQuery,
  isAtlasQuery,
  isIdempotent
}
