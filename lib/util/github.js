const Promise = require('bluebird')

class Github {
  savePublicKey (accessToken, options) {
    return Promise.resolve({
      id: 4567
    })
  }
}

module.exports = new Github()
