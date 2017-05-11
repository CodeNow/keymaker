'use strict'

require('dotenv').config({ path: './config/.env' })

const log = require('./lib/util/logger')
const workerServer = require('./lib/worker')
const rabbitmq = require('./util/rabbitmq')

rabbitmq.connect()
  .then(workerServer.start)
  .then(() => {
    log.info('all components started')
  })
  .catch((error) => {
    log.fatal({ error }, 'Keymaker failed to start. How will we pass through those doors?')
    process.exit(1)
  })
