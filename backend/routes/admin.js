const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Reservation = require('../models/Reservation');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Admin dashboard
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const userStats = await User.getStats();
        const itemStats = await Item.getStats();
        const reservationStats = await Reservation.getStats();
        const categories = await Category.getItemCount();
        const recentUsers = await User.findAll();
        const recentReservations = await Reservation.findAll();

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            userStats,
            itemStats,
            reservationStats,
            categories,
            recentUsers: recentUsers.slice(0, 5),
            recentReservations: recentReservations.slice(0, 5)
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to load admin dashboard');
        res.redirect('/');
    }
});

// Users management
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.findAll();
        res.render('admin/users', { title: 'Manage Users', users });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to load users');
        res.redirect('/admin');
    }
});

// Delete user
router.delete('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await User.delete(req.params.id);
        req.flash('success', 'User deleted');
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to delete user');
        res.redirect('/admin/users');
    }
});

// Categories management
router.get('/categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const categories = await Category.getItemCount();
        res.render('admin/categories', { title: 'Manage Categories', categories });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to load categories');
        res.redirect('/admin');
    }
});

// Create category
router.post('/categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Category.create({
            name: req.body.name,
            description: req.body.description,
            icon: req.body.icon
        });
        req.flash('success', 'Category created');
        res.redirect('/admin/categories');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to create category');
        res.redirect('/admin/categories');
    }
});

// Delete category
router.delete('/categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Category.delete(req.params.id);
        req.flash('success', 'Category deleted');
        res.redirect('/admin/categories');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to delete category');
        res.redirect('/admin/categories');
    }
});

// All reservations
router.get('/reservations', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const reservations = await Reservation.findAll();
        res.render('admin/reservations', { title: 'All Reservations', reservations });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to load reservations');
        res.redirect('/admin');
    }
});

// Error page
router.get('/error', (req, res) => {
    res.render('error', { title: 'Error', message: 'Something went wrong' });
});

module.exports = router;