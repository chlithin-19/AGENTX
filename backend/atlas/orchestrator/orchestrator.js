/**
 * Atlas Campus Multi-Agent Orchestrator
 * 
 * Architecture Reference: AGENTX_TO_ATLAS_ARCHITECTURE_v2.md (Phase A, Sections 4 & 5)
 * Requirements: Phase A, G, H, I
 * 
 * Responsibilities:
 * 1. Understand incoming natural-language user query.
 * 2. Intent decomposition: Identify single- or multi-agent routing.
 * 3. Construct an executable, transparent task plan.
 * 4. Execute agents sequentially with safe error isolation.
 * 5. Return a unified, structured Atlas response containing markdown summary, citations, and actions.
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
 * Detect which agent(s) should handle the user query.
 * Supports multi-intent detection for sequential multi-agent execution.
 * 
 * @param {string} query 
 * @returns {Array<string>} List of agent keys in execution order
 */
export function routeQuery(query) {
  if (!query || typeof query !== 'string') return []
  const q = query.toLowerCase()

  const detected = []

  // Check Academic Agent
  // e.g. "academic profile", "attendance", "cgpa", "backlogs", "skills", "placement", "internships"
  if (academicAgent.canHandle(q)) {
    detected.push('academic')
  }

  // Check Campus Agent
  // e.g. "facilities", "library", "lab 204", "classroom", "maintenance", "shuttle", "cafeteria"
  if (campusAgent.canHandle(q)) {
    detected.push('campus')
  }

  // Check Event Agent
  // e.g. "events", "hackathon", "workshop", "career fair", "upcoming"
  if (eventAgent.canHandle(q)) {
    detected.push('event')
  }

  // Check Communication Agent
  // e.g. "draft message", "send email", "announcements", "notifications", "circulars"
  if (communicationAgent.canHandle(q)) {
    detected.push('communication')
  }

  return detected
}

/**
 * Helper to check if a query belongs to the Atlas campus domain.
 */
export function isAtlasQuery(query) {
  return routeQuery(query).length > 0
}

/**
 * Main Orchestration Entrypoint.
 * 
 * @param {Object} params
 * @param {string} params.message - The natural language inquiry from the user
 * @param {Object} [params.user] - Optional user context (student profile / session)
 * @returns {Promise<Object>} Unified Atlas response payload
 */
export async function orchestrate({ message, user = null }) {
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
  const detectedAgents = routeQuery(query)

  // Fallback: If no specific agent matched, check knowledge retriever for general campus info
  if (detectedAgents.length === 0) {
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
          text: `### Campus Knowledge Retrieval (Demo)\n\n${ragResult.formattedContext}`,
          agentSummaries: [ragResult.formattedContext]
        },
        citations: ragResult.citations,
        actions: [],
        timestamp: new Date().toISOString(),
        executionMs: Date.now() - startTime
      }
    }

    // Default friendly guide when query is out of campus scope
    return {
      workflowId,
      status: 'completed',
      intents: ['general_inquiry'],
      plan: {
        planId: `plan_${Date.now()}`,
        totalTasks: 0,
        tasks: []
      },
      response: {
        text: `### Atlas Campus AI Multi-Agent System\n\n` +
          `I can assist you across four specialized campus domains:\n` +
          `1. **Academic Agent:** View your attendance, CGPA, backlogs, coding skills, and placement readiness.\n` +
          `2. **Campus Agent:** Locate buildings/rooms, check facility hours (Library, Cafeteria, Sports), and report maintenance issues.\n` +
          `3. **Event Agent:** Discover upcoming campus events, hackathons, and technical workshops.\n` +
          `4. **Communication Agent:** View official announcements, circulars, and draft formal campus inquiries.\n\n` +
          `*Example: "Show my academic profile and tell me about upcoming events."*`,
        agentSummaries: []
      },
      citations: [],
      actions: [],
      timestamp: new Date().toISOString(),
      executionMs: Date.now() - startTime
    }
  }

  // 1. Create Task Plan
  const planId = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const tasks = detectedAgents.map((agentKey, idx) => ({
    id: `task_${idx + 1}`,
    agent: agentKey,
    action: `resolve_${agentKey}_intent`,
    status: 'pending',
    input: { query }
  }))

  const plan = {
    planId,
    totalTasks: tasks.length,
    tasks
  }

  // 2. Sequential Execution with safe fault isolation (Phase I)
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
      const result = await agent.execute(task, { message: query, user })
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
        message: `Unable to complete ${task.agent} agent task.`,
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
    intents: detectedAgents,
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
  routeQuery,
  isAtlasQuery,
  orchestrate
}
