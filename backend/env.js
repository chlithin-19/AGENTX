import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function loadEnv() {
  const candidates = [
    resolve(__dirname, '.env'),                // backend/.env (co-located)
    resolve(process.cwd(), 'backend', '.env'), // backend/.env (from workspace root)
    resolve(process.cwd(), '.env'),            // root .env
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      try {
        if (typeof process.loadEnvFile === 'function') {
          process.loadEnvFile(candidate)
          return candidate
        }
      } catch (err) {
        // Fallback to manual line parser if native loadEnvFile errors on formatting
      }

      try {
        const content = readFileSync(candidate, 'utf8')
        for (const line of content.split('\n')) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) continue
          const eqIdx = trimmed.indexOf('=')
          if (eqIdx <= 0) continue
          const key = trimmed.slice(0, eqIdx).trim()
          let val = trimmed.slice(eqIdx + 1).trim()
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1)
          }
          if (process.env[key] === undefined) {
            process.env[key] = val
          }
        }
        return candidate
      } catch (e) {
        // Continue to next candidate
      }
    }
  }
  return null
}

loadEnv()
