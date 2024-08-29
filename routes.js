const express = require("express");
const { authenticateToken, register, login } = require("./auth");
const { users } = require("./db/schema");
const { drizzle } = require("drizzle-orm/libsql");
const { createClient } = require("@libsql/client");
require("dotenv").config();

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(turso);
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

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

module.exports = router;
