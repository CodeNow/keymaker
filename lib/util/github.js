const GitHubApi = require('github')
const log = require('../util/logger')
const Promise = require('bluebird')
const SSHKey = require('../models/sshKey')

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
    log.trace({
      options,
      method: 'savePublicKey'
    }, 'called')
    this.github.authenticate({
      type: 'oauth',
      token: accessToken
    })
    return this.github.users.get({})
      .get('data')
      .then((userData) => {
        return this.github.users.createKey(options)
          .get('data')
          .then((keyData) => {
            return {
              keyData,
              userData
            }
          })
      })
  }

  validateAndCleanupSSHKeys (accessToken, sshKeys) {
    log.trace({
      sshKeys,
      method: 'validateAndCleanupSSHKeys'
    }, 'called')
    this.github.authenticate({
      type: 'oauth',
      token: accessToken
    })

    return Promise.filter(sshKeys, (sshKey) => {
      return this._doesSshKeyExist(sshKey)
        .then((keyExists) => {
          if (!keyExists) {
            new SSHKey({id: sshKey.id})
              .destroy()
              .then(() => {
                log.trace({sshKey}, 'Destroyed ssh key')
              })
              .catch((err) => {
                log.error({err}, 'Error destroying ssh key')
              })
          }
          return keyExists
        })
    })
  }

  _doesSshKeyExist (key) {
    log.trace({
      key,
      method: '_doesSshKeyExist'
    }, 'called')
    // Using key's github userId, get their username
    return this.github.users.getById({ id: key.githubUserId })
      .get('data')
      .then((githubUser) => {
        log.trace({githubUser}, 'got github user')
        return this.github.users.getKeysForUser({
          username: githubUser.login
        })
      })
      .get('data')
      .then((userKeys) => {
        log.trace({userKeys}, 'got keys for user')
        return !!userKeys.find((userKey) => {
          return userKey.id === key.githubKeyId
        })
      })
  }
}

module.exports = new Github()
