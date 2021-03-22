const express = require('express')
const Router = express.Router()
const Jwt = require('../lib/jwt')

async function auth(req, res, next) {

    if (req.session) {

        if (!req.session.access_token) {
            return res.status(200).json({ error: "AuthError", msg: "Authentication failed." })
        }

        const validJWT = Jwt.Verify(req.session.access_token, Jwt.ACCESS_TOKEN_SECRET)

        if (!validJWT) {
            return res.status(200).json({ error: "AuthError", msg: "Authentication failed." })
        }

        next()
    }
    else return res.status(200).json({ error: "AuthError", msg: "Authentication failed." })
}

module.exports = auth