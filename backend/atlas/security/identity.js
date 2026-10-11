/**
 * Atlas Identity & Session Resolution Module
 * 
 * Invariants:
 * 1. Production identity must be established via an actually verified token or server session.
 * 2. In production, client simulation headers are rejected with HTTP 400.
 * 3. In production, unauthenticated requests fail closed with HTTP 401.
 * 4. Development simulation mode is clearly flagged via X-Atlas-Auth-Mode header.
 */

import crypto from 'node:crypto'
import { AUTH_CONFIG } from './config.js'

export const CANONICAL_PERSONAS = Object.freeze({
  1: Object.freeze({
    id: 1,
    studentId: 1,
    role: 'student',
    name: 'Alex Kumar',
    branch: 'IT',
    email: 'alex.kumar@campus.edu'
  }),
  2: Object.freeze({
    id: 2,
    studentId: 2,
    role: 'student',
    name: 'Priya Sharma',
    branch: 'CSE',
    email: 'priya.sharma@campus.edu'
  }),
  3: Object.freeze({
    id: 3,
    studentId: 3,
    role: 'student',
    name: 'Sneha Reddy',
    branch: 'EEE',
    email: 'sneha.reddy@campus.edu'
  }),
  4: Object.freeze({
    id: 4,
    studentId: 4,
    role: 'student',
    name: 'Rohan Varma',
    branch: 'CSE',
    email: 'rohan.varma@campus.edu'
  }),
  5: Object.freeze({
    id: 5,
    studentId: 5,
    role: 'student',
    name: 'Ananya Patel',
    branch: 'IT',
    email: 'ananya.patel@campus.edu'
  }),
  101: Object.freeze({
    id: 101,
    role: 'faculty',
    name: 'Dr. Ramesh Rao',
    department: 'CSE',
    title: 'Associate Professor, CSE',
    email: 'ramesh.rao@campus.edu'
  }),
  201: Object.freeze({
    id: 201,
    role: 'admin',
    name: 'Prof. S. Swaminathan',
    department: 'Academic Section',
    title: 'Dean of Academic Affairs',
    email: 'dean.academics@campus.edu'
  })
})

/**
 * Verify a production token using HMAC-SHA256 signature verification.
 * 
 * @param {string} token 
 * @param {string} secret 
 * @returns {Object|null} Decoded user payload if verified, null otherwise
 */
export function verifyProductionToken(token, secret) {
  if (!token || !secret || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [headerB64, payloadB64, signature] = parts
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url')

  if (signature !== expectedSig) return null

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
    if (payload.exp && Date.now() >= payload.exp * 1000) return null
    return payload
  } catch {
    return null
  }
}

/**
 * Create a signed production token for testing or valid sessions.
 * 
 * @param {Object} user 
 * @param {string} secret 
 * @param {number} [expiresInSeconds=3600] 
 * @returns {string} Signed JWT-compatible token
 */
export function createSignedToken(user, secret, expiresInSeconds = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  }
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url')
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url')

  return `${headerB64}.${payloadB64}.${signature}`
}

/**
 * Express middleware to resolve and attach req.user with fail-closed production checks.
 */
export function extractIdentity(req, res, next) {
  const authConfig = AUTH_CONFIG

  if (authConfig.isProduction) {
    // 1. In production, fail-closed on client dev persona simulation headers
    const hasDevHeaders = Boolean(
      req.headers['x-atlas-dev-persona-id'] ||
      req.headers['x-atlas-user-id'] ||
      req.headers['x-atlas-role']
    )
    if (hasDevHeaders) {
      return res.status(400).json({
        status: 'error',
        error: 'BAD_REQUEST',
        message: 'Client development persona simulation headers are strictly forbidden in production mode.'
      })
    }

    // 2. Validate production bearer token
    const authHeader = req.headers['authorization'] || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

    if (!token || !authConfig.jwtSecret) {
      return res.status(401).json({
        status: 'error',
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Protected production endpoint requires verified institutional authentication token.'
      })
    }

    const verifiedUser = verifyProductionToken(token, authConfig.jwtSecret)
    if (!verifiedUser) {
      return res.status(401).json({
        status: 'error',
        error: 'INVALID_TOKEN',
        message: 'The supplied authentication token is invalid or expired.'
      })
    }

    req.user = Object.freeze(verifiedUser)
    return next()
  }

  // ---- Development Mode ----
  res.setHeader('X-Atlas-Auth-Mode', 'development-simulation')

  const requestedPersonaId = req.headers['x-atlas-dev-persona-id'] || req.headers['x-atlas-user-id']
  if (requestedPersonaId && CANONICAL_PERSONAS[requestedPersonaId]) {
    req.user = CANONICAL_PERSONAS[requestedPersonaId]
  } else {
    // Default safe fallback in development
    req.user = CANONICAL_PERSONAS[1] // Alex Kumar (IT Student)
  }

  next()
}

export default {
  CANONICAL_PERSONAS,
  verifyProductionToken,
  createSignedToken,
  extractIdentity
}
