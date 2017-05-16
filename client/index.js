const request = require('request-promise')
const baseUrl = process.env.KEYMAKER_HTTP_URL
const defaultOptions = {
  json: true,
  timeout: 3000
}

module.exports = {
  fetchSSHKeys: (options) => {
    return request.get(`${baseUrl}organizations/${options.orgId}/keys?access_token=${options.accessToken}`, defaultOptions)
  }
}
