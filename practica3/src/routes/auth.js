const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }
    // email format simple check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    // check existing
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(409).json({ message: 'User or email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, email, passwordHash });
    await user.save();
    return res.status(201).json({ message: 'User created' });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
