// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const router = express.Router();

// // Signup Route
// router.post('/signup', (req, res) => {
//   const { name, email, password } = req.body;

//   User.findOne({ email }, (err, existingUser) => {
//     if (err) return res.status(500).send("Server error");
//     if (existingUser) return res.status(400).send("User already exists");

//     bcrypt.hash(password, 10, (err, hashedPassword) => {
//       if (err) return res.status(500).send("Password hashing failed");

//       const newUser = new User({ name, email, password: hashedPassword });

//       newUser.save((err, user) => {
//         if (err) return res.status(500).send("Failed to save user");
//         res.status(201).send("User registered successfully");
//       });
//     });
//   });
// });

// // Login Route
// router.post('/login', (req, res) => {
//   const { email, password } = req.body;

//   User.findOne({ email }, (err, user) => {
//     if (err) return res.status(500).send("Server error");
//     if (!user) return res.status(404).send("User not found");

//     bcrypt.compare(password, user.password, (err, isMatch) => {
//       if (err) return res.status(500).send("Password compare failed");
//       if (!isMatch) return res.status(401).send("Invalid credentials");

//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//       res.json({ message: "Login successful", token });
//     });
//   });
// });

// // Logout Route (stateless, client removes token)
// router.post('/logout', (req, res) => {
//   // If using JWT, logout is handled client-side (remove token from localStorage/cookies)
//   res.send("Logout successful");
// });

// module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("All fields are required");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Server error: " + err.message);
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error: " + err.message);
  }
});

// Logout Route (stateless, client removes token)
router.post('/logout', (req, res) => {
  res.send("Logout successful");
});

module.exports = router;