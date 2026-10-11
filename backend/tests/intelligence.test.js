/**
 * Atlas Super-Agent Intelligence & Question Answering Test Suite
 * 
 * Tests for:
 * 1. Intent Classification & Sub-Query Decomposition
 * 2. Multi-Intent Compound Query Orchestration
 * 3. Contextual Conversation Memory & Follow-Up Inquiries
 * 4. Grounded Domain Answers (Academic, Campus, Events, Communications)
 * 5. Honest Boundary Handling for Out-of-Domain Questions
 * 6. Authorization-Enforced Query Boundaries
 */

import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'

import {
  decomposeQuery,
  routeQuery,
  isAtlasQuery,
  orchestrate
} from '../atlas/orchestrator/orchestrator.js'
import { getCampusRepositories } from '../atlas/campus/repositories/index.js'
import { CANONICAL_PERSONAS } from '../atlas/security/index.js'

describe('1. Intent Classification & Sub-Query Decomposition', () => {
  test('accurately classifies single-intent inquiries across all 4 agents', () => {
    assert.deepEqual(routeQuery('What is my attendance percentage?'), ['academic'])
    assert.deepEqual(routeQuery('Where is the campus library located?'), ['campus'])
    assert.deepEqual(routeQuery('Tell me about upcoming hackathons and workshops'), ['event'])
    assert.deepEqual(routeQuery('Show me official circulars and notices'), ['communication'])
  })

  test('decomposes compound multi-intent sentences into discrete sub-queries', () => {
    const compound = 'Check my attendance, and tell me what time the library closes'
    const decomposed = decomposeQuery(compound)

    assert.equal(decomposed.length, 2, 'Should detect exactly 2 agents')
    assert.equal(decomposed[0].agent, 'academic')
    assert.ok(decomposed[0].subQuery.toLowerCase().includes('attendance'))

    assert.equal(decomposed[1].agent, 'campus')
    assert.ok(decomposed[1].subQuery.toLowerCase().includes('library'))
  })

  test('decomposes three-way compound inquiry', () => {
    const compound = 'Show my CGPA, also check upcoming events and show me campus circulars'
    const agents = routeQuery(compound)

    assert.ok(agents.includes('academic'))
    assert.ok(agents.includes('event'))
    assert.ok(agents.includes('communication'))
  })
})

describe('2. Contextual Conversation Memory & Follow-Up Inquiries', () => {
  test('resolves follow-up inquiry using conversation history context', () => {
    const history = [
      { role: 'user', content: 'What is my current attendance?' },
      { role: 'assistant', content: 'Your attendance is 77.46% in IT Department.' }
    ]

    // Follow-up message without explicit keyword "academic"
    const followUp = 'What about my active backlogs?'
    const decomposed = decomposeQuery(followUp, history)

    assert.ok(decomposed.some(t => t.agent === 'academic'))
  })
})

describe('3. Evidence-Grounded Domain Question Answering', () => {
  const alexUser = CANONICAL_PERSONAS[1] // Alex Kumar (IT Student)

  test('answers academic attendance with status alert and database metrics', async () => {
    const res = await orchestrate({
      message: 'What is my attendance percentage?',
      user: alexUser
    })

    assert.equal(res.status, 'completed')
    assert.ok(res.response.text.includes('77.46%'))
    assert.ok(res.response.text.includes('IT Department'))
  })

  test('answers campus facility inquiry with operating hours and citations', async () => {
    const res = await orchestrate({
      message: 'What are the library operating hours?',
      user: alexUser
    })

    assert.equal(res.status, 'completed')
    assert.ok(res.response.text.toLowerCase().includes('central library'))
    assert.ok(res.response.text.includes('8:00 AM'))
    assert.ok(res.citations.length > 0, 'Must include verified campus citations')
  })

  test('answers event inquiry with upcoming hackathons and registration links', async () => {
    const res = await orchestrate({
      message: 'Are there any upcoming hackathons on campus?',
      user: alexUser
    })

    assert.equal(res.status, 'completed')
    assert.ok(res.response.text.includes('Hackathon 2026'))
    assert.ok(res.response.text.includes('Registration'))
  })

  test('drafts communication message and attaches confirmation intent token', async () => {
    const res = await orchestrate({
      message: 'Draft an inquiry email to the library asking about reading rooms',
      user: alexUser
    })

    assert.equal(res.status, 'completed')
    assert.ok(res.response.text.includes('Drafted Campus Communication'))
    assert.ok(res.response.text.includes('library@campus.edu'))
    assert.ok(res.actions.length > 0)
    assert.ok(res.actions[0].confirmationToken, 'Must generate confirmation token for drafted message')
  })
})

describe('4. Multi-Intent Compound Query Orchestration', () => {
  const alexUser = CANONICAL_PERSONAS[1]

  test('orchestrates multi-agent plan for academic and campus facilities together', async () => {
    const res = await orchestrate({
      message: 'Check my attendance and tell me what time the library closes',
      user: alexUser
    })

    assert.equal(res.status, 'completed')
    assert.equal(res.plan.totalTasks, 2)
    assert.ok(res.intents.includes('academic'))
    assert.ok(res.intents.includes('campus'))
    assert.ok(res.response.text.includes('77.46%'))
    assert.ok(res.response.text.toLowerCase().includes('library'))
  })
})

describe('5. Honest Boundary Handling for Out-of-Domain Questions', () => {
  test('explains institutional boundary honestly when asked general trivia', async () => {
    const res = await orchestrate({
      message: 'What is the capital city of France?'
    })

    assert.equal(res.status, 'out_of_scope')
    assert.ok(res.response.text.includes('Atlas Institutional Boundary Notice'))
    assert.ok(res.response.text.includes('supported campus domains'))
    assert.equal(res.plan.totalTasks, 0)
  })

  test('explains boundary honestly when asked generic coding questions', async () => {
    const res = await orchestrate({
      message: 'Write a quicksort algorithm in python for me'
    })

    assert.equal(res.status, 'out_of_scope')
    assert.ok(res.response.text.includes('Atlas Institutional Boundary Notice'))
  })
})

describe('6. Authorization-Enforced Query Boundaries', () => {
  test('returns Access Denied when student queries another student profile', async () => {
    const alexUser = CANONICAL_PERSONAS[1] // Student ID: 1
    const res = await orchestrate({
      message: 'What is Priya Sharma attendance?',
      user: alexUser
    })

    assert.ok(res.response.text.includes('Access Denied'))
    assert.ok(res.response.text.includes('You do not have permission to access records outside your student account'))
    // Ensure Priya's attendance is NOT leaked
    assert.ok(!res.response.text.includes('88.89%'))
  })
})
