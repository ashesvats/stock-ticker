const _ = require('lodash')
const util = require('util')
const EventEmitter = require('events').EventEmitter
const DB = require('./db')

// Stock history limit
const STOCK_HISTORY_BUFFER = 3


function setItem(array, item, length) {
    array.unshift(item) > length ? array.pop() : null
}



module.exports.Get = function (name) {
    return name ? DB.Stocks.findOne({ name: name }) : DB.Stocks.find({})
}


module.exports.Update = function (name, price) {
    try {
        const stock = DB.Stocks.findOne({ name: name })

        if (!stock) throw new Error("Stock not found")

        const history = stock.history

        const temp = {
            price: price.toFixed(2),
            createdAt: new Date()
        }

        setItem(history, temp, STOCK_HISTORY_BUFFER)

        stock.price = temp.price

        stock.updatedAt = new Date()

        stock.history = history

        DB.Stocks.update(stock)
    } catch (error) {
        return error
    }
}