'use strict'

require('dotenv').config({ path: './config/.env' })

const log = require('./lib/logger')
const workerServer = require('./lib/worker')

workerServer.start()
  .then(() => {
    log.info('all components started')
  })
  .catch((error) => {
    log.fatal({ error }, 'Keymaker failed to start. How will we pass through those doors?')
    process.exit(1)
  })
