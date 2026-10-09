const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

// Dashboard - Show all data associated with the logged-in user
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.session.userId });
    res.render('dashboard', { username: req.session.username, items });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// CREATE Habit
router.post('/items', isAuthenticated, async (req, res) => {
  try {
    const { name, frequency } = req.body;
    // Simple next_due calculation (e.g., current date + frequency days)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + parseInt(frequency));
    
    const newItem = new Item({
      userId: req.session.userId,
      name,
      frequency,
      nextDue: nextDueDate.toISOString().split('T')[0]
    });
    
    await newItem.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding habit');
  }
});

// UPDATE Habit (Modify)
router.post('/items/update/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, frequency } = req.body;
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + parseInt(frequency));

    await Item.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      { name, frequency, nextDue: nextDueDate.toISOString().split('T')[0] }
    );
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating habit');
  }
});

// DELETE Habit
router.post('/items/delete/:id', isAuthenticated, async (req, res) => {
  try {
    await Item.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting habit');
  }
});

module.exports = router;