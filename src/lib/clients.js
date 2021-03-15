function Clients() {
    this.storage = new Map()
}

Clients.prototype.add = addClient

Clients.prototype.Broadcast = Broadcast


function addClient(id, ws) {
    this.storage.set(id, ws)
}

async function Broadcast(message) {
    console.log("Brodcasting message")
    for (const [key, value] of this.storage.entries()) {
        const client = this.storage.get(key)
        client.send(message)
    }
    return Promise.resolve(true)
}


module.exports = new Clients()