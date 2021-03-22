const { random } = require('lodash');
const _ = require('lodash')
const lokijs = require('lokijs')

// Intialize tokijs object
const db = new lokijs("./ticker.db")

var users = db.getCollection("users");
var stocks = db.getCollection("stocks");
var subscribers = db.getCollection('subscribers')


databaseInitialize()


// set up an initialize function for first load (when db hasn't been created yet)
function databaseInitialize() {

    // Add our main example collection if this is first run.
    // This collection will save into a partition named quickstart3.db.0 (collection 0)  
    if (users === null) {
        users = db.addCollection('users', { indices: ['type'] });
    }

    if (stocks === null) {
        stocks = db.addCollection('stocks',
            {
                indices: ['name'],
                unique: ["name"],
                disableChangesApi: false
            });

        const currentDate = new Date()
        console.log("current time", currentDate);

        ["AAPL", "MSFT", "AMZN", "GOOG", 'TSLA', 'FB'].forEach((item) => {
            const history = []

            // generate last five stock values
            for (var i = 0; i < 5; i++) {
                const temp = {
                    price: random(2.44, 50.88).toFixed(2),
                    createdAt: new Date(new Date().setMinutes(random(3, 55)))
                }

                history.push(temp)
            }

            stocks.insert(
                {
                    name: item,
                    price: parseFloat(history[history.length - 1].price),
                    updatedAt: new Date(new Date(Date.now() - 10000 * random(5, 25))),
                    history: history
                })
        })

    }

    if (subscribers === null) {
        subscribers = db.addCollection('subscribers');
    }
}



// @export userCollection{lokiJSCollection}
module.exports.Users = users


// @export stock collection
module.exports.Stocks = stocks


// @export subscribersCollection
module.exports.Subscribers = subscribers

