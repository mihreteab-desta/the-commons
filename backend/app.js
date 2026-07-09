const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sessionConfig = require('./config/session');
const { setUser } = require('./middleware/auth');
const flashMiddleware = require('./middleware/flash');

// Route imports
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// API Route imports
const apiAuthRoutes = require('./routes/api/auth');
const apiItemRoutes = require('./routes/api/items');
const apiReservationRoutes = require('./routes/api/reservations');
const apiUserRoutes = require('./routes/api/users');
const apiAdminRoutes = require('./routes/api/admin');

const app = express();
const PORT = process.env.PORT || 5000;


// Security middleware
app.use(helmet({
    contentSecurityPolicy: false
}));

// CORS
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS setup (for admin pages only)
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Session (for EJS admin routes)
app.use(sessionConfig);
app.use(flash());
app.use(setUser);
app.use(flashMiddleware);

// API Routes (JWT-based - main frontend uses these)
app.use('/api/auth', apiAuthRoutes);
app.use('/api/items', apiItemRoutes);
app.use('/api/reservations', apiReservationRoutes);
app.use('/api/users', apiUserRoutes);
app.use('/api/admin', apiAdminRoutes);

// Admin routes (EJS - internal use only)
app.use('/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// In development, redirect to React dev server for non-API/admin routes
if (process.env.NODE_ENV !== 'production') {
    app.get('*', (req, res) => {
        // Skip API and admin routes
        if (req.path.startsWith('/api') || req.path.startsWith('/admin')) {
            return res.status(404).json({ error: 'Not found' });
        }
        // Redirect to React dev server
        res.redirect(`http://localhost:3000${req.path}`);
    });
} else {
    // In production, serve React build
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/admin')) {
            return next();
        }
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// 404 handler for API
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    if (req.path.startsWith('/api')) {
        res.status(500).json({ error: 'Internal server error' });
    } else if (req.path.startsWith('/admin')) {
        res.status(500).render('error', {
            title: 'Server Error',
            message: 'Something went wrong'
        });
    } else {
        res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 The Commons API running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🔧 Admin (EJS) at http://localhost:${PORT}/admin`);
    console.log(`========================================`);
});

module.exports = app;
