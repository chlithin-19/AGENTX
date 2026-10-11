/**
 * Atlas Security Configuration & Environment Guard
 * 
 * Invariants:
 * 1. If NODE_ENV === 'production' or ATLAS_AUTH_MODE === 'production', development personas are STRICTLY DISABLED.
 * 2. Unsafe startup configuration (e.g. attempting to enable dev personas in production) throws immediately and halts startup.
 * 3. In production mode, client identity headers (x-atlas-dev-persona-id, x-atlas-user-id) are rejected.
 */

export class SecurityConfigurationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'SecurityConfigurationError'
  }
}

/**
 * Validates security configuration flags and enforces environment boundaries.
 * 
 * @param {Object} [env=process.env]
 * @returns {Object} Validated security configuration
 * @throws {SecurityConfigurationError} if configuration is unsafe for production
 */
export function validateSecurityConfig(env = process.env) {
  const isProductionEnv = env.NODE_ENV === 'production'
  const explicitAuthMode = (env.ATLAS_AUTH_MODE || '').toLowerCase()
  const enableDevPersonasFlag = env.ENABLE_DEV_PERSONAS === 'true'

  // If in production, dev personas are strictly forbidden
  if (isProductionEnv && enableDevPersonasFlag) {
    throw new SecurityConfigurationError(
      'FATAL SECURITY CONFIGURATION: Development personas (ENABLE_DEV_PERSONAS=true) cannot be enabled in production environments (NODE_ENV=production).'
    )
  }

  const authMode = (isProductionEnv || explicitAuthMode === 'production') ? 'production' : 'development'
  const enableDevPersonas = authMode === 'production' ? false : (env.ENABLE_DEV_PERSONAS !== 'false')

  return Object.freeze({
    authMode,
    isProduction: authMode === 'production',
    enableDevPersonas,
    jwtSecret: env.ATLAS_JWT_SECRET || null,
    institutionalIdpConfigured: Boolean(env.ATLAS_IDP_URL || env.ATLAS_JWT_SECRET)
  })
}

export const AUTH_CONFIG = validateSecurityConfig()

export default {
  SecurityConfigurationError,
  validateSecurityConfig,
  AUTH_CONFIG
}
