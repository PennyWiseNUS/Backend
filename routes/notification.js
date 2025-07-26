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

router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.user.id },
      { $set: { read: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error marking as read', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.user.id, // Secure: ensure only owner can delete
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting notification', error: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.user.id });
    res.json({ message: 'All notifications deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear notifications' });
  }
});



module.exports = router;