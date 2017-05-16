'use strict'

const fingerprint = require('ssh-fingerprint')
const github = require('../util/github')
const joi = require('joi')
const keypair = require('keypair')
const log = require('../util/logger')
const Promise = require('bluebird')
const rabbitmq = require('../util/rabbitmq')
const SSHKey = require('../models/sshKey')

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
            githubKeyId: githubKeyInfo.keyData.id,
            githubUserId: githubKeyInfo.userData.id,
            keyFingerprint: fingerprint(pair.public, 'md5'),
            keyName: job.keyName,
            orgId: job.orgId,
            userId: job.userId
          })
      ])
    })
})
