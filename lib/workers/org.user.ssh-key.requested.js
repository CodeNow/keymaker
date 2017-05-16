'use strict'

const joi = require('joi')
const Promise = require('bluebird')
const keypair = require('keypair')
const github = require('../util/github')
const rabbitmq = require('../util/rabbitmq')
const SSHKey = require('../models/sshKey')
const log = require('../util/logger')

module.exports.jobSchema = joi.object({
  orgId: joi.number().required(),
  userId: joi.number().required(),
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
      log.trace({githubKeyInfo}, 'Saved public key')
      return Promise.all([
        rabbitmq.emitOrgUserPrivateKeyCreated({
          privateKey: pair.private,
          orgId: job.orgId,
          userId: job.userId
        }),
        new SSHKey().where({
          orgId: job.orgId,
          userId: job.userId
        })
          .save({
            orgId: job.orgId,
            userId: job.userId,
            keyName: job.keyName,
            githubKeyId: githubKeyInfo.keyData.id,
            githubUserId: githubKeyInfo.userData.id
          })
      ])
    })
})
