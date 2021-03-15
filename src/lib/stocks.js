const _ = require('lodash')
const util = require('util')
const EventEmitter = require('events').EventEmitter

function Share(name) {

    if (!name) throw new Error("share name is missing !")

    this.name = name

    this.updatedAt = new Date()

    this.history = [{
        change: 0,
        createdAt: new Date()
    }]
    // just to simmulate locking to avoid raace while
    // updating through multiple process
    let lock = false



}

// Share.__proto__ = null


Share.prototype.History = shareHistory

Share.prototype.toObject = function () {
    return {
        name: this.name,
        updatedAt: this.updatedAt,
        history: this.history
    }
}

// Stocks constructor
// act as torage with change publish event
function Stocks() {

    this.stocks = new Map()


    EventEmitter.call(this);

}

util.inherits(Stocks, EventEmitter)




// Create instance of Stock
//@param name {String} : name of the Share
//@return Object {Share}  : Share object

Stocks.prototype.AddShare = shareAdd


Stocks.prototype.UpdateShare = shareUpdate


Stocks.prototype.GetShare = shareGet


Stocks.prototype.List = listStorage



Stocks.prototype.All = function () {

}


function listStorage() {
    return Object.fromEntries(this.stocks)
}


function shareUpdate(name, value) {
    try {
        const share = this.stocks.get(name)

        if (!share) return undefined

        if (share.lock) {
            throw new Error("Item is locked")
        }
        share.lock = true

        share.updatedAt = new Date()

        share.history.push({
            change: value,
            creaateAt: new Date()
        })

        share.lock = false

        this.emit("update", share)
        // console.log(`Stock ${share.name} updated to ${share.updatedAt.getMilliseconds()}`)

        return share
    } catch (error) {
        console.error("error", error)
    }
}

function shareHistory(min, max) {
    return this.history.slice(min, max)

}

function shareAdd(name) {
    const temp = new Share(name)
    // temp.on("update", () => {
    //     console.log("updated")
    // })
    if (this.stocks.has(name)) return this.stocks.get(name)

    this.stocks.set(name, temp)
    return temp
}


function shareGet(name) {
    return this.stocks.has(name) ? this.stocks[name] : undefined
}
module.exports = Stocks