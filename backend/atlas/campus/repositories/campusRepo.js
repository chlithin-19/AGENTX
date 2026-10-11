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
