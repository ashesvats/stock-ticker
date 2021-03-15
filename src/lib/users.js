const DB = require('../lib/db')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const uuid = require('uuid')

function User(options) {

    if (!options.name || !options.type || !options.password) throw new Error("Invalid user")

    if (!options.type || ["admin", "user"].indexOf(options.type) < 0) throw new Error("Incorrect user type")
    this.name = options.name

    this.id = uuid.v4()

    this.hash = options.hash
}


User.prototype.toString = function () {
    return JSON.stringify(this)
}


User.prototype.__proto__ = "User"


User.prototype.isAdmin = function (password) {

    const isValid = bcrypt.compareSync("admin".concat(password), this.hash)

    return isValid
}

module.exports.New = async function (options) {

    console.log("Creating User", options)

    console.log(
        "\nStripping out type key from user data\n" +
        "then only way to verify a admin is to compare hash\n" +
        "his key by prefix it with `admin`\n "
    )

    options.hash = bcrypt.hashSync(options.type.concat(options.password), 10);

    const temp = new User(options)

    DB.users.push(temp)

    console.log("Saved:", temp)
    return Promise.resolve(temp)

}

module.exports.Check = function (type, username, password) {
    const user = _.find(DB.users, { name: username })

    if (!user) return false;

    const isValid = bcrypt.compareSync(type.concat(password), user.hash)

    return isValid ? user : undefined
}

module.exports.List = function () {
    return DB.users
}
