const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { eq } = require("drizzle-orm");
const config = require('./config');
const db = require('./db/db');
const { users } = require('./db/schema');

const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET, {
        expiresIn: '1w',
    });
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).send('No token provided.');

    jwt.verify(token, config.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token.');
        req.user = user;
        next();
    });
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await argon2.hash(password);

        const result = await db.insert(users).values({
            email,
            password: hashedPassword,
            name,
        }).returning();

        const user = { id: result[0].id, email: result[0].email, name: result[0].name };
        const token = generateToken(user);
        res.status(201).json({ token });
    } catch (e) {
        console.error('Registration error:', e);
        res.status(500).json({ error: 'An error occurred during registration.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (user.length > 0 && await argon2.verify(user[0].password, password)) {
            const token = generateToken(user[0]);
            res.status(200).json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials.' });
        }
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
};

module.exports = { authenticateToken, register, login };
