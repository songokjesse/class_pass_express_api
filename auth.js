const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { eq } = require("drizzle-orm");
const config = require('./config');
const db = require('./db/db');
const { users, students} = require('./db/schema');
const {check, validationResult} = require("express-validator");


const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET, {
        expiresIn: '1w',
    });
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json( { error:  [{ msg: 'No token provided.' }] });

    jwt.verify(token, config.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error:  [{ msg: 'Invalid token.' }] });
        req.user = user;
        next();
    });
};


const register = [
    check('name').not().isEmpty().withMessage('The name field is required.'),
    check('admission_number').not().isEmpty().withMessage('The admission_number field is required.'),
    check('email').not().isEmpty().withMessage('The email field is required.').isEmail().withMessage('The email must be a valid email address.'),
    check('password').not().isEmpty().withMessage('The password field is required.').isLength({ min: 8 }).withMessage('The password must be at least 8 characters.'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.mapped() });
        }
    try {
        const { name, email, password, admission_number } = req.body;
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) return res.status(400).json({ errors: [{ email: ["The email has already been taken." ]}] });

        const hashedPassword = await argon2.hash(password);

        const result = await db.insert(users).values({
            email,
            password: hashedPassword,
            name,
        }).returning();
        await db.insert(students).values({
            userId: result[0].id,
            admission_number: admission_number.toUpperCase()
        });
        const user = { id: result[0].id, email: result[0].email, name: result[0].name };
        const token = generateToken(user);
        res.status(201).json({ token });
    } catch (e) {
        console.error('Registration error:', e);
        res.status(500).json( { errors: [{ msg: 'An error occurred during registration.' }] });
    }
}
];

const login = [
    check('email').not().isEmpty().withMessage('The email field is required.').isEmail().withMessage('The email must be a valid email address.'),
    check('password').not().isEmpty().withMessage('The password field is required.').isLength({ min: 8 }).withMessage('The password must be at least 8 characters.'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.mapped() });
        }
    try {
        const { email, password } = req.body;
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (user.length > 0 && await argon2.verify(user[0].password, password)) {
            const token = generateToken(user[0]);
            res.status(200).json({ token });
        } else {
            res.status(401).json({ error: [{ msg: 'Invalid credentials.' }]  });
        }
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ error: [{ msg: 'An error occurred during login.'}]  });
    }
}];

module.exports = { authenticateToken, register, login };
