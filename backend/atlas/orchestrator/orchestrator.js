/**
 * Atlas Campus Multi-Agent Orchestrator
 * 
 * Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md (Phase A, Sections 4 & 5)
 * Requirements: Phase 3 (Super-Agent Intelligence, Multi-Intent Decomposition, Grounded Synthesis)
 * 
 * Responsibilities:
 * 1. Understand incoming natural-language user query.
 * 2. Intent decomposition: Split compound inquiries into discrete agent tasks.
 * 3. Contextual conversation handling: Preserve domain context from history turns.
 * 4. Transparent task plan DAG construction.
 * 5. Sequential execution with safe fault isolation.
 * 6. Evidence-grounded synthesis: Merge agent findings and knowledge citations without hallucinations.
 */

import academicAgent from '../agents/academic.js'
import campusAgent from '../agents/campus.js'
import eventAgent from '../agents/event.js'
import communicationAgent from '../agents/communication.js'
import { queryKnowledge } from '../knowledge/retriever.js'

const AGENT_REGISTRY = {
  academic: academicAgent,
  campus: campusAgent,
  event: eventAgent,
  communication: communicationAgent
}

/**
 * Decomposes a user query into discrete agent tasks with targeted sub-queries.
 * Supports multi-intent compound sentences and contextual history resolution.
 * 
 * @param {string} query 
 * @param {Array<Object>} [history=[]] - Previous conversation turns [{ role, content }]
 * @returns {Array<{ agent: string, subQuery: string, contextual?: boolean }>}
 */
export function decomposeQuery(query, history = []) {
  if (!query || typeof query !== 'string') return []
  const clean = query.trim()
  const q = clean.toLowerCase()

  const tasks = []
  const seenAgents = new Set()

  // 1. Check for compound multi-intent clauses separated by conjunctions/punctuation
  const clauseDelimiters = /\b(?:and\s+also|as\s+well\s+as|and|also|\.|\;|\bthen\b)\b/i
  const rawClauses = clean
    .split(clauseDelimiters)
    .map(c => c.trim())
    .filter(c => c.length > 2)

  if (rawClauses.length > 1) {
    for (const clause of rawClauses) {
      const clauseLower = clause.toLowerCase()
      for (const [key, agent] of Object.entries(AGENT_REGISTRY)) {
        if (agent.canHandle(clauseLower) && !seenAgents.has(key)) {
          seenAgents.add(key)
          tasks.push({
            agent: key,
            subQuery: clause
          })
        }
      }
    }
  }

  // 2. If sub-clause splitting didn't detect all agents, check full query
  for (const [key, agent] of Object.entries(AGENT_REGISTRY)) {
    if (agent.canHandle(q) && !seenAgents.has(key)) {
      seenAgents.add(key)
      tasks.push({
        agent: key,
        subQuery: clean
      })
    }
  }

  // 3. Contextual conversation memory: Resolve follow-up inquiries using history
  if (tasks.length === 0 && Array.isArray(history) && history.length > 0) {
    const recentTurn = [...history].reverse().find(m => m.role === 'user' || m.role === 'assistant')
    if (recentTurn && recentTurn.content) {
      const combined = `${recentTurn.content} ${clean}`.toLowerCase()
      for (const [key, agent] of Object.entries(AGENT_REGISTRY)) {
        if (agent.canHandle(combined) && !seenAgents.has(key)) {
          seenAgents.add(key)
          tasks.push({
            agent: key,
            subQuery: clean,
            contextual: true
          })
        }
      }
    }
  }

  return tasks
}

/**
 * Detect which agent(s) should handle the user query.
 * 
 * @param {string} query 
 * @param {Array<Object>} [history=[]]
 * @returns {Array<string>} List of agent keys in execution order
 */
export function routeQuery(query, history = []) {
  return decomposeQuery(query, history).map(t => t.agent)
}

/**
 * Helper to check if a query belongs to the Atlas campus domain.
 */
export function isAtlasQuery(query, history = []) {
  return decomposeQuery(query, history).length > 0
}

/**
 * Main Orchestration Entrypoint.
 * 
 * @param {Object} params
 * @param {string} params.message - The natural language inquiry from the user
 * @param {Object} [params.user] - Authenticated user context from req.user
 * @param {Array<Object>} [params.history=[]] - Conversation history for multi-turn context
 * @returns {Promise<Object>} Unified Atlas response payload
 */
