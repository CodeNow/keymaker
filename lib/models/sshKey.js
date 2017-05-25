const bookshelf = require('../util/database').bookshelf

const SSHKey = module.exports = bookshelf.Model.extend({
  createOrUpdate: (params) => {
    return new SSHKey().where({
      orgId: params.orgId,
      userId: params.userId
    })
      .fetch()
      .catch(SSHKey.NotFoundError, () => {
        return new SSHKey()
      })
      .call('save', params)
  },
  tableName: 'ssh_key',
  hasTimestamps: true
})
