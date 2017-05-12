exports.up = function (knex, Promise) {
  return knex.schema
    .createTable('ssh_key', (table) => {
      table.increments()
      table.integer('org_id')
      table.integer('user_id')
      table.unique(['org_id', 'user_id'])
      table.integer('github_key_id')
      table.string('key_name')
      table.string('key_fingerprint')
      table.timestamps(true)
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('ssh_key')
}
