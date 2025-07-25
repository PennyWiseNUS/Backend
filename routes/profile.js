const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // securely hashing passwords
const User = require('../models/User');

router.get('/', async (req, res) => {
    try {
      console.log("test");
      const user = await User.findById(req.user.user.id).select('email');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      console.error('Profile error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  });

router.post('/change-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
  
    try {
      const user = await User.findById(req.user.user.id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);
      user.password = hashed;
      await user.save();
  
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('Change password error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
module.exports = router;
  