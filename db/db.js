const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const config = require('../config');

const turso = createClient({
    url: config.TURSO_DATABASE_URL,
    authToken: config.TURSO_AUTH_TOKEN,
});

const db = drizzle(turso);

module.exports = db;