const jwt = require('jsonwebtoken')


module.exports.ACCESS_TOKEN_SECRET = "#fOn4&,pO8w#9s*9l"


module.exports.REFRESH_TOKEN_SECRET = "d@m#ml&8mEf[r^gY2)"

module.exports.New = function (payload, secret, life) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, function (err, token) {
            if (err) {
                return reject(err)
            }

            return resolve(token)
        });
    })
}

module.exports.Verify = function (token, secret) {
    try {
        return jwt.verify(token, secret)
    } catch (error) {
        console.error("Verify JWT ", error)
        return undefined
    }

}