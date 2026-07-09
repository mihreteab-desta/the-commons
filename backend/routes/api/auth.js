const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { generateToken } = require('../../config/jwt');

// API Login - returns JWT token
router.post('/login', async (req, res) => {
    try {
        const username = req.body.username?.trim();
        const { password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        const user = await User.findByLogin(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = generateToken(user.id, user.username, user.role);
        
        // Don't send password hash
        const { password_hash, ...userData } = user;
        
        res.json({
            success: true,
            token,
            user: userData
        });
    } catch (error) {
        console.error('API Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// API Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, full_name, phone, neighborhood } = req.body;
        
        // Validate
        if (!username || !email || !password || !full_name) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }
        
        // Check existing
        const existing = await User.findByUsername(username);
        if (existing) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password_hash,
            full_name,
            phone: phone || null,
            neighborhood: neighborhood || null
        });
        
        const token = generateToken(user.id, user.username, user.role);
        
        const { password_hash: _, ...userData } = user;
        
        res.status(201).json({
            success: true,
            token,
            user: userData
        });
    } catch (error) {
        console.error('API Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

module.exports = router;
