const express = require('express');
const Router = express.Router()
const Stocks = require('../lib/stocks')
const uuid = require('uuid')
const DB = require('../lib/db');
const { random } = require('lodash');


DB.Stocks.on("update", onStockUpdate)

Router.ws('/ws', async function (ws, req) {

    console.log("connection", ws.OPEN)
    handleClient(req, ws)
});

function handleClient(req, ws) {
    const query = req.query


    //@todo: put validation on channel
    //@todo: Validation{type:String,length<=3}
    const channels = query.channels ? query.channels.split(",", 20) : []

    if (channels.length < 0) {
        return res.status(401).send("No stocks to subscribe !")
    }

    const connection = Client({ socket: ws, channels: channels })

    // Get user requested stocks 
    const stocks = DB
        .Stocks
        .chain()
        .find({})
        .where((data) => {
            return channels.indexOf(data.name) > -1
        })


    // insert subscribeer in cache
    DB.Subscribers.insertOne({ client: connection, channels: channels })


    // send stock data to connected client
    for (const st of stocks.data()) {
        ws.send(JSON.stringify(st))
    }


    console.log(`Client ${connection.uuid} connected for ${channels.length} channels ${channels}`)


}


function sendMessage(ws, data) {
    if (ws.OPEN) {
        ws.send(JSON.stringify(data))
    }
}
module.exports = Router

function Client(options) {
    if (!options.socket && !options.channels) throw new Error("Arguments missing in Client Object")

    return Object.freeze({
        uuid: uuid.v4(),
        socket: options.socket,
        channels: options.channels,
    })
}


function onStockUpdate(stock) {
    const stockSubscribers = DB.Subscribers.find({ "channels": { "$contains": stock.name } })

    stockSubscribers.map((subscriber, index) => {
        sendMessage(subscriber.client.socket, stock)
    })
}

console.log("Stocks created", DB.Stocks.find({}))

const interval = setInterval(() => {

    console.log("Checking stocks to update....")

    var startDate = new Date(Date.now() - 1000 * 30);

    //find all the stocks which was updated 30 seconds ago
    const lastUpdatedStocks = DB.Stocks.where((obj) => {
        return new Date(obj.updatedAt) <= startDate
    })

    if (lastUpdatedStocks.length > 0) {
        for (const stock of lastUpdatedStocks.values()) {
            console.log("updating stock", stock.name)
            Stocks.Update(stock.name, random(2.34, 50.89))
        }
    }

}, 5000)


process.on("exit", () => {
    clearInterval(interval)
})

/// ----- END DUMMY STOCK DATA



