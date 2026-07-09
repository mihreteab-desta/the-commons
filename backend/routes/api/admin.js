const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Item = require('../../models/Item');
const Category = require('../../models/Category');
const Reservation = require('../../models/Reservation');
const { authenticateAPI, isAdminAPI } = require('../../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateAPI, isAdminAPI);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
    try {
        const [userStats, itemStats, reservationStats, categories] = await Promise.all([
            User.getStats(),
            Item.getStats(),
            Reservation.getStats(),
            Category.getItemCount()
        ]);
        
        const recentReservations = await Reservation.findAll({ limit: 10 });
        const recentUsers = await User.findAll();
        
        res.json({
            stats: {
                totalUsers: userStats.total_users || 0,
                totalItems: itemStats.total_items || 0,
                totalReservations: reservationStats.total_reservations || 0,
                totalCategories: categories.length
            },
            categories,
            recentReservations: recentReservations.slice(0, 10),
            recentUsers: recentUsers.slice(0, 10)
        });
    } catch (error) {
        console.error('API Admin dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users.map(({ password_hash, ...user }) => user));
    } catch (error) {
        console.error('API Admin users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        await User.delete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('API Admin delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get all reservations
router.get('/reservations', async (req, res) => {
    try {
        const reservations = await Reservation.findAll();
        res.json(reservations);
    } catch (error) {
        console.error('API Admin reservations error:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// Category management
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.getItemCount();
        res.json(categories);
    } catch (error) {
        console.error('API Admin categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

router.post('/categories', async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        const category = await Category.create({ name, description, icon });
        res.status(201).json(category);
    } catch (error) {
        console.error('API Admin create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        await Category.delete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('API Admin delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

module.exports = router;