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
import { orchestrate, routeQuery, isAtlasQuery } from './orchestrator/orchestrator.js'
import { DEMO_STUDENT_PROFILES } from './data/demoStudents.js'
import { DEMO_FACILITIES, DEMO_CAMPUS_SERVICES, createDemoMaintenanceTicket } from './data/demoCampus.js'
import { DEMO_EVENTS } from './data/demoEvents.js'
import { DEMO_ANNOUNCEMENTS, draftCampusMessage } from './data/demoCommunication.js'
import { AUTH_CONFIG, executeConfirmedAction } from './security/index.js'

/**
 * Action executor callback executing the verified stored server proposal.
 */
async function defaultActionExecutor(actionType, proposal, user) {
  if (actionType === 'campus.create_maintenance_ticket') {
    return createDemoMaintenanceTicket({
      ...proposal,
      reportedBy: user?.name || proposal.reportedBy || 'Alex Kumar'
    })
  }

  if (actionType === 'communication.draft_broadcast') {
    return draftCampusMessage(proposal)
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

  /**
   * GET /api/atlas/status
   * Health, auth mode, and registry status of the Atlas multi-agent subsystem.
   */
  router.get('/status', (req, res) => {
    res.status(200).json({
      status: 'active',
      system: 'Atlas Campus Multi-Agent Intelligence Layer',
      mode: 'DEMO DATA (Isolated / In-Memory)',
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
        announcementsLoaded: DEMO_ANNOUNCEMENTS.length
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
      const { message, user: overrideUser } = req.body || {}
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
          status: 'error',
          error: 'BAD_REQUEST',
          message: 'The "message" field is required and must be a non-empty string.'
        })
      }

      // Priority: validated req.user from identity middleware, then body override in dev
      const user = req.user || overrideUser || null
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

  return router
}

export { orchestrate, routeQuery, isAtlasQuery }

export default {
  createAtlasRouter,
  orchestrate,
  routeQuery,
  isAtlasQuery
}
