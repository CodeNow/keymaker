'use strict'

require('dotenv').config({ path: './config/.env' })

const expect = require('chai').expect
const Promise = require('bluebird')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

require('sinon-as-promised')(Promise)
const sshKeyStub = sinon.stub()
const github = proxyquire('../../../lib/util/github', {
  '../models/sshKey': sshKeyStub
})

describe('UNIT: lib/github', () => {
  const githubAccessToken = 'githubAccessToken' + Math.floor(Math.random() * 100000)
  const privateKey = 'privateKey' + Math.floor(Math.random() * 100000)
  describe('savePublicKey', () => {
    const mockGithubUserResponse = {
      userData: 'userData'
    }
    const mockGithubKeyCreateResponse = {
      keyCreateResponse: 'keyCreateResponse'
    }
    beforeEach((cb) => {
      sinon.stub(github.github, 'authenticate')
      sinon.stub(github.github.users, 'get').resolves({
        data: mockGithubUserResponse
      })
      sinon.stub(github.github.users, 'createKey').resolves({
        data: mockGithubKeyCreateResponse
      })
      cb()
    })

    afterEach((cb) => {
      github.github.authenticate.restore()
      github.github.users.get.restore()
      github.github.users.createKey.restore()
      cb()
    })

    it('should create a key on github', () => {
      const title = 'title' + Math.floor(Math.random() * 100000)
      return github.savePublicKey(githubAccessToken, {
        key: privateKey,
        title
      })
        .then((response) => {
          sinon.assert.calledWithExactly(github.github.authenticate, {
            type: 'oauth',
            token: githubAccessToken
          })

          sinon.assert.calledWithExactly(github.github.users.get, {})

          sinon.assert.calledWithExactly(github.github.users.createKey, {
            key: privateKey,
            title
          })
          expect(response.keyData).to.equal(mockGithubKeyCreateResponse)
          expect(response.userData).to.equal(mockGithubUserResponse)
        })
    })
  })

  describe('validateAndCleanupSSHKeys', () => {
    let sshKeys
    let destroyStub
    beforeEach((cb) => {
      sshKeys = [
        {
          id: 1
        }, {
          id: 2
        }, {
          id: 3
        }
      ]
      sinon.stub(github.github, 'authenticate')

      sinon.stub(github, '_doesSshKeyExist')
        .withArgs(sshKeys[0]).resolves(true)
        .withArgs(sshKeys[1]).resolves(false)
        .withArgs(sshKeys[2]).resolves(true)

      destroyStub = sinon.stub().resolves()
      sshKeyStub.returns({
        destroy: destroyStub
      })
      cb()
    })

    afterEach((cb) => {
      github.github.authenticate.restore()
      github._doesSshKeyExist.restore()
      cb()
    })

    it('should verify each key exists and delete ones that no longer exist', () => {
      return github.validateAndCleanupSSHKeys(githubAccessToken, sshKeys)
        .then((newSSHKeys) => {
          sinon.assert.calledWithExactly(github.github.authenticate, {
            type: 'oauth',
            token: githubAccessToken
          })
          expect(newSSHKeys.length).to.equal(2)
          expect(newSSHKeys[0]).to.equal(sshKeys[0])
          expect(newSSHKeys[1]).to.equal(sshKeys[2])
          sinon.assert.calledOnce(destroyStub)
          sinon.assert.calledWith(sshKeyStub, {
            id: sshKeys[1].id
          })
        })
    })

    it('on destroy failure, should not fail function', () => {
      destroyStub.rejects(new Error('ERROR 1234'))
      return github.validateAndCleanupSSHKeys(githubAccessToken, sshKeys)
    })
  })

  describe('_doesSshKeyExist', () => {
    let mockSshKey
    let mockGithubUserResponse
    let mockKeyResponse
    beforeEach((cb) => {
      mockSshKey = {
        githubUserId: 1234,
        githubKeyId: 12
      }
      mockGithubUserResponse = {
        login: 'githubLoginUser'
      }
      mockKeyResponse = [
        {
          id: 1
        },
        {
          id: 12
        }
      ]
      cb()
    })
    beforeEach((cb) => {
      sinon.stub(github.github.users, 'getById').resolves({data: mockGithubUserResponse})
      sinon.stub(github.github.users, 'getKeysForUser').resolves({data: mockKeyResponse})
      cb()
    })
    afterEach((cb) => {
      github.github.users.getById.restore()
      github.github.users.getKeysForUser.restore()
      cb()
    })
    it('should fetch and find the key in the list of keys for the user', () => {
      return github._doesSshKeyExist(mockSshKey)
        .then((exists) => {
          sinon.assert.calledWithExactly(github.github.users.getById, { id: mockSshKey.githubUserId })
          sinon.assert.calledWithExactly(github.github.users.getKeysForUser, { username: mockGithubUserResponse.login })
          expect(exists).to.equal(true)
        })
    })
    it('should return false when the user has no matching key ids', () => {
      mockSshKey.githubKeyId = 567
      return github._doesSshKeyExist(mockSshKey)
        .then((exists) => {
          sinon.assert.calledWithExactly(github.github.users.getById, { id: mockSshKey.githubUserId })
          sinon.assert.calledWithExactly(github.github.users.getKeysForUser, { username: mockGithubUserResponse.login })
          expect(exists).to.equal(false)
        })
    })
  })
})
