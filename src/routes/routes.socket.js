const express = require('express');
const { map, random } = require('lodash');
const Router = express.Router()
const Stocks = require('../lib/stocks')
const authMiddleware = require('../middleware/middleware.auth')
const Clients = require('../lib/clients')

// store created stocks
const StockStorage = new Stocks()


Router.get('/stocks', function (req, res, next) {
    const stock = StockStorage.List()
    res.status(200).json({ error: 0, data: stock })
})


Router.ws('/ws', async function (ws, req) {

    console.log("client connected", req.session)

    await handleClient(req, ws)
});


async function handleClient(req, ws) {
    const session = req.session
    console.log("session", session)
    uuid = uuid.v4()
    const client = Clients.add(uuid, ws)
}
module.exports = Router






StockStorage.on("update", async (value) => {
    console.log("Brodcasting share change ", value)
    await Clients.Broadcast(value)
})

//  Create dummy stocks  ----------------------------------------

const created_stocks = new Map()

const share_array = ["BBL", "ABC", "CDE", "EFG"]

for (const st of share_array) {
    created_stocks.set(st, StockStorage.AddShare(st))
}

console.log("shares created...")
console.log(Object.fromEntries(created_stocks))
console.log("Total Share Created :", created_stocks.size)


const interval = setInterval(() => {

    for (const st of share_array) {
        const a = StockStorage.UpdateShare(st, random(100.3).toFixed(4))
    }
}, 1000);



process.on("exit", () => {
    clearInterval(interval)
})
setTimeout(() => {
    clearInterval(interval)
}, 1000000);


/// ----- END DUMMY STOCK DATA



