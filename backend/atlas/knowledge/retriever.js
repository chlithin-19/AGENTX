/**
 * Atlas Knowledge Retrieval Layer (RAG Subsystem)
 * 
 * Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md (Section 12 & 43)
 * 
 * Performs semantic chunk retrieval over authoritative demo campus documentation.
 * Returns relevant excerpt chunks and structured source citations.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = join(__dirname, 'documents')

let cachedChunks = null

// Simple stop-word filter to enhance keyword retrieval relevance
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'is', 'are', 'was', 'were', 'what', 'where', 'when', 'how', 'which', 'who',
  'can', 'tell', 'me', 'about', 'available', 'some', 'there', 'please', 'i'
])

/**
 * Load and segment all Markdown documents in the knowledge directory into section chunks.
 */
function loadChunks() {
  if (cachedChunks) return cachedChunks
  if (!existsSync(DOCS_DIR)) return []

  const files = readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'))
  const chunks = []

  for (const file of files) {
    const filePath = join(DOCS_DIR, file)
    const content = readFileSync(filePath, 'utf-8')
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : file.replace('.md', '')
    const sourceMatch = content.match(/Source ID:\s*`([^`]+)`/i)
    const sourceId = sourceMatch ? sourceMatch[1] : file.replace('.md', '')

    // Split document by section headers (## Section)
    const sections = content.split(/\n(?=##\s+)/)
    for (let i = 0; i < sections.length; i++) {
      const sectionText = sections[i].trim()
      if (!sectionText) continue
      const headerMatch = sectionText.match(/^##\s+(.+)$/m)
      const sectionHeader = headerMatch ? headerMatch[1].trim() : 'General'

      chunks.push({
        chunkId: `${sourceId}_sec_${i + 1}`,
        documentId: sourceId,
        title,
        section: sectionHeader,
        filename: file,
        content: sectionText
      })
    }
  }

  cachedChunks = chunks
  return cachedChunks
}

/**
 * Retrieve top relevant chunks for a campus knowledge query with source citations.
 * 
 * @param {string} query - The natural language inquiry
 * @param {number} topK - Maximum number of chunks to return (default 2)
 * @returns {{ results: Array, citations: Array, formattedContext: string }}
 */
export function queryKnowledge(query, topK = 2) {
  const chunks = loadChunks()
  if (!chunks.length || !query?.trim()) {
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

  // Filter to matching chunks and sort descending by score
  const matches = scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  const citations = matches.map(m => ({
    documentId: m.documentId,
    title: m.title,
    section: m.section,
    chunkId: m.chunkId
  }))

  const formattedContext = matches.map((m, idx) => 
    `[Source: ${m.title} — ${m.section}]\n${m.content}`
  ).join('\n\n')

  return {
    results: matches,
    citations,
    formattedContext
  }
}
