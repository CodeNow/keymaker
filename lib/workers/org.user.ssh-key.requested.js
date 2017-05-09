'use strict'

const joi = require('joi')
const Promise = require('bluebird')

module.exports.jobSchema = joi.object({
  orgId: joi.string().required(),
  userId: joi.string().required()
}).unknown().required()

module.exports.task = Promise.method((job) => {
  return Promise.resolve()
    .tap(() => {
      console.log('DONE!', job)
    })
})
