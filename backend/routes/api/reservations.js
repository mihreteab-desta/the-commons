const express = require('express');
const router = express.Router();
const Reservation = require('../../models/Reservation');
const Item = require('../../models/Item');
const Review = require('../../models/Review');
const User = require('../../models/User');
const { authenticateAPI } = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation rules
const validateReservation = [
    body('item_id').isInt().withMessage('Valid item is required'),
    body('start_date').isDate().withMessage('Valid start date is required'),
    body('end_date').isDate().withMessage('Valid end date is required'),
    body('borrower_notes').trim().optional()
];

// Get user's reservations
router.get('/my', authenticateAPI, async (req, res) => {
    try {
        const reservations = await Reservation.findByUser(req.user.userId);
        res.json(reservations);
    } catch (error) {
        console.error('API My reservations error:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// Get single reservation
router.get('/:id', authenticateAPI, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        if (reservation.borrower_id !== req.user.userId &&
            reservation.owner_id !== req.user.userId &&
            req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json(reservation);
    } catch (error) {
        console.error('API Get reservation error:', error);
        res.status(500).json({ error: 'Failed to fetch reservation' });
    }
});

// Create reservation
router.post('/', authenticateAPI, validateReservation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { item_id, start_date, end_date, borrower_notes } = req.body;

        const item = await Item.findById(item_id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (!item.is_available) {
            return res.status(400).json({ error: 'Item is not available' });
        }

        if (item.owner_id === req.user.userId) {
            return res.status(400).json({ error: 'You cannot borrow your own item' });
        }

        // Calculate rental price
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const rentalPrice = (item.rental_price_per_day || 0) * daysCount;

        const reservation = await Reservation.create({
            item_id,
            borrower_id: req.user.userId,
            start_date,
            end_date,
            borrower_notes,
            rental_price: rentalPrice
        });

        res.status(201).json(reservation);
    } catch (error) {
        console.error('API Create reservation error:', error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

// Approve reservation
router.patch('/:id/approve', authenticateAPI, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        if (reservation.owner_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only the lender can approve' });
        }

        if (reservation.status !== 'pending') {
            return res.status(400).json({ error: `Cannot approve reservation with status: ${reservation.status}` });
        }

        const updated = await Reservation.updateStatus(req.params.id, 'approved', req.body.lender_notes);
        await Item.updateAvailability(reservation.item_id, false);

        res.json(updated);
    } catch (error) {
        console.error('API Approve reservation error:', error);
        res.status(500).json({ error: 'Failed to approve reservation' });
    }
});

// Reject reservation
router.patch('/:id/reject', authenticateAPI, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        if (reservation.owner_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only the lender can decline' });
        }

        if (reservation.status !== 'pending') {
            return res.status(400).json({ error: `Cannot decline reservation with status: ${reservation.status}` });
        }

        const updated = await Reservation.updateStatus(req.params.id, 'rejected', req.body.lender_notes);
        res.json(updated);
    } catch (error) {
        console.error('API Reject reservation error:', error);
        res.status(500).json({ error: 'Failed to decline reservation' });
    }
});

module.exports = router;
