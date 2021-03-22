const express = require('express')
const app = express()
const Users = require('./src/lib/users')
const WebSocket = require('ws');
const http = require('http')
const cookieParser = require('cookie-parser')
const expressWs = require('express-ws')(app);
const DB = require('./src/lib/db')

//const mustacheExpress = require('mustache-express');
const assert = require('assert')

const PORT = process.env.PORT || 8080

const ConnectedUsers = new Map();


app.use('/public', express.static('public'))

app.use(express.json()) // for parsing application/json

app.use(cookieParser())

app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


// Middlewares
app.use(require('./src/middleware/middleware.session'));


// express routes

app.get('/', (req, res, next) => {
  return res.redirect("public/index.html")
})



app.use(require('./src/routes/routes.auth.js'))


app.use(require('./src/middleware/middleware.auth'));

app.use('/stocks', require('./src/routes/routes.stock'))

app.use(require('./src/routes/routes.socket'))


// start http server
app.listen(PORT, async () => {
  await _bootstrap()
  console.log(`Server started on port ${PORT}`)
})


async function _bootstrap() {


  const user1 = await Users.New({
    name: "john",
    type: "admin",
    password: "test",
    shares_holding: ["AAPL", "MSFT", "AMZN", "GOOG", 'TSLA', 'FB']
  })

  const user2 = await Users.New({
    name: "Joe",
    type: "user",
    password: "test2",
    shares_holding: ["AAPL", "AMZN", "GOOG"]
  })


  const checkUser1 = Users.Check("admin", "john", "test")


  assert.ok(checkUser1, true, "User authentication failed !")


  assert.strictEqual(user1.isAdmin("test"), true, "User type should be admin")

  console.log("Users Created", Users.List())

  return Promise.resolve(true)


  console.log("Users", Users.List())
}
