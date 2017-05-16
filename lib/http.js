'use strict'

const log = require('./util/logger')
const express = require('express')
const Promise = require('bluebird')

// Define routes here so they load on app load and not on server startup
const routes = {
  fetchOrgKeys: require('./routes/fetchOrgKeys')
}

const handlePromise = (method) => {
  return (req, res, next) => {
    method(req, res, next)
      .then((data) => {
        res.send(data)
      })
      .catch((err) => {
        next(err)
      })
  }
}

class Server {
  constructor () {
    this.app = this.createApp()
  }

  createApp () {
    const app = express()
    app.get('/organizations/:orgId/keys', handlePromise(routes.fetchOrgKeys))
    app.use((err, req, res, next) => {
      if (!err.isBoom) {
        return next(err)
      }
      res.status(err.output.statusCode).json(err.output.payload)
    })
    return app
  }

  start () {
    return Promise.fromCallback((cb) => {
      this.app.listen(process.env.PORT, cb)
    })
      .tap(() => {
        log.trace('HTTP Server Started')
      })
  }
}

module.exports = new Server()
