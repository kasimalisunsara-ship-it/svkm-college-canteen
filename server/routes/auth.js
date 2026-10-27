const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'campus_cafeteria_super_secret_jwt_key_2026';

// Register (SVKM Student / SVKM Teaching Staff)
router.post('/register', async (req, res) => {
  try {
    const { name, email, sapId, password, confirmPassword, userType } = req.body;

    if (!name || !email || !sapId || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields including SAP ID are required.' });
    }

    // SVKM Institutional Email Enforcement
    if (!db.isSvkmEmail(email)) {
      return res.status(403).json({
        message: 'This canteen ordering system is exclusively available to SVKM students and teaching staff. Please use your official SVKM email ID (e.g., @svkm.ac.in).'
      });
    }

    // Validate SAP ID
    const cleanSapId = sapId.toString().trim();
    if (cleanSapId.length < 5) {
      return res.status(400).json({ message: 'Please enter a valid numeric SAP ID (e.g., 53013240071).' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingByEmail = await db.findUserByEmail(email);
    if (existingByEmail) {
      return res.status(409).json({ message: 'An account with this SVKM email already exists.' });
    }

    const existingBySapId = await db.findUserBySapId(cleanSapId);
    if (existingBySapId) {
      return res.status(409).json({ message: 'An account with this SAP ID already exists.' });
    }

    const role = userType === 'Teaching Staff' || userType === 'staff' ? 'staff' : 'student';
    const displayUserType = role === 'staff' ? 'Teaching Staff' : 'Student';

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      sapId: cleanSapId,
      password: hashedPassword,
      role: role,
      userType: displayUserType
    });

    const token = jwt.sign(
      { id: newUser.id, sapId: newUser.sapId, email: newUser.email, role: newUser.role, userType: newUser.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful! Welcome to SVKM Canteen.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        sapId: newUser.sapId,
        email: newUser.email,
        role: newUser.role,
        userType: newUser.userType
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Failed to complete registration due to database error.' });
  }
});

// Login (SVKM Customer via SAP ID or Email, or Admin)
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, sapId, password, portalType } = req.body;

    // Login identifier can be passed in `identifier` or `email` or `sapId`
    const loginInput = identifier || email || sapId;

    if (!loginInput || !password) {
      return res.status(400).json({ message: 'SAP ID or SVKM Email and Password are required.' });
    }

    const user = await db.findUserByIdentifier(loginInput);
    if (!user) {
      return res.status(401).json({ message: 'Invalid SAP ID / Email or Password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid SAP ID / Email or Password.' });
    }

    // Non-admin SVKM access enforcement
    if (user.role !== 'admin' && !db.isSvkmEmail(user.email)) {
      return res.status(403).json({
        message: 'This canteen ordering system is exclusively available to SVKM students and teaching staff.'
      });
    }

    // Admin Portal check if user is logging into Admin portal
    if (portalType === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You do not have administrator permissions.'
      });
    }

    const token = jwt.sign(
      { id: user.id, sapId: user.sapId, email: user.email, role: user.role, userType: user.userType || user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        sapId: user.sapId,
        email: user.email,
        role: user.role,
        userType: user.userType || (user.role === 'admin' ? 'Administrator' : 'Student')
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Failed to process login.' });
  }
});

// Get Current User (/me)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        sapId: user.sapId,
        email: user.email,
        role: user.role,
        userType: user.userType || (user.role === 'admin' ? 'Administrator' : 'Student')
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving user details.' });
  }
});

module.exports = router;
