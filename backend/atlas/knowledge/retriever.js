/**
 * Atlas Knowledge Retrieval Layer (RAG Subsystem)
 * 
 * Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md (Phase E, Section 12 & 43)
 * Requirements: Phase 5 (Institutional Knowledge and RAG)
 * 
 * Capabilities:
 * - Structural schema validation of all campus Markdown documents before indexing.
 * - Cryptographic SHA-256 chunk hashing for provenance verification.
 * - Freshness tracking (auditing document age against institutional thresholds).
 * - Neutralization of potential prompt injection directives in document content.
 * - Relevance thresholding preventing hallucinated or low-confidence matches.
 * - Source citations carrying tamper-evident chunk fingerprints and update timestamps.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateDocument, hashChunk, sanitizeDocumentText } from './validator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = join(__dirname, 'documents')

let cachedChunks = null
let cachedCatalog = null

// Stop-word filter to enhance keyword retrieval relevance
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'is', 'are', 'was', 'were', 'what', 'where', 'when', 'how', 'which', 'who',
  'can', 'tell', 'me', 'about', 'available', 'some', 'there', 'please', 'i'
])

const MIN_RELEVANCE_SCORE = 3.0

/**
 * Invalidate the memory cache (useful for testing or after document ingestion).
 */
export function invalidateKnowledgeCache() {
  cachedChunks = null
  cachedCatalog = null
}

/**
 * Loads, validates, segments, and indexes all Markdown documents in the knowledge directory.
 * 
 * @returns {Array<Object>} List of verified semantic chunks
 */
export function loadChunks() {
  if (cachedChunks) return cachedChunks
  if (!existsSync(DOCS_DIR)) return []

  const files = readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'))
  const chunks = []
  const catalog = []

  for (const file of files) {
    const filePath = join(DOCS_DIR, file)
    const rawContent = readFileSync(filePath, 'utf-8')

    // Validate document schema and extract metadata
    const validation = validateDocument(rawContent, file)
    if (!validation.valid) {
      console.warn(`[Knowledge Warning] Skipping invalid document "${file}":`, validation.errors)
      continue
    }

    const { metadata } = validation
    catalog.push(metadata)

    // Split document by section headers (## Section)
    const sections = rawContent.split(/\n(?=##\s+)/)
    for (let i = 0; i < sections.length; i++) {
      const rawSection = sections[i].trim()
      if (!rawSection) continue

      const headerMatch = rawSection.match(/^##\s+(.+)$/m)
      const sectionHeader = headerMatch ? headerMatch[1].trim() : 'General Guidelines'

      // Neutralize potential prompt injection directives before storing
      const sanitizedContent = sanitizeDocumentText(rawSection)
      const chunkHash = hashChunk(sanitizedContent)

      chunks.push({
        chunkId: `${metadata.sourceId}_sec_${i + 1}`,
        chunkHash,
        documentId: metadata.sourceId,
        title: metadata.title,
        category: metadata.category,
        section: sectionHeader,
        filename: file,
        lastUpdated: metadata.lastUpdated,
        freshness: metadata.freshness,
        content: sanitizedContent
      })
    }
  }

  cachedChunks = chunks
  cachedCatalog = catalog
  return cachedChunks
}

/**
 * Retrieves the catalog of verified institutional knowledge documents.
 * 
 * @returns {Array<Object>}
 */
export function getKnowledgeCatalog() {
  if (!cachedCatalog) {
    loadChunks()
  }
  return cachedCatalog || []
}

/**
 * Retrieve top relevant chunks for a campus knowledge query with verified source citations.
 * 
 * @param {string} query - The natural language inquiry
 * @param {number} topK - Maximum number of chunks to return (default 2)
 * @returns {{ results: Array, citations: Array, formattedContext: string, freshnessWarning?: string }}
 */
export function queryKnowledge(query, topK = 2) {
  const chunks = loadChunks()
  if (!chunks.length || !query || typeof query !== 'string' || !query.trim()) {
    return { results: [], citations: [], formattedContext: '' }
  }

  // Tokenize query words
  const terms = query.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t))

  if (!terms.length) {
    return { results: [], citations: [], formattedContext: '' }
  }

  // Score each chunk based on term frequency and header matches
  const scored = chunks.map(chunk => {
    const textLower = chunk.content.toLowerCase()
    const sectionLower = chunk.section.toLowerCase()
    const titleLower = chunk.title.toLowerCase()
    let score = 0

    for (const term of terms) {
      if (sectionLower.includes(term)) score += 5 // strong boost for section header match
      if (titleLower.includes(term)) score += 3   // boost for document title match
      if (textLower.includes(term)) {
        const matches = (textLower.match(new RegExp(`\\b${term}\\b`, 'g')) || []).length
        score += Math.min(matches, 3) * 1.5
      }
    }

    return { ...chunk, score }
  })

  // Filter to matching chunks satisfying minimum relevance threshold and sort descending
  const matches = scored
    .filter(c => c.score >= MIN_RELEVANCE_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  if (!matches.length) {
    return { results: [], citations: [], formattedContext: '' }
  }

  const citations = matches.map(m => ({
    documentId: m.documentId,
    title: m.title,
    section: m.section,
    chunkId: m.chunkId,
    chunkHash: m.chunkHash,
    category: m.category,
    lastUpdated: m.lastUpdated,
    freshness: m.freshness
  }))

  // Detect stale documents and format institutional freshness disclaimer
  const staleDocs = citations.filter(c => c.freshness === 'stale')
  let freshnessWarning = null
  if (staleDocs.length > 0) {
    freshnessWarning = `⚠️ Note: One or more referenced documents were last updated over 12 months ago (${staleDocs.map(d => d.title).join(', ')}). Please verify with institutional administrative offices for current semester amendments.`
  }

  const formattedContext = matches.map((m) => 
    `[Source: ${m.title} — ${m.section} | ID: ${m.chunkId} | Fingerprint: #${m.chunkHash}]\n${m.content}`
  ).join('\n\n')

  return {
    results: matches,
    citations,
    formattedContext,
    freshnessWarning
  }
}

export default {
  loadChunks,
  getKnowledgeCatalog,
  queryKnowledge,
  invalidateKnowledgeCache
}
