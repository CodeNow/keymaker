'use strict'

const db = require('knex')({
  client: 'pg',
  debug: process.env.DEBUG_BOOKSHELF,
  connection: process.env.POSTGRES_CONNECT_STRING,
  pool: {
    min: process.env.POSTGRES_POOL_MIN,
    max: process.env.POSTGRES_POOL_MAX
  }
})

const bookshelf = require('bookshelf')(db)
bookshelf.plugin('bookshelf-camelcase')

module.exports = {
  knex: db,
  bookshelf: bookshelf
}
