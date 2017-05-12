'use strict'
const Promise = require('bluebird')
const Joi = Promise.promisifyAll(require('joi'))
const RabbitMQClient = require('ponos/lib/rabbitmq')

const schemas = {
  emitOrgUserPrivateKeyCreated: Joi.object({
    orgId: Joi.number().required(),
    userId: Joi.number().required(),
    privateKey: Joi.string().required()
  }).required()
}

class RabbitMQ extends RabbitMQClient {
  constructor () {
    super({
      name: process.env.APP_NAME,
      events: [{
        name: 'org.user.private-key.created',
        jobSchema: schemas.emitOrgUserPrivateKeyCreated
      }]
    })
  }

  emitOrgUserPrivateKeyCreated (job) {
    this.publishEvent('org.user.private-key.created', job)
  }
}

module.exports = new RabbitMQ()