export async function orchestrate({ message, user = null, history = [] }) {
  const startTime = Date.now()
  const workflowId = `wf_atlas_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

  if (!message || !message.trim()) {
    return {
      workflowId,
      status: 'error',
      message: 'Message is required for Atlas orchestration.',
      error: 'EMPTY_INPUT',
      timestamp: new Date().toISOString()
    }
  }

  const query = message.trim()
  const decomposedTasks = decomposeQuery(query, history)

  // Fallback 1: Knowledge Retriever for campus documents / policy questions
  if (decomposedTasks.length === 0) {
    const ragResult = queryKnowledge(query, 2)
    if (ragResult.results.length > 0) {
      return {
        workflowId,
        status: 'completed',
        intents: ['knowledge_retrieval'],
        plan: {
          planId: `plan_${Date.now()}`,
          totalTasks: 1,
          tasks: [{
            id: 'task_1',
            agent: 'knowledge_rag',
            action: 'query_campus_documents',
            status: 'completed'
          }]
        },
        response: {
          text: `### Campus Policy & Guidelines Information\n\n${ragResult.formattedContext}`,
          agentSummaries: [ragResult.formattedContext]
        },
        citations: ragResult.citations,
        actions: [],
        timestamp: new Date().toISOString(),
        executionMs: Date.now() - startTime
      }
    }

    // Fallback 2: Honest explanation for out-of-scope / unsupported questions
    return {
      workflowId,
      status: 'out_of_scope',
      intents: ['out_of_scope'],
      plan: {
        planId: `plan_${Date.now()}`,
        totalTasks: 0,
        tasks: []
      },
      response: {
        text: `### Atlas Institutional Boundary Notice\n\n` +
          `Your question falls outside supported campus domains. Atlas is strictly specialized for higher-education campus operations, authenticated student academic standing, physical facilities, event schedules, and official circulars. I do not invent or extrapolate general trivia.\n\n` +
          `**Supported Campus Domains:**\n` +
          `1. **Academic Standing:** Attendance audits, CGPA standing, active backlogs, coding skills, placement stats.\n` +
          `2. **Campus Facilities:** Library hours, Dining hall schedules, classroom locations (e.g. Lab 204), maintenance requests.\n` +
          `3. **Events & Calendar:** Hackathon 2026, GenAI workshops, career fairs, registration deadlines.\n` +
          `4. **Communications:** Official circulars (#104, #98, #22), administrative advisories, message drafting.\n\n` +
          `*Please ask a question related to your campus profile or institutional services.*`,
        agentSummaries: []
      },
      citations: [],
      actions: [],
      timestamp: new Date().toISOString(),
      executionMs: Date.now() - startTime
    }
  }

  // 1. Create Task Plan with decomposed sub-queries
  const planId = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const tasks = decomposedTasks.map((item, idx) => ({
    id: `task_${idx + 1}`,
    agent: item.agent,
    action: `resolve_${item.agent}_intent`,
    status: 'pending',
    input: { query: item.subQuery, fullQuery: query }
  }))

  const plan = {
    planId,
    totalTasks: tasks.length,
    tasks
  }

  // 2. Sequential Execution with safe fault isolation
  const taskResults = []
  const summaries = []
  const allCitations = []
  const allActions = []
  let errorCount = 0
  let successCount = 0

  for (const task of tasks) {
    task.status = 'running'
    const agent = AGENT_REGISTRY[task.agent]

    if (!agent) {
      task.status = 'error'
      task.error = `Agent "${task.agent}" is not registered.`
      errorCount++
      taskResults.push(task)
      continue
    }

    try {
      const result = await agent.execute(task, { message: task.input.query, fullMessage: query, user })
      task.status = result.status || 'completed'
      task.result = {
        action: result.action,
        data: result.data
      }
      successCount++

      if (result.summary) {
        summaries.push(result.summary)
      }

      if (Array.isArray(result.citations)) {
        for (const cit of result.citations) {
          if (!allCitations.some(c => c.chunkId === cit.chunkId)) {
            allCitations.push(cit)
          }
        }
      }

      if (result.actionPayload) {
        allActions.push(result.actionPayload)
      }

      taskResults.push(task)
    } catch (err) {
      errorCount++
      task.status = 'error'
      task.error = err.message || 'Execution error'
      taskResults.push(task)

      summaries.push({
        status: 'partial',
        agent: task.agent,
        message: `Unable to complete ${task.agent} agent inquiry.`,
        error: err.message
      })
    }
  }

  // 3. Synthesize Unified Response
  let status = 'completed'
  if (errorCount > 0 && successCount > 0) {
    status = 'partial'
  } else if (errorCount > 0 && successCount === 0) {
    status = 'error'
  }

  const textBlocks = summaries.map(s => typeof s === 'string' ? s : `⚠️ **${s.agent?.toUpperCase()} Agent Notice:** ${s.message}`)
  let unifiedText = textBlocks.join('\n\n---\n\n')

  // Append knowledge citations if present
  if (allCitations.length > 0) {
    unifiedText += '\n\n**Verified Campus Citations:**\n' +
      allCitations.map(c => `- *${c.title}* (${c.section}) \`[${c.chunkId}]\``).join('\n')
  }

  return {
    workflowId,
    status,
    query,
    intents: decomposedTasks.map(t => t.agent),
    plan: {
      planId,
      totalTasks: tasks.length,
      tasks: taskResults
    },
    response: {
      text: unifiedText,
      agentSummaries: summaries
    },
    citations: allCitations,
    actions: allActions,
    timestamp: new Date().toISOString(),
    executionMs: Date.now() - startTime
  }
}

export default {
  decomposeQuery,
  routeQuery,
  isAtlasQuery,
  orchestrate
}
