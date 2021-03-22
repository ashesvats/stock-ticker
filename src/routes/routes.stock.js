const express = require('express')
const Router = express.Router()
const Stocks = require('../lib/stocks')
const { body, validationResult } = require('express-validator');
const DB = require('../lib/db')


Router.get('/', async (req, res, next) => {
    try {
        const user = DB.Users.findOne({ id: req.session.userId })

        const query = { name: { "$in": user.shares_holding } }

        const stock = DB.Stocks.find(query)

        return res.status(200).json({ error: 0, data: stock })
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({ error: "ServerError", msg: "Someting unexpected happen !" })
    }
})
Router.post('/',
    body('newPrice').isFloat(),
    body('name').isString(),
    async (req, res, next) => {
        try {

            if (!req.session.isAdmin) {
                return res.status(200).json({ error: "PermissionError", msg: "You dont have permisiion to change price" })
            }
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }


            const body = req.body
            console.log("body", body)
            Stocks.Update(body.name, parseInt(body.newPrice))

            console.log("sss", Stocks.Get(body.name))
            return res.status(200).json({ error: "ServerError", msg: "Price updated" })
        } catch (error) {
            return res.status(500).json({ error: "ServerError", msg: "Someting unexpected happen !" })
        }
    })
module.exports = Router