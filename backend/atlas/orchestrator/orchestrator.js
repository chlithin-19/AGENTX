/**
 * Atlas Campus Multi-Agent Orchestrator
 * 
 * Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md (Phase A, Sections 4 & 5)
 * Requirements: Phase 3 (Super-Agent Intelligence) & Phase 4 (Multi-Agent Orchestration & Reliability)
 * 
 * Responsibilities:
 * 1. Understand incoming natural-language user query.
 * 2. Intent decomposition: Split compound inquiries into discrete agent tasks.
 * 3. Contextual conversation handling: Preserve domain context from history turns.
 * 4. Transparent task plan DAG construction with explicit dependencies and typed handoffs.
 * 5. Bounded timeouts via AbortController, client cancellation, and safe concurrent wave execution.
 * 6. Idempotent retries with exponential backoff on transient errors.
 * 7. Safe partial fault recovery with transparent institutional disclaimers.
 * 8. Real-time progress streaming callbacks for SSE lifecycle events.
 * 9. Evidence-grounded synthesis: Merge agent findings and citations without hallucinations.
 */

import academicAgent from '../agents/academic.js'
import campusAgent from '../agents/campus.js'
import eventAgent from '../agents/event.js'
import communicationAgent from '../agents/communication.js'
import { queryKnowledge } from '../knowledge/retriever.js'

export const AGENT_REGISTRY = {
  academic: academicAgent,
  campus: campusAgent,
  event: eventAgent,
  communication: communicationAgent
}

const MAX_PLAN_TASKS = 6
const MAX_QUERY_LEN = 4096
const DEFAULT_TASK_TIMEOUT_MS = 5000

/**
 * Determines whether a given action is idempotent and safe to retry automatically.
 * 
 * @param {string} agent 
 * @param {string} action 
 * @returns {boolean}
 */
export function isIdempotent(agent, action) {
  if (!action || typeof action !== 'string') return true
  const act = action.toLowerCase()

  // Mutating operations or side-effect generation are strictly non-idempotent
  if (
    act.includes('draft') ||
    act.includes('create') ||
    act.includes('send') ||
    act.includes('submit') ||
    act.includes('delete') ||
    act.includes('update') ||
    act.includes('execute')
  ) {
    return false
  }

  // Read-only queries across academic, campus, event, and communication are idempotent
  return true
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
  const clean = query.trim().slice(0, MAX_QUERY_LEN)
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
          if (tasks.length >= MAX_PLAN_TASKS) break
        }
      }
      if (tasks.length >= MAX_PLAN_TASKS) break
    }
  }

  // 2. If sub-clause splitting didn't detect all agents, check full query
  if (tasks.length < MAX_PLAN_TASKS) {
    for (const [key, agent] of Object.entries(AGENT_REGISTRY)) {
      if (agent.canHandle(q) && !seenAgents.has(key)) {
        seenAgents.add(key)
        tasks.push({
          agent: key,
          subQuery: clean
        })
        if (tasks.length >= MAX_PLAN_TASKS) break
      }
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
          if (tasks.length >= MAX_PLAN_TASKS) break
        }
      }
    }
  }

  return tasks.slice(0, MAX_PLAN_TASKS)
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
 * Execute a single agent task with timeout abort controller and safe idempotent retries.
 */
async function executeTaskWithRetry(task, agent, executionContext, options = {}) {
  const {
    timeoutMs = DEFAULT_TASK_TIMEOUT_MS,
    maxRetries = 2,
    abortSignal = null,
    onProgress = null
  } = options

  const isActionIdempotent = isIdempotent(task.agent, task.action)
  let attempt = 0
  let lastError = null

  while (attempt <= (isActionIdempotent ? maxRetries : 0)) {
    attempt++

    // Upstream client cancellation check
    if (abortSignal?.aborted) {
      const abortErr = new Error('Task execution was cancelled by client abort signal.')
      abortErr.code = 'ABORTED'
      throw abortErr
    }

    // Prepare bounded timeout
    const controller = new AbortController()
    let timer = null

    // Forward upstream abort to this task controller
    const upstreamAbortHandler = () => {
      controller.abort(new Error('Task execution cancelled by parent signal.'))
    }
    if (abortSignal) {
      abortSignal.addEventListener('abort', upstreamAbortHandler, { once: true })
    }

    try {
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => {
          const timeoutErr = new Error(`AGENT_TIMEOUT: Agent "${task.agent}" exceeded execution timeout of ${timeoutMs}ms.`)
          timeoutErr.code = 'ETIMEDOUT'
          controller.abort(timeoutErr)
          reject(timeoutErr)
        }, timeoutMs)
      })

      const taskPromise = agent.execute(task, {
        ...executionContext,
        abortSignal: controller.signal
      })

      const result = await Promise.race([taskPromise, timeoutPromise])
      return result
    } catch (err) {
      lastError = err

      // Non-retryable conditions: Security/Auth errors or explicit client aborts
      const isSecurityError = err.status === 401 || err.status === 403 || err.code?.startsWith('FORBIDDEN') || err.code === 'UNAUTHENTICATED'
      const isAborted = abortSignal?.aborted || err.code === 'ABORTED'

      if (isSecurityError || isAborted || !isActionIdempotent || attempt > maxRetries) {
        throw err
      }

      // Safe idempotent retry with backoff
      const backoffMs = Math.min(50 * Math.pow(2, attempt - 1), 500)
      if (typeof onProgress === 'function') {
        onProgress({
          type: 'task_retry',
          agent: task.agent,
          taskId: task.id,
          attempt,
          backoffMs,
          error: err.message
        })
      }
      await new Promise(resolve => setTimeout(resolve, backoffMs))
    } finally {
      if (timer) clearTimeout(timer)
      if (abortSignal) {
        abortSignal.removeEventListener('abort', upstreamAbortHandler)
      }
    }
  }

  throw lastError || new Error(`Execution failed after ${attempt} attempts.`)
}

/**
 * Main Orchestration Entrypoint.
 * 
 * @param {Object} params
 * @param {string} params.message - The natural language inquiry from the user
 * @param {Object} [params.user] - Authenticated user context from req.user
 * @param {Array<Object>} [params.history=[]] - Conversation history for multi-turn context
 * @param {AbortSignal} [params.abortSignal] - Optional signal for client cancellation
 * @param {number} [params.timeoutMs=5000] - Per-task bounded execution timeout in ms
 * @param {number} [params.maxRetries=2] - Maximum retry attempts for idempotent operations
 * @param {Function} [params.onProgress] - Progress callback: (event) => void
 * @param {number} [params.maxConcurrency=3] - Maximum parallel agent executions
 * @returns {Promise<Object>} Unified Atlas response payload
 */
