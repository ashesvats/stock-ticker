const session = require('express-session');

const SESSION_SECRET_KEY = "edf#$34vgT3t3#g5#lk21%6%^"

module.exports = session({
    saveUninitialized: false,
    secret: SESSION_SECRET_KEY,
    resave: false,
});