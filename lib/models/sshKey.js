const bookshelf = require('../util/database').bookshelf

const SSHKey = module.exports = bookshelf.Model.extend({
  createOrUpdate: (params) => {
    return new SSHKey().where({
      org_id: params.orgId,
      user_id: params.userId
    })
      .fetch()
      .call('save', params)
      .catch(SSHKey.NotFoundError, () => {
        return new SSHKey()
          .save(params)
      })
  },
  tableName: 'ssh_key',
  hasTimestamps: true
})
