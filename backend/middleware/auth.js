const { verifyToken } = require('../config/jwt');

// Existing session-based auth (keep for EJS routes)
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    req.flash('error', 'Please log in to access this page');
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.userRole === 'admin') {
        return next();
    }
    req.flash('error', 'Admin access required');
    res.redirect('/');
};

const setUser = (req, res, next) => {
    res.locals.user = req.session.userId ? {
        id: req.session.userId,
        username: req.session.username,
        fullName: req.session.fullName,
        role: req.session.userRole
    } : null;
    next();
};

// New: API authentication middleware (for JWT)
const authenticateAPI = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log('No authorization header provided');
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!authHeader.startsWith('Bearer ')) {
        console.log('Invalid authorization header format:', authHeader);
        return res.status(401).json({ error: 'Invalid authorization format' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        console.log('No token found in authorization header');
        return res.status(401).json({ error: 'Token not provided' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        console.log('Token verification failed for token:', token.substring(0, 20) + '...');
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
};

// Admin check for API
const isAdminAPI = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Admin access required' });
};

module.exports = {
    isAuthenticated,
    isAdmin,
    setUser,
    authenticateAPI,
    isAdminAPI
};