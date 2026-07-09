const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { userValidation, handleValidationErrors } = require('../middleware/validation');

// Login page
router.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/admin');
    res.render('auth/login', { title: 'Login' });
});

// Login POST
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findByUsername(username);
        if (!user) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/auth/login');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/auth/login');
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.fullName = user.full_name;
        req.session.userRole = user.role;

        req.flash('success', `Welcome back, ${user.full_name}!`);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Login failed. Please try again.');
        res.redirect('/auth/login');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;