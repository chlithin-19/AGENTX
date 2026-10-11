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
 * Strictly pins alg to HS256, enforces mandatory exp, timing-safe equality,
 * and validates issuer/audience claims.
 * 
 * @param {string} token 
 * @param {string} secret 
 * @param {Object} [options={}]
 * @returns {Object|null} Decoded, verified, and normalized user payload if valid, null otherwise
 */
export function verifyProductionToken(token, secret, options = {}) {
  if (!token || !secret || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [headerB64, payloadB64, signature] = parts

  // 1. Decode header and enforce strict algorithm pinning to HS256
  let header
  try {
    header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (!header || header.alg !== 'HS256' || header.typ !== 'JWT') {
    return null
  }

  // 2. Cryptographic signature check with timingSafeEqual
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url')

  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expectedSig)
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null
  }

  // 3. Decode and validate payload claims
  let payload
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  if (!payload || typeof payload !== 'object') return null

  // Mandatory numeric expiration check (token MUST have exp claim in the future)
  if (typeof payload.exp !== 'number' || Date.now() >= payload.exp * 1000) {
    return null
  }

  // Not Before (nbf) check if present
  if (typeof payload.nbf === 'number' && Date.now() < payload.nbf * 1000) {
    return null
  }

  // Issuer (iss) check if configured
  const expectedIssuer = options.issuer || AUTH_CONFIG.jwtIssuer
  if (expectedIssuer && payload.iss !== expectedIssuer) {
    return null
  }

  // Audience (aud) check if configured
  const expectedAudience = options.audience || AUTH_CONFIG.jwtAudience
  if (expectedAudience && payload.aud !== expectedAudience) {
    return null
  }

  // Valid identity binding claim required (id, studentId, or sub)
  const id = payload.id ?? payload.studentId ?? payload.sub
  if (id === undefined || id === null) {
    return null
  }

  // Return normalized user object
  return Object.freeze({
    ...payload,
    id,
    studentId: payload.studentId ?? (payload.role === 'student' ? Number(id) : undefined)
  })
}

/**
 * Create a signed production token for valid test sessions or server-minted tokens.
 * 
 * @param {Object} user 
 * @param {string} secret 
 * @param {number} [expiresInSeconds=3600] 
 * @param {Object} [options={}]
 * @returns {string} Signed JWT-compatible token
 */
export function createSignedToken(user, secret, expiresInSeconds = 3600, options = {}) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    ...(options.issuer || AUTH_CONFIG.jwtIssuer ? { iss: options.issuer || AUTH_CONFIG.jwtIssuer } : {}),
    ...(options.audience || AUTH_CONFIG.jwtAudience ? { aud: options.audience || AUTH_CONFIG.jwtAudience } : {})
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
