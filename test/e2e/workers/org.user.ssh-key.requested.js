'use strict'

require('dotenv').config({ path: './config/.env' })

const expect = require('chai').expect
const Promise = require('bluebird')
const rabbitmq = require('../../helpers/rabbitmq')
const SSHKey = require('../../../lib/models/ssh-key')

require('sinon-as-promised')(Promise)

describe('E2E: org.user.ssh-key.requested', () => {
  const orgId = Math.floor(Math.random() * 100000)
  const userId = Math.floor(Math.random() * 100000)
  const keyName = `keyName` + Math.floor(Math.random() * 100000)
  const githubAccessToken = `githubAccessToken` + Math.floor(Math.random() * 100000)
  it('should save key metadata in the database', function () {
    this.timeout(10000)
    const waitForSaveInPSQL = () => {
      return Promise.delay(100)
        .then(() => {
          return SSHKey.where({
            org_id: orgId,
            user_id: userId
          })
            .fetch()
            .then((sshKey) => {
              if (!sshKey) {
                return waitForSaveInPSQL()
              }
              return sshKey.attributes
            })
        })
    }

    return rabbitmq.publishEvent('org.user.ssh-key.requested', {
      orgId: orgId,
      userId: userId,
      keyName: keyName,
      githubAccessToken: githubAccessToken
    })
      .then(waitForSaveInPSQL)
      .then((sshKey) => {
        expect(sshKey.keyName).to.equal(keyName)
        expect(sshKey.githubKeyId).to.equal(68238128)
      })
  })
})
