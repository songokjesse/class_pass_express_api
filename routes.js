const express = require("express");
const { authenticateToken, register, login } = require("./auth");
const db = require('./db/db');
const { users } = require("./db/schema");
require("dotenv").config();

const router = express.Router();

router.post('/register', register);
router.post('/login',login);

// User route
router.get("/user", authenticateToken, (req, res) => {
  // The user information is already attached to the request by the authenticateToken middleware
  res.json(req.user);
});

router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

router.get("/users", authenticateToken, async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(
      allUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      })),
    );
  } catch (e) {
    console.error("Error fetching users:", e);
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
});

// Logout route
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // // Update the user's record with a lastLogout timestamp
    // await db.update(users)
    //     .set({ lastLogout: new Date() })
    //     .where(eq(users.id, req.user.id));

    // In a real-world scenario, you might want to blacklist the token here
    // This would require maintaining a blacklist of tokens in your database or a cache like Redis
    // await blacklistToken(req.user.token);

    // Return no content
    res.status(204).send();
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'An error occurred during logout.' });
  }
});

module.exports = router;
