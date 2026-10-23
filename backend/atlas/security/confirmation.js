/**
 * Atlas Consequential Action Confirmation Lifecycle Module
 * 
 * Invariants:
 * 1. Binds token to authenticated userId, allowlisted actionType, and exact server-side proposal.
 * 2. On confirmation, executes the stored proposal—NOT client-supplied execution arguments.
 * 3. Enforces atomic single-use consumption to prevent concurrent replay attacks.
 * 4. Re-validates user authorization and token expiration at execution time.
 */

import crypto from 'node:crypto'
import { SecurityError } from './authorization.js'

export const ALLOWLISTED_ACTION_TYPES = Object.freeze([
  'campus.create_maintenance_ticket',
  'communication.draft_broadcast',
  'calendar.create_event',
  'email.send'
])

// In-memory confirmation intent store (token -> record)
const CONFIRMATION_STORE = new Map()

// Clean up expired tokens periodically (unreferenced timer so process can exit cleanly)
const cleanupTimer = setInterval(() => {
  const now = Date.now()
  for (const [token, record] of CONFIRMATION_STORE.entries()) {
    if (now > record.expiresAt + 60000) {
      CONFIRMATION_STORE.delete(token)
    }
  }
}, 60000)
if (cleanupTimer.unref) cleanupTimer.unref()

/**
 * Creates a server-side confirmation intent and returns a cryptographic token.
 * 
 * @param {Object} params
 * @param {string|number} params.userId - Authenticated user ID proposing the action
 * @param {string} params.actionType - Must be one of ALLOWLISTED_ACTION_TYPES
 * @param {Object} params.proposal - Exact normalized server proposal parameters
 * @param {number} [params.ttlMs=300000] - Expiration time in ms (default 5 minutes)
 * @returns {Object} Confirmation metadata including token and expiresAt
 */
export function createConfirmationIntent({ userId, actionType, proposal, ttlMs = 300000 }) {
  if (!userId) {
    throw new SecurityError('MISSING_USER_ID', 'User ID is required to create a confirmation intent.', 400)
  }

  if (!ALLOWLISTED_ACTION_TYPES.includes(actionType)) {
    throw new SecurityError('UNALLOWLISTED_ACTION', `Action type "${actionType}" is not allowlisted for confirmation.`, 400)
  }

  if (!proposal || typeof proposal !== 'object') {
    throw new SecurityError('INVALID_PROPOSAL', 'Proposal must be a valid object.', 400)
  }

  const token = crypto.randomBytes(32).toString('hex')
  const frozenProposal = Object.freeze(JSON.parse(JSON.stringify(proposal)))
  const payloadHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(frozenProposal))
    .digest('hex')

  const record = {
    token,
    userId: String(userId),
    actionType,
    proposal: frozenProposal,
    payloadHash,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
    consumed: false,
    lock: false
  }

  CONFIRMATION_STORE.set(token, record)

  return {
    confirmationToken: token,
    actionType,
    expiresAt: record.expiresAt,
    requiresConfirmation: true
  }
}

/**
 * Validates token, enforces atomic single-use check, and executes the STORED proposal.
 * 
 * @param {Object} params
 * @param {string} params.token - Confirmation token submitted by the user
 * @param {Object} params.reqUser - Authenticated user executing the action
 * @param {Function} params.actionExecutor - Callback function (actionType, storedProposal, user) => Promise<any>
 * @returns {Promise<Object>} Execution result
 */
export async function executeConfirmedAction({ token, reqUser, actionExecutor }) {
  if (!token || typeof token !== 'string') {
    throw new SecurityError('MISSING_TOKEN', 'Confirmation token is required.', 400)
  }

  if (!reqUser) {
    throw new SecurityError('UNAUTHENTICATED', 'Authentication required to execute actions.', 401)
  }

  const record = CONFIRMATION_STORE.get(token)
  if (!record) {
    throw new SecurityError('TOKEN_NOT_FOUND', 'Confirmation token was not found or has expired.', 404)
  }

  // 1. Expiration Check
  if (Date.now() > record.expiresAt) {
    CONFIRMATION_STORE.delete(token)
    throw new SecurityError('TOKEN_EXPIRED', 'Confirmation token has expired. Please re-initiate the action.', 410)
  }

  // 2. User Binding Check
  const callingUserId = String(reqUser.id ?? reqUser.studentId ?? reqUser.sub ?? '')
  if (!callingUserId || String(record.userId) !== callingUserId) {
    throw new SecurityError(
      'FORBIDDEN_USER_MISMATCH',
      'Access Denied: You cannot confirm an action proposed for another user account.',
      403
    )
  }

  // 3. Atomic Single-Use Consumption Check (Prevents concurrent replay)
  if (record.consumed || record.lock) {
    throw new SecurityError(
      'TOKEN_ALREADY_CONSUMED',
      'Conflict: Confirmation token has already been consumed or is currently executing.',
      409
    )
  }

  // Acquire lock and mark consumed immediately
  record.lock = true
  record.consumed = true

  // 4. Execute the STORED proposal (ignores any client-supplied arguments)
  try {
    const executionResult = await actionExecutor(record.actionType, record.proposal, reqUser)
    return {
      status: 'completed',
      actionType: record.actionType,
      data: executionResult
    }
  } catch (err) {
    // Retain consumed=true to prevent replay on side-effect errors
    throw err
  } finally {
    record.lock = false
  }
}

/**
 * Diagnostic helper for testing and inspection.
 */
export function getConfirmationRecord(token) {
  return CONFIRMATION_STORE.get(token) || null
}

export function clearConfirmationStore() {
  CONFIRMATION_STORE.clear()
}

export default {
  ALLOWLISTED_ACTION_TYPES,
  createConfirmationIntent,
  executeConfirmedAction,
  getConfirmationRecord,
  clearConfirmationStore
}
