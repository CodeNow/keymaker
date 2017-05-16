'use strict'

const log = require('../util/logger')
const SSHKey = require('../models/sshKey')
const github = require('../util/github')

module.exports = (req) => {
  const orgId = req.params.orgId
  log.trace({
    orgId
  }, 'Fetching org keys')

  return new SSHKey().where({ org_id: orgId })
    .fetchAll()
    .then((records) => {
      log.trace({
        records
      }, 'Fetched ssh keys')
      return github.validateAndCleanupSSHKeys(req.query.access_token, records.toJSON())
    })
}
