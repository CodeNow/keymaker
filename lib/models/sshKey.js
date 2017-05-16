const bookshelf = require('../util/database').bookshelf

module.exports = bookshelf.Model.extend({
  tableName: 'ssh_key',
  hasTimestamps: true
})
