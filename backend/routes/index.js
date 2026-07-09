const express = require('express');
const router = express.Router();

// Home page - redirect to React app
router.get('/', (req, res) => {
    res.redirect('http://localhost:3000');
});

// About page - redirect to React app
router.get('/about', (req, res) => {
    res.redirect('http://localhost:3000/about');
});

module.exports = router;