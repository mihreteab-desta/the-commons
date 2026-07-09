const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Item = require('../../models/Item');
const Review = require('../../models/Review');
const { authenticateAPI } = require('../../middleware/auth');

// Get current user profile (must come before /:id route)
router.get('/me', authenticateAPI, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password_hash, ...userData } = user;
        res.json(userData);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user profile (must come before /:id route)
router.put('/me', authenticateAPI, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.userId);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { full_name, username, email, phone, neighborhood } = req.body;
        const safeUsername = username || currentUser.username;
        const safeEmail = email || currentUser.email;
        const safeFullName = full_name || currentUser.full_name;

        const existingUsername = await User.findByUsername(safeUsername);
        if (existingUsername && existingUsername.id !== req.user.userId) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const existingEmail = await User.findByEmail(safeEmail);
        if (existingEmail && existingEmail.id !== req.user.userId) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const updated = await User.update(req.user.userId, {
            username: safeUsername,
            email: safeEmail,
            full_name: safeFullName,
            phone: phone ?? currentUser.phone,
            neighborhood: neighborhood ?? currentUser.neighborhood,
        });
        const { password_hash, ...userData } = updated;
        res.json(userData);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Get user by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password_hash, email, ...userData } = user;
        res.json(userData);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Get user's items
router.get('/:id/items', async (req, res) => {
    try {
        const items = await Item.findAll({ owner_id: req.params.id });
        res.json(items);
    } catch (error) {
        console.error('Error fetching user items:', error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Get user's reviews
router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.findAll({ reviewee_id: req.params.id });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

module.exports = router;