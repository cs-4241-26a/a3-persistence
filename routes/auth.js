const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path to your User model if needed

// Render Login Page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Handle Login Form Submission
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user || user.password !== password) {
            return res.render('login', { error: 'Invalid username or password' });
        }
        
        req.session.userId = user._id;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'An error occurred during login' });
    }
});

// Render Register Page
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// Handle Register Form Submission
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: 'Username is already taken' });
        }
        
        // Create and save new user
        const newUser = new User({ username, password });
        await newUser.save();
        
        // Automatically log them in after registration
        req.session.userId = newUser._id;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Error creating account' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

module.exports = router;