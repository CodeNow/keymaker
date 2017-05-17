'use strict'

require('dotenv').config({ path: './config/.env' })

const log = require('../util/logger')
const rabbitmq = require('../util/rabbitmq')
const workerServer = require('./worker')

rabbitmq.connect()
  .then(workerServer.start.bind(workerServer))
  .then(() => {
    log.info('Worker Server Started')
  })
  .catch((error) => {
    console.log(error)
    log.fatal({ error }, 'Keymaker failed to start. How will we pass through those doors?')
    process.exit(1)
  })
