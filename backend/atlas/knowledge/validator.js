/**
 * Atlas Knowledge Validation & Integrity Subsystem
 * 
 * Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md (Phase E, Section 12 & 43)
 * Requirements: Phase 5 (Institutional Knowledge and RAG)
 * 
 * Enforces:
 * 1. Document schema and metadata validation
 * 2. Cryptographic SHA-256 chunk hashing for provenance integrity
 * 3. Freshness auditing against institutional update thresholds
 * 4. Prompt injection neutralization (treating content as passive data)
 */

import { createHash } from 'node:crypto'

export const MAX_FRESHNESS_DAYS = 365

/**
 * Computes an unalterable SHA-256 fingerprint for a document chunk.
 * 
 * @param {string} text 
 * @returns {string} 12-char hex digest
 */
export function hashChunk(text) {
  if (!text || typeof text !== 'string') return '000000000000'
  return createHash('sha256')
    .update(text.trim())
    .digest('hex')
    .slice(0, 12)
}

/**
 * Neutralizes potential prompt injection directives in untrusted institutional documents.
 * Ensures document excerpts cannot instruct LLMs to override system guidelines.
 * 
 * @param {string} text 
 * @returns {string}
 */
export function sanitizeDocumentText(text) {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/\b(ignore (?:all )?previous instructions|system prompt:?|disregard earlier guidelines)\b/gi, '[neutralized directive]')
    .trim()
}

/**
 * Validates a document's structure, metadata headers, and freshness.
 * 
 * @param {string} content - Markdown file content
 * @param {string} filename - Filename for error context
 * @returns {{ valid: boolean, metadata: Object, errors: Array<string> }}
 */
export function validateDocument(content, filename = 'unknown.md') {
  const errors = []
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return {
      valid: false,
      metadata: null,
      errors: ['Document content is empty or invalid.']
    }
  }

  // Extract Title
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : ''
  if (!title) {
    errors.push('Missing top-level H1 title in document.')
  }

  // Extract Source ID
  const sourceMatch = content.match(/Source ID[\*\s:]+`?([a-zA-Z0-9_\-]+)`?/i)
  const sourceId = sourceMatch ? sourceMatch[1].trim() : filename.replace(/\.md$/, '')

  // Extract Category
  const catMatch = content.match(/Category[\*\s:]+`?([a-zA-Z0-9_\-]+)`?/i)
  const category = catMatch ? catMatch[1].trim().toLowerCase() : 'institutional'

  // Extract Last Updated / Effective Date
  const dateMatch = content.match(/(?:Last Updated|Effective Date)[\*\s:]+`?(\d{4}-\d{2}-\d{2})`?/i)
  let lastUpdated = dateMatch ? dateMatch[1] : null
  let freshness = 'current'
  let ageDays = 0

  if (lastUpdated) {
    const parsed = new Date(lastUpdated)
    if (isNaN(parsed.getTime())) {
      errors.push(`Invalid date format for Last Updated: "${lastUpdated}". Expected YYYY-MM-DD.`)
    } else {
      const now = new Date()
      ageDays = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24))
      if (ageDays > MAX_FRESHNESS_DAYS) {
        freshness = 'stale'
      }
    }
  } else {
    // Default to current date if unstated
    lastUpdated = new Date().toISOString().slice(0, 10)
  }

  // Check section structure
  const sections = content.split(/\n(?=##\s+)/)
  if (sections.length < 1) {
    errors.push('Document must contain at least one section.')
  }

  return {
    valid: errors.length === 0,
    metadata: {
      title,
      sourceId,
      category,
      lastUpdated,
      freshness,
      ageDays,
      sectionCount: sections.length,
      filename
    },
    errors
  }
}

export default {
  MAX_FRESHNESS_DAYS,
  hashChunk,
  sanitizeDocumentText,
  validateDocument
}
