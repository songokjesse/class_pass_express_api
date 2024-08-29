const express = require('express');
const {authenticateToken,register,login } = require('./auth');
const {db} = require('./server');
const router = express.Router();

router.post('/register',register);
router.post('/login',login);


router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;