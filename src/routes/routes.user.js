const express = require('express')
const Router = express.Router()
const Users = require('../lib/users')


Router.route('/user')
    .all(function (req, res, next) {
        next()
    })
    .get(function (req, res, next) {


        res.json(req.user)
    })
    .post(function (req, res, next) {
        next(new Error('not implemented'))
    })
    .delete(function (req, res, next) {
        next(new Error('not implemented'))
    })
module.exports = Router