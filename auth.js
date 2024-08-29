const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const {db} = require("./db");
const {users} = require("./schema");
const {sql} = require("drizzle-orm");

const generateToken = (user) => {
    return jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET, {
        expiresIn: '1w',
    })
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).send('No token provided.');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403);
        req.user = user;
        next();
    });
}

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // TODO validate
        const userExists = await db.select(users).where(sql`${users.id} = ${email}`);
        if (!userExists) return res.status(400).send('User already exists');
        const hashedPassword = argon2.hash(password)
        //insert into db
        const result = await db.insert(users).values({
            email: email,
            password: hashedPassword,
            name: name,
        }).returning()
        const user = {id: result.id, email: result.email}
        const token = generateToken(user);
        res.status(201).json({token});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}
const login = async (req, res) => {
    try {
        const {email,password} = req.body;
        const user = await db.select(users).where(sql`${users.id} = ${email}`);
        if (user && await argon2.verify(password, user.password)) {
            const token = generateToken(user);
            res.status(200).json({token});
        } else {
            res.status(401).json({error: 'Invalid Credentials.'});
        }
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}


module.exports = {authenticateToken,register,login}