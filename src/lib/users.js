const DB = require('../lib/db')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const uuid = require('uuid')


// @ts-check options {Object}
function User(options = {}) {

    this.name = options.name || null

    this.id = options.id || uuid.v4()

    this.hash = options.hash || null

    this.type = options.type || "user "   // default is user

    this.refrshToken = options.refreshToken || null

    this.shares_holding = options.shares_holding || []
    // if (!this instanceof User) return new User(options)

}

// setting property
Object.defineProperty(User, "name", {
    get: () => {
        return this.name
    },
    set: (value) => {
        this.name = value;
    }
});


// setting property
Object.defineProperty(User, "refreshToken", {
    get: () => {
        return this.refreshToken
    },
    set: (value) => {
        this.refreshToken = value
    }
});

User.prototype.toString = function () {
    return JSON.stringify(this)
}


User.prototype.toObject = function () {
    return {
        name: this.name,
        id: this.id,
        hash: this.hash,
        shares_holding: this.shares_holding
    }
}

// User.prototype.__proto__ = "User"


User.prototype.isAdmin = function (password) {

    const isValid = bcrypt.compareSync("admin".concat(password), this.hash)

    return isValid
}

module.exports.New = async function (options) {

    console.log("Creating User", options.name)

    // console.log(
    //     "\nStripping out type key from user data\n" +
    //     "then only way to verify a admin is to compare hash\n" +
    //     "his key by prefix it with `admin`\n "
    // )

    options.hash = bcrypt.hashSync(options.type.concat(options.password), 10);

    const temp = new User(options)

    DB.Users.insertOne(temp.toObject())

    return Promise.resolve(temp)

}

module.exports.Check = function (type, username, password) {
    console.log("typein", { ...arguments })
    const user = DB.Users.findOne({ name: username })

    if (!user) return false;

    const isValid = type == "admin" ? bcrypt.compareSync(type.concat(password), user.hash) : true

    return isValid ? user : undefined
}

module.exports.fromObject = function (data) {
    return new User(
        {
            name: data.name,

        })
}
module.exports.getOne = function (query) {
    try {
        const data = query ? DB.Users.findOne(query) : DB.Users.findOne({})
        const temp = new User(data)
        return data ? temp : undefined
    } catch (error) {
    }
}
module.exports.List = function (query) {
    try {
        return query ? DB.Users.find(query) : DB.Users.find({})

    } catch (error) {
        return error
    }
}