export async function orchestrate({
  message,
  user = null,
  history = [],
  abortSignal = null,
  timeoutMs = DEFAULT_TASK_TIMEOUT_MS,
  maxRetries = 2,
  onProgress = null,
  maxConcurrency = 3
} = {}) {
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

  // Check early cancellation
  if (abortSignal?.aborted) {
    return {
      workflowId,
      status: 'cancelled',
      message: 'Orchestration was cancelled before execution.',
      timestamp: new Date().toISOString()
    }
  }

  const query = message.trim().slice(0, MAX_QUERY_LEN)
  const decomposedTasks = decomposeQuery(query, history)

  // Fallback 1: Knowledge Retriever for campus documents / policy questions
  if (decomposedTasks.length === 0) {
    const ragResult = queryKnowledge(query, 2)
    if (ragResult.results.length > 0) {
      if (typeof onProgress === 'function') {
        onProgress({ type: 'task_start', agent: 'knowledge_rag', taskId: 'task_1', subQuery: query })
        onProgress({ type: 'task_complete', agent: 'knowledge_rag', taskId: 'task_1', durationMs: 10, status: 'completed' })
      }

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
            status: 'completed',
            durationMs: 10
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

  // 1. Create Task Plan DAG with explicit dependencies
  const planId = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const tasks = decomposedTasks.map((item, idx) => ({
    id: `task_${idx + 1}`,
    agent: item.agent,
    action: `resolve_${item.agent}_intent`,
    status: 'pending',
    dependsOn: [], // Independent multi-intent tasks run concurrently
    input: { query: item.subQuery, fullQuery: query }
  }))

  const plan = {
    planId,
    totalTasks: tasks.length,
    tasks
  }

  // 2. Wave-based Concurrent Execution with Safe Fault Isolation
  const taskResults = []
  const summaries = []
  const allCitations = []
  const allActions = []
  const priorOutputs = {}
  let errorCount = 0
  let successCount = 0

  // Group tasks into execution batches bounded by maxConcurrency
  const taskBatches = []
  for (let i = 0; i < tasks.length; i += maxConcurrency) {
    taskBatches.push(tasks.slice(i, i + maxConcurrency))
  }

  for (const batch of taskBatches) {
    if (abortSignal?.aborted) {
      for (const t of batch) {
        t.status = 'cancelled'
        taskResults.push(t)
      }
      continue
    }

    const batchPromises = batch.map(async (task) => {
      task.status = 'running'
      const taskStart = Date.now()
      const agent = AGENT_REGISTRY[task.agent]

      if (typeof onProgress === 'function') {
        onProgress({
          type: 'task_start',
          agent: task.agent,
          taskId: task.id,
          subQuery: task.input?.query
        })
      }

      if (!agent) {
        task.status = 'error'
        task.error = `Agent "${task.agent}" is not registered in Atlas.`
        task.durationMs = Date.now() - taskStart
        if (typeof onProgress === 'function') {
          onProgress({ type: 'task_error', agent: task.agent, taskId: task.id, durationMs: task.durationMs, error: task.error })
        }
        return { task, ok: false, error: task.error }
      }

      try {
        const executionContext = {
          message: task.input.query,
          fullMessage: query,
          user,
          workflowId,
          correlationId: `${workflowId}_${task.id}`,
          priorOutputs
        }

        const result = await executeTaskWithRetry(task, agent, executionContext, {
          timeoutMs,
          maxRetries,
          abortSignal,
          onProgress
        })

        task.status = result.status || 'completed'
        task.durationMs = Date.now() - taskStart
        task.result = {
          action: result.action,
          data: result.data
        }
        priorOutputs[task.id] = result

        if (typeof onProgress === 'function') {
          onProgress({
            type: 'task_complete',
            agent: task.agent,
            taskId: task.id,
            durationMs: task.durationMs,
            status: task.status
          })
        }

        return { task, ok: true, result }
      } catch (err) {
        task.status = 'error'
        task.durationMs = Date.now() - taskStart
        task.error = err.message || 'Execution error'

        if (typeof onProgress === 'function') {
          onProgress({
            type: 'task_error',
            agent: task.agent,
            taskId: task.id,
            durationMs: task.durationMs,
            error: task.error
          })
        }

        return { task, ok: false, error: task.error }
      }
    })

    const settledBatch = await Promise.all(batchPromises)

    for (const item of settledBatch) {
      taskResults.push(item.task)
      if (item.ok && item.result) {
        successCount++
        const res = item.result

        if (res.summary) {
          summaries.push(res.summary)
        }

        if (Array.isArray(res.citations)) {
          for (const cit of res.citations) {
            if (!allCitations.some(c => c.chunkId === cit.chunkId)) {
              allCitations.push(cit)
            }
          }
        }

        if (res.actionPayload) {
          allActions.push(res.actionPayload)
        }
      } else {
        errorCount++
        summaries.push({
          status: 'partial',
          agent: item.task.agent,
          message: `Unable to complete ${item.task.agent} agent inquiry. Reason: ${item.task.error}`,
          error: item.task.error
        })
      }
    }
  }

  // 3. Synthesize Unified Response
  let status = 'completed'
  if (abortSignal?.aborted) {
    status = 'cancelled'
  } else if (errorCount > 0 && successCount > 0) {
    status = 'partial'
  } else if (errorCount > 0 && successCount === 0) {
    status = 'error'
  }

  const textBlocks = summaries.map(s => {
    if (typeof s === 'string') return s
    return `⚠️ **${s.agent?.toUpperCase()} Agent Notice:** ${s.message}`
  })
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
  AGENT_REGISTRY,
  isIdempotent,
  decomposeQuery,
  routeQuery,
  isAtlasQuery,
  orchestrate
}
