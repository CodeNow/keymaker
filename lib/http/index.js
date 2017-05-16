'use strict'

require('dotenv').config({ path: './config/.env' })

const httpServer = require('./http')
const log = require('../util/logger')
const rabbitmq = require('../util/rabbitmq')

rabbitmq.connect()
  .then(httpServer.start.bind(httpServer))
  .then(() => {
    log.info('HTTP Server Started')
  })
  .catch((error) => {
    console.log(error)
    log.fatal({ error }, 'Keymaker failed to start. How will we pass through those doors?')
    process.exit(1)
  })
