const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const Item = require('../../models/Item');
const Category = require('../../models/Category');
const Reservation = require('../../models/Reservation');
const { authenticateAPI } = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');

const uploadDir = path.join(__dirname, '../../public/images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const PUBLIC_DIR = path.join(__dirname, '../../public');
const IMAGE_BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

const toPublicPath = (imagePath) => {
    if (!imagePath) return null;
    const cleaned = decodeURIComponent(String(imagePath).trim());
    if (!cleaned) return null;
    if (/^https?:\/\//i.test(cleaned)) return cleaned;
    const withoutLeadingSlash = cleaned.replace(/^\/+/, '');
    return withoutLeadingSlash.startsWith('images/') || withoutLeadingSlash.startsWith('uploads/')
        ? withoutLeadingSlash
        : `images/${withoutLeadingSlash}`;
};

const toSafeImageBaseName = (name) => {
    return path.basename(String(name || '').trim()).replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();
};

const findImagePathForTitle = (title) => {
    const safeTitle = toSafeImageBaseName(title);
    if (!safeTitle || !fs.existsSync(uploadDir)) return null;

    const files = fs.readdirSync(uploadDir);
    const baseNames = [
        safeTitle,
        safeTitle.replace(/\s+/g, '-'),
        safeTitle.replace(/\s+/g, '_'),
        safeTitle.replace(/[()]/g, '').trim(),
        safeTitle.replace(/[()]/g, '').trim().replace(/\s+/g, '-'),
        safeTitle.replace(/[()]/g, '').trim().replace(/\s+/g, '_')
    ].filter(Boolean);

    for (const baseName of baseNames) {
        for (const extension of IMAGE_EXTENSIONS) {
            const expected = `${baseName}${extension}`.toLowerCase();
            const match = files.find((file) => file.toLowerCase() === expected);
            if (match) return `images/${match}`;
        }
    }

    return null;
};

const resolveImageUrl = (item) => {
    if (!item) return '/images/default-item.svg';

    if (item.image_url) {
        const publicPath = toPublicPath(item.image_url);
        if (publicPath && /^https?:\/\//i.test(item.image_url)) {
            return item.image_url;
        }

        const absolutePath = path.join(PUBLIC_DIR, publicPath);
        if (publicPath && fs.existsSync(absolutePath)) {
            return `${IMAGE_BASE_URL}/${publicPath}`;
        }
    }

    const titleImagePath = findImagePathForTitle(item.title);
    if (titleImagePath) {
        return `${IMAGE_BASE_URL}/${titleImagePath}`;
    }

    return item.image_url ? `${IMAGE_BASE_URL}/${toPublicPath(item.image_url)}` : '/images/default-item.svg';
};

const serializeItem = (item) => ({
    ...item,
    image_url: resolveImageUrl(item)
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Validation rules
const validateItem = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category_id').toInt().isInt({ min: 1 }).withMessage('Valid category is required'),
    body('condition').isIn(['excellent', 'good', 'fair', 'worn']).withMessage('Invalid condition'),
    body('max_loan_days').toInt().isInt({ min: 1, max: 30 }).withMessage('Loan period must be 1-30 days'),
    body('pickup_instructions').trim().notEmpty().withMessage('Pickup instructions are required')
];

// Get all items with filters
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.category) filters.category_id = req.query.category;
        if (req.query.condition) filters.condition = req.query.condition;
        if (req.query.search) filters.search = req.query.search;
        if (req.query.available === 'true') filters.is_available = true;
        if (req.query.limit) filters.limit = req.query.limit;
        if (req.query.owner) filters.owner_id = req.query.owner;

        const items = await Item.findAll(filters);
        res.json(items.map(serializeItem));
    } catch (error) {
        console.error('API Items error:', error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Get categories
router.get('/categories/all', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        console.error('API Categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get stats
router.get('/stats/all', async (req, res) => {
    try {
        const [itemStats, userStats, reservationStats] = await Promise.all([
            Item.getStats(),
            require('../../models/User').getStats(),
            Reservation.getStats()
        ]);

        res.json({
            total_items: itemStats.total_items || 0,
            available_items: itemStats.available_items || 0,
            total_users: userStats.total_users || 0,
            total_reservations: reservationStats.total_reservations || 0,
            avg_trust_score: userStats.avg_trust_score || 0
        });
    } catch (error) {
        console.error('API Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get single item
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(serializeItem(item));
    } catch (error) {
        console.error('API Item error:', error);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

// Create item
router.post('/', authenticateAPI, upload.single('image'), validateItem, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Validation errors:', errors.array());
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        let uploadedFilename = req.file?.filename;
        if (req.file) {
            const ext = path.extname(req.file.originalname) || '.jpg';
            const safeTitle = toSafeImageBaseName(req.body.title);
            const titleFilename = `${safeTitle}${ext.toLowerCase()}`;
            const fromPath = req.file.path;
            const toPath = path.join(uploadDir, titleFilename);
            fs.renameSync(fromPath, toPath);
            uploadedFilename = titleFilename;
        }

        const imageUrl = uploadedFilename
            ? `/images/${uploadedFilename}`
            : (req.body.image_url || '/images/default-item.svg');

        const item = await Item.create({
            owner_id: req.user.userId,
            category_id: parseInt(req.body.category_id),
            title: req.body.title,
            description: req.body.description,
            condition: req.body.condition,
            image_url: imageUrl,
            max_loan_days: parseInt(req.body.max_loan_days),
            rental_price_per_day: parseFloat(req.body.rental_price_per_day) || 0,
            pickup_instructions: req.body.pickup_instructions
        });

        res.status(201).json(serializeItem(item));
    } catch (error) {
        console.error('API Create item error:', error);
        res.status(500).json({ error: 'Failed to create item', details: error.message });
    }
});

// Update item
router.put('/:id', authenticateAPI, validateItem, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (item.owner_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You can only edit your own items' });
        }

        const updated = await Item.update(req.params.id, {
            category_id: req.body.category_id,
            title: req.body.title,
            description: req.body.description,
            condition: req.body.condition,
            image_url: req.body.image_url || item.image_url,
            is_available: req.body.is_available !== undefined ? req.body.is_available : item.is_available,
            max_loan_days: req.body.max_loan_days,
            rental_price_per_day: req.body.rental_price_per_day !== undefined
                ? req.body.rental_price_per_day
                : item.rental_price_per_day,
            pickup_instructions: req.body.pickup_instructions
        });

        const refreshed = await Item.findById(updated.id);
        res.json(serializeItem(refreshed));
    } catch (error) {
        console.error('API Update item error:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Delete item
router.delete('/:id', authenticateAPI, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (item.owner_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You can only delete your own items' });
        }

        await Item.delete(req.params.id);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('API Delete item error:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Toggle availability
router.patch('/:id/toggle', authenticateAPI, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (item.owner_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You can only toggle your own items' });
        }

        const toggled = await Item.toggleAvailability(req.params.id);
        res.json(toggled);
    } catch (error) {
        console.error('API Toggle item error:', error);
        res.status(500).json({ error: 'Failed to toggle item' });
    }
});

module.exports = router;
