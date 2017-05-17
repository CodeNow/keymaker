'use strict'

const log = require('./logger')
const RabbitMQClient = require('ponos/lib/rabbitmq')
const Joi = require('joi')

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
      log,
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
