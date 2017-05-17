const request = require('request-promise')
const baseUrl = process.env.KEYMAKER_HTTP_URL
const defaultOptions = {
  json: true,
  timeout: 3000
}

module.exports = {
  /**
   * Fetch ssh keys
   * @param {object} options
   * @param {object.orgId} big poppa org id
   * @param {object.accessToken} github access token
   * @returns {Promise}
   * @resolves {Array<SSHKeys>}
   */
  fetchSSHKeys: (options) => {
    return request.get(`${baseUrl}organizations/${options.orgId}/keys?access_token=${options.accessToken}`, defaultOptions)
  }
}
