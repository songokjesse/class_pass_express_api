require('dotenv').config();

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    PORT: process.env.PORT || 3000,
};