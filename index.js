'use strict'

require('dotenv').config({ path: './config/.env' })

const httpServer = require('./lib/http')
const log = require('./lib/util/logger')
const rabbitmq = require('./lib/util/rabbitmq')
const workerServer = require('./lib/worker')

rabbitmq.connect()
  .then(workerServer.start.bind(workerServer))
  .then(httpServer.start.bind(httpServer))
  .then(() => {
    log.info('all components started')
  })
  .catch((error) => {
    console.log(error)
    log.fatal({ error }, 'Keymaker failed to start. How will we pass through those doors?')
    process.exit(1)
  })
