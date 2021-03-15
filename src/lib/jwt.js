const jwt = require('jsonwebtoken')


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