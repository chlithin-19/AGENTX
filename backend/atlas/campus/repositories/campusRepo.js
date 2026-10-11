/**
 * Atlas Campus Facilities & Maintenance Repository
 * 
 * Provides durable persistence for maintenance tickets and campus facilities operations.
 */

import crypto from 'node:crypto'

export class CampusRepository {
  constructor(db) {
    this.db = db

    this.stmtInsertTicket = db.prepare(`
      INSERT INTO maintenance_tickets (id, location, issue, priority, reported_by, reporter_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    this.stmtGetTicketById = db.prepare(`
      SELECT id, location, issue, priority, reported_by, reporter_id, status, created_at, updated_at
      FROM maintenance_tickets
      WHERE id = ?
    `)

    this.stmtListByReporter = db.prepare(`
      SELECT id, location, issue, priority, reported_by, reporter_id, status, created_at, updated_at
      FROM maintenance_tickets
      WHERE reporter_id = ?
      ORDER BY created_at DESC
    `)

    this.stmtListAll = db.prepare(`
      SELECT id, location, issue, priority, reported_by, reporter_id, status, created_at, updated_at
      FROM maintenance_tickets
      ORDER BY created_at DESC
      LIMIT ?
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      )
    `)

    this.stmtInsertReg = db.prepare(`
      INSERT INTO event_registrations (id, event_id, user_id, user_name, registered_at)
      VALUES (?, ?, ?, ?, ?)
    `)

    this.stmtCheckReg = db.prepare(`
      SELECT id, event_id, user_id, user_name, registered_at
      FROM event_registrations
      WHERE event_id = ? AND user_id = ?
    `)

    this.stmtCountReg = db.prepare(`
      SELECT count(*) as c
      FROM event_registrations
      WHERE event_id = ?
    `)

    this.stmtListUserRegs = db.prepare(`
      SELECT id, event_id, user_id, user_name, registered_at
      FROM event_registrations
      WHERE user_id = ?
      ORDER BY registered_at DESC
    `)
  }

  /**
   * Registers a user for an event and persists to SQLite.
   */
  registerForEvent({ eventId, userId, userName }) {
    if (!eventId || !userId) {
      throw new Error('Both eventId and userId are required to register for an event.')
    }
    const existing = this.stmtCheckReg.get(String(eventId), String(userId))
    if (existing) {
      const err = new Error(`User is already registered for event "${eventId}".`)
      err.code = 'ALREADY_REGISTERED'
      err.status = 409
      throw err
    }
    const id = `reg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`
    const now = new Date().toISOString()
    this.stmtInsertReg.run(id, String(eventId), String(userId), String(userName || 'Anonymous'), now)
    const count = this.stmtCountReg.get(String(eventId))?.c || 1
    return Object.freeze({
      id,
      eventId: String(eventId),
      userId: String(userId),
      userName: String(userName || 'Anonymous'),
      registeredAt: now,
      totalRegistrations: count
    })
  }

  /**
   * Checks if user is registered for an event.
   */
  isRegisteredForEvent(eventId, userId) {
    return Boolean(this.stmtCheckReg.get(String(eventId), String(userId)))
  }

  /**
   * Returns total registrations for an event.
   */
  getRegistrationCount(eventId) {
    return this.stmtCountReg.get(String(eventId))?.c || 0
  }

  /**
   * Lists event registrations for a user.
   */
  listRegistrationsByUser(userId) {
    return this.stmtListUserRegs.all(String(userId)).map(r => Object.freeze(r))
  }

  /**
   * Creates a durable maintenance ticket record.
   * 
   * @param {Object} params
   * @returns {Object} Created ticket
   */
  createMaintenanceTicket({
    location,
    issue,
    priority = 'normal',
    reportedBy = 'Anonymous',
    reporterId = null
  }) {
    const id = `tkt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`
    const now = new Date().toISOString()
    const status = 'open'

    this.stmtInsertTicket.run(
      id,
      String(location).trim(),
      String(issue).trim(),
      priority,
      String(reportedBy).trim(),
      reporterId ? String(reporterId) : null,
      status,
      now,
      now
    )

    return Object.freeze({
      id,
      location,
      issue,
      priority,
      reportedBy,
      reporterId,
      status,
      createdAt: now,
      updatedAt: now
    })
  }

  /**
   * Retrieves a maintenance ticket by ID.
   * 
   * @param {string} id 
   * @returns {Object|null}
   */
  getTicketById(id) {
    const row = this.stmtGetTicketById.get(id)
    return row ? Object.freeze(row) : null
  }

  /**
   * Lists tickets reported by a specific user.
   * 
   * @param {string} reporterId 
   * @returns {Array<Object>}
   */
  listTicketsByReporter(reporterId) {
    return this.stmtListByReporter.all(String(reporterId)).map(r => Object.freeze(r))
  }

  /**
   * Lists all tickets with limit (for campus admins/facilities managers).
   * 
   * @param {number} [limit=50] 
   * @returns {Array<Object>}
   */
  listAllTickets(limit = 50) {
    return this.stmtListAll.all(limit).map(r => Object.freeze(r))
  }
}

export default CampusRepository
