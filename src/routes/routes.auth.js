const express = require('express')
const Router = express.Router()
const Users = require('../lib/users')
const uuid = require('uuid')
const Jwt = require('../lib/jwt')

Router.get('/', async (req, res, next) => {
    try {
        return res.redirect("public/index.html")
    } catch (error) {
        return res.status(500).json({ error: error.name, msg: err.message })
    }
})

Router.post('/login', async (req, res, next) => {
    try {
        const body = req.body


        const user = Users.getOne({ name: body.username })

        if (!user.toObject()) {
            return res.status(401).json({ error: "AuthFailed", msg: "Incorrect username or password !" })
        }

        const verifyUser = Users.Check(body.type, body.username, body.password)

        if (!verifyUser) {
            return res.status(401).json({ error: "AuthFailed", msg: "Incorrect username or password !" })
        }

        console.log(`Updating session for user ${user}`);


        req.session.regenerate(function (err) {
            if (err) {
                cb(err);
            }
        });

        req.session.userId = user.id;

        const jwtToken = await Jwt.New({ userid: user.id }, Jwt.ACCESS_TOKEN_SECRET, 120)

        if (!jwtToken) throw new Error("Unable to generate JWT token")

        req.session.access_token = jwtToken

        req.session.refresh_token = await Jwt.New({ userid: user.id }, Jwt.REFRESH_TOKEN_SECRET, 120 * 10)

        req.session.isAdmin = user.isAdmin(body.password)

        req.session.save(function (err) {
            // session saved
            if (err) {
                console.log("error in saving session")
            }
        })

        const isAdmin = req.session.isAdmin ? "admin" : "user"

        console.log("session set", req.session)

        return res.redirect(`public/home.html?type=${isAdmin}&auth=${jwtToken}`)
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({ error: error.name, msg: error })
    }
})

Router.post('/logout', function (request, response) {
    const ws = map.get(request.session.userId);
    console.log('Destroying session');
    request.session.destroy(function () {
        if (ws) ws.close();
        response.status(200).json({ result: 'OK', message: 'Session destroyed' });
    });
});
module.exports = Router