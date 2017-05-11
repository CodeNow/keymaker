'use strict'

const joi = require('joi')
const Promise = require('bluebird')
const keypair = require('keypair')
const github = require('../util/github')
const rabbitmq = require('../util/rabbitmq')
const SSHKey = require('../models/ssh-key')

module.exports.jobSchema = joi.object({
  orgId: joi.string().required(),
  userId: joi.string().required(),
  githubAccessToken: joi.string().required(),
  keyName: joi.string().required()
}).unknown().required()

module.exports.task = Promise.method((job) => {
  const pair = keypair()
  return github.savePublicKey(job.githubAccessToken, {
    key: pair.public,
    title: job.keyName
  })
    .tap((githubKeyInfo) => {
      return Promise.all([
        rabbitmq.emitOrgUserPrivateKeyCreated({
          privateKey: pair.private,
          orgId: job.orgId,
          userId: job.userId
        }),
        new SSHKey({
          orgId: job.orgId,
          userId: job.userId,
          keyName: job.keyName,
          githubKeyId: githubKeyInfo.id
        }).save()
      ])
    })
})
