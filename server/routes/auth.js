const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const router = express.Router();

const createToken = (user) =>
  jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
});

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body ?? {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }
  if (name != null && typeof name !== "string") {
    return res.status(400).json({ error: "Name must be text." });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: await bcrypt.hash(password, 12),
        name: typeof name === "string" && name.trim() ? name.trim() : null,
      },
    });

    return res.status(201).json({ token: createToken(user), user: toPublicUser(user) });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    console.error("Registration failed:", error);
    return res.status(500).json({ error: "Could not create your account." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!normalizedEmail || typeof password !== "string" || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }

    return res.json({ token: createToken(user), user: toPublicUser(user) });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ error: "Could not sign in right now." });
  }
});

module.exports = router;
