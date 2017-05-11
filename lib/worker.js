'use strict'

const log = require('./util/logger')
const ponos = require('ponos')

const events = {
  'org.user.ssh-key.requested': require('./workers/org.user.ssh-key.requested.js')
}
const tasks = {}

module.exports = new ponos.Server({
  name: process.env.APP_NAME,
  enableErrorEvents: true,
  rabbitmq: {
    channel: {
      prefetch: process.env.KEYMAKER_PREFETCH
    }
  },
  log,
  tasks,
  events
})
