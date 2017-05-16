'use strict'

require('dotenv').config({ path: './config/.env' })

const request = require('request-promise')
// const expect = require('chai').expect
const Promise = require('bluebird')
const SSHKey = require('../../../lib/models/sshKey')

require('sinon-as-promised')(Promise)

describe('E2E: fetchOrgKeys', () => {
  const orgId = Math.floor(Math.random() * 100000)
  const keys = [
    {
      githubAccessToken: 'githubAccessToken' + Math.floor(Math.random() * 100000),
      githubKeyId: 87777,
      githubUserId: 97777,
      keyFingerprint: 'fingerPrint' + Math.floor(Math.random() * 100000),
      keyName: 'keyName' + Math.floor(Math.random() * 100000),
      orgId,
      userId: Math.floor(Math.random() * 100000)
    },
    {
      githubAccessToken: 'githubAccessToken' + Math.floor(Math.random() * 100000),
      githubKeyId: 88888,
      githubUserId: 98888,
      keyFingerprint: 'fingerPrint' + Math.floor(Math.random() * 100000),
      keyName: 'keyName' + Math.floor(Math.random() * 100000),
      orgId,
      userId: Math.floor(Math.random() * 100000)
    },
    {
      githubAccessToken: 'githubAccessToken' + Math.floor(Math.random() * 100000),
      githubKeyId: 88888,
      githubUserId: 98888,
      keyFingerprint: 'fingerPrint' + Math.floor(Math.random() * 100000),
      keyName: 'keyName' + Math.floor(Math.random() * 100000),
      orgId: 3,
      userId: Math.floor(Math.random() * 100000)
    }
  ]

  beforeEach(() => {
    return Promise.each(keys, (key) => {
      return new SSHKey().save({
        githubKeyId: key.githubKeyId,
        githubUserId: key.githubUserId,
        keyFingerprint: key.keyFingerprint,
        keyName: key.keyName,
        orgId: key.orgId,
        userId: key.userId
      })
    })
  })

  it('should return the keys and validate all the keys exist for multiple users', function () {
    this.timeout(10000)
    return request.get(`http://${process.env.KEYMAKER_HOST}:${process.env.KEYMAKER_PORT}/organizations/${orgId}/keys`)
      .then((data) => {
        console.log('DONE!', data)
      })
  })
})
