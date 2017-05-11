const db = require('database')
const bookshelf = require('bookshelf')(db)

module.exports = bookshelf.Model.extend({
  tableName: 'ssh_key'
})
