function Clients() {
    this.storage = new Map()
}

Clients.prototype.add = addClient

Clients.prototype.Broadcast = Broadcast


function addClient(id, ws) {
    this.storage.set(id, ws)
}

async function Broadcast(message) {
    const lastMsg = message.history[message.history.length - 1]

    const share = {
        name: message.name,
        update: lastMsg
    }
    for (const [key, value] of this.storage.entries()) {
        const client = this.storage.get(key)
        client.send(JSON.stringify(share))
    }
    return Promise.resolve(true)
}


module.exports = new Clients()