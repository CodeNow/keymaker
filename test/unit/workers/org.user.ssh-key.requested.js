'use strict'

require('dotenv').config({ path: './config/.env' })

const forge = require('node-forge')
const github = require('../../../lib/util/github')
const Promise = require('bluebird')
const proxyquire = require('proxyquire')
const rabbitmq = require('../../../lib/util/rabbitmq')
const sinon = require('sinon')
const SSHKey = require('../../../lib/models/sshKey')

const keypairStub = sinon.stub()
const worker = proxyquire('../../../lib/workers/org.user.ssh-key.requested', {
  keypair: keypairStub
})
require('sinon-as-promised')(Promise)

describe('UNIT: org.user.ssh-key.requested task', () => {
  const orgId = Math.floor(Math.random() * 100000)
  const userId = Math.floor(Math.random() * 100000)
  const keyName = 'keyName' + Math.floor(Math.random() * 100000)
  const githubAccessToken = 'githubAccessToken' + Math.floor(Math.random() * 100000)
  const privateKey = 'privateKey' + Math.floor(Math.random() * 100000)
  const publicKey = 'publicKey' + Math.floor(Math.random() * 100000)
  const keyData = {
    id: 'githubKeyId' + Math.floor(Math.random() * 100000)
  }
  const userData = {
    id: 'githubUserId' + Math.floor(Math.random() * 100000)
  }
  const stubPublicKeyFromPem = 'public key from pem' + Math.floor(Math.random() * 100000)
  const stubPublicOpenSSHKey = 'public openSSH key' + Math.floor(Math.random() * 100000)

  let job
  beforeEach((cb) => {
    job = {
      orgId,
      userId,
      githubAccessToken,
      keyName
    }
    cb()
  })

  beforeEach((cb) => {
    keypairStub.reset()
    keypairStub.returns({
      private: privateKey,
      public: publicKey
    })
    sinon.stub(github, 'savePublicKey').resolves({
      keyData,
      userData
    })
    sinon.stub(rabbitmq, 'emitOrgUserPrivateKeyCreated').resolves()
    sinon.stub(SSHKey.prototype, 'createOrUpdate').resolves()
    sinon.stub(forge.pki, 'publicKeyFromPem').returns(stubPublicKeyFromPem)
    sinon.stub(forge.ssh, 'publicKeyToOpenSSH').returns(stubPublicOpenSSHKey)
    cb()
  })

  afterEach((cb) => {
    github.savePublicKey.restore()
    SSHKey.prototype.createOrUpdate.restore()
    forge.pki.publicKeyFromPem.restore()
    forge.ssh.publicKeyToOpenSSH.restore()
    cb()
  })

  it('should generate and save a public key and save it', () => {
    return worker.task(job)
      .then(() => {
        sinon.assert.calledOnce(forge.pki.publicKeyFromPem)
        sinon.assert.calledWithExactly(forge.pki.publicKeyFromPem, publicKey)

        sinon.assert.calledOnce(forge.ssh.publicKeyToOpenSSH)
        sinon.assert.calledWithExactly(forge.ssh.publicKeyToOpenSSH, stubPublicKeyFromPem, 'support@runnable.com')

        sinon.assert.calledOnce(github.savePublicKey)
        sinon.assert.calledWithExactly(github.savePublicKey, githubAccessToken, {
          key: stubPublicOpenSSHKey,
          title: keyName
        })

        sinon.assert.calledOnce(rabbitmq.emitOrgUserPrivateKeyCreated)
        sinon.assert.calledWithExactly(rabbitmq.emitOrgUserPrivateKeyCreated, {
          privateKey: privateKey,
          orgId,
          userId
        })

        sinon.assert.calledOnce(SSHKey.prototype.createOrUpdate)
        sinon.assert.calledWithExactly(SSHKey.prototype.createOrUpdate, {
          githubKeyId: keyData.id,
          githubUserId: userData.id,
          keyFingerprint: sinon.match.string,
          keyName,
          orgId,
          userId
        })
      })
  })
})
