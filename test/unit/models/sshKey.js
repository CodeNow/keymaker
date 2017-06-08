'use strict'

require('dotenv').config({ path: './config/.env' })

const Promise = require('bluebird')
const sinon = require('sinon')
const SSHKey = require('../../../lib/models/sshKey')

require('sinon-as-promised')(Promise)

describe('UNIT: sskKey model', () => {
  let whereStub
  const params = {
    key: 'key' + Math.floor(Math.random() * 100000),
    orgId: 'orgId' + Math.floor(Math.random() * 100000),
    userId: 'userId' + Math.floor(Math.random() * 100000)
  }
  beforeEach((done) => {
    whereStub = {
      fetch: sinon.stub().resolves()
    }
    sinon.stub(SSHKey.prototype, 'where').returns(whereStub)
    sinon.stub(SSHKey.prototype, 'save').resolves()
    done()
  })
  afterEach((done) => {
    SSHKey.prototype.where.restore()
    SSHKey.prototype.save.restore()
    done()
  })

  describe('when key exists', () => {
    let model
    beforeEach((done) => {
      model = {
        save: sinon.stub().resolves()
      }
      whereStub.fetch.resolves(model)
      done()
    })

    it('should update the model with params', () => {
      return new SSHKey().createOrUpdate(params)
        .then(() => {
          sinon.assert.calledOnce(SSHKey.prototype.where)
          sinon.assert.calledWithExactly(SSHKey.prototype.where, {
            org_id: params.orgId,
            user_id: params.userId
          })

          sinon.assert.calledOnce(whereStub.fetch)

          sinon.assert.calledOnce(model.save)
          sinon.assert.calledWithExactly(model.save, params)
        })
    })
  })

  describe('when key does not exist', () => {
    it('should create new model with params', () => {
      return new SSHKey().createOrUpdate(params)
        .then(() => {
          sinon.assert.calledOnce(SSHKey.prototype.where)
          sinon.assert.calledWithExactly(SSHKey.prototype.where, {
            org_id: params.orgId,
            user_id: params.userId
          })

          sinon.assert.calledOnce(whereStub.fetch)

          sinon.assert.calledOnce(SSHKey.prototype.save)
          sinon.assert.calledWithExactly(SSHKey.prototype.save, params)
        })
    })
  })
})
