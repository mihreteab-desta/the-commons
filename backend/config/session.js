const session = require('express-session');

const sessionConfig = session({
    secret: process.env.SESSION_SECRET || 'the_commons_default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
});

module.exports = sessionConfig;