/**
 * Atlas Repositories Root Module
 * 
 * Provides centralized access to initialized repository instances using native node:sqlite.
 */

import { initDatabase, DEFAULT_DB_PATH } from '../ingestion/ingestDataset.js'
import { StudentRepository } from './studentRepo.js'
import { AcademicRepository } from './academicRepo.js'
import { PlacementRepository } from './placementRepo.js'
import { CampusRepository } from './campusRepo.js'

let globalDbInstance = null
let repos = null

/**
 * Gets or initializes the singleton campus database and repository instances.
 * 
 * @param {string} [dbPath=DEFAULT_DB_PATH] 
 * @returns {Object} Repository instances
 */
export function getCampusRepositories(dbPath = DEFAULT_DB_PATH) {
  if (!repos || (dbPath && globalDbInstance?.dbPath !== dbPath)) {
    globalDbInstance = initDatabase(dbPath)
    globalDbInstance.dbPath = dbPath

    repos = {
      db: globalDbInstance,
      studentRepo: new StudentRepository(globalDbInstance),
      academicRepo: new AcademicRepository(globalDbInstance),
      placementRepo: new PlacementRepository(globalDbInstance),
      campusRepo: new CampusRepository(globalDbInstance)
    }
  }

  return repos
}

export {
  StudentRepository,
  AcademicRepository,
  PlacementRepository,
  CampusRepository
}

export default {
  getCampusRepositories,
  StudentRepository,
  AcademicRepository,
  PlacementRepository,
  CampusRepository
}
