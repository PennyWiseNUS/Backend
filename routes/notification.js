const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET /api/notifications - Fetch notifications for the authenticated user
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.user.id }).sort({ created_at: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
});

module.exports = router;