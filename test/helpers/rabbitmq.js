const Publisher = require('ponos/lib/rabbitmq')
const log = require('../../lib/util/logger')
const Promise = require('bluebird')

const getConnection = () => {
  const publisher = new Publisher({
    name: process.env.APP_NAME,
    log: log,
    events: [{
      name: 'org.user.ssh-key.requested',
      jobSchema: require('../../lib/workers/org.user.ssh-key.requested.js').jobSchema
    }]
  })

  return publisher.connect()
    .return(publisher)
    .disposer((connection) => {
      return connection.disconnect()
    })
}

module.exports = {
  publishEvent: (eventName, data) => {
    return Promise.using(getConnection(), (connection) => {
      return connection.publishEvent(eventName, data)
    })
  }
}
