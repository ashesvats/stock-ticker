const _ = require('lodash')

let storage = {
    users: [],
    stocks: [],
}

module.exports = storage


// module.exports.Insert = function (key, data) {

//     if (key === "user") {
//         if (data.prototype === "User") {
//             throw new Error("user should be object of User")
//         }

//         console.log("adding user to db", user)
//         storage.push(data)
//     }
//     else if (key === "stocks") {

//     }
// }

// module.exports.Get = function (key, value) {

//     if (!storage[key]) throw new Error("Invalid key")

//     const temp = _.filter(storage[key], (item) => item[key] === value)

//     return temp.length > 0 ? temp[0] : undefined
// }
