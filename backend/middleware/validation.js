const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(e => e.msg).join(', '));
        return res.redirect('back');
    }
    next();
};

// API validation handler
const handleAPIValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const itemValidation = [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title must be under 100 characters'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('condition').isIn(['excellent', 'good', 'fair', 'worn']).withMessage('Invalid condition selected'),
    body('max_loan_days').isInt({ min: 1, max: 30 }).withMessage('Loan period must be between 1 and 30 days'),
    body('pickup_instructions').trim().notEmpty().withMessage('Pickup instructions are required')
];

const reservationValidation = [
    body('start_date').isDate().withMessage('Valid start date is required'),
    body('end_date').isDate().withMessage('Valid end date is required'),
    body('borrower_notes').trim().optional()
];

const userValidation = [
    body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('neighborhood').trim().notEmpty().withMessage('Neighborhood is required')
];

module.exports = {
    handleValidationErrors,
    handleAPIValidationErrors,
    itemValidation,
    reservationValidation,
    userValidation
};