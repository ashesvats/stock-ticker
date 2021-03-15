const express = require('express')
const Router = express.Router()
const Users = require('../lib/users')
const uuid = require('uuid')


function auth(req, res, next) {
    console.log("auth called")
    if (req.headers["x-token"]) {

    }
    next()
}

module.exports = auth