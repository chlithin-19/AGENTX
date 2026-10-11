/**
 * Atlas Security Module Root
 */

export * from './config.js'
export * from './identity.js'
export * from './authorization.js'
export * from './confirmation.js'

import config from './config.js'
import identity from './identity.js'
import authorization from './authorization.js'
import confirmation from './confirmation.js'

export default {
  ...config,
  ...identity,
  ...authorization,
  ...confirmation
}
