const bookshelf = require('../util/database').bookshelf

const SSHKey = module.exports = bookshelf.Model.extend({
  createOrUpdate: (params) => {
    return new SSHKey().where({
      org_id: params.orgId,
      user_id: params.userId
    })
      .fetch()
      .then((model) => {
        if (model) {
          return model.save(params)
        }
        return new SSHKey()
          .save(params)
      })
  },
  tableName: 'ssh_key',
  hasTimestamps: true
})
