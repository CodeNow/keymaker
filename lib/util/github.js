const Promise = require('bluebird')
const GitHubApi = require('github')

class Github {
  constructor () {
    this.github = new GitHubApi({
      version: '3.0.0',
      // Github cache configuration
      protocol: process.env.GITHUB_PROTOCOL,
      host: process.env.GITHUB_VARNISH_HOST,
      port: process.env.GITHUB_VARNISH_PORT,

      Promise: Promise,
      timeout: 5000,
      requestMedia: 'application/json',
      headers: {
        'user-agent': process.env.APP_NAME
      }
    })
  }

  savePublicKey (accessToken, options) {
    this.github.authenticate({
      type: 'oauth',
      token: accessToken
    })
    return this.github.users.createKey(options)
      .get('data')
  }
}

module.exports = new Github()
