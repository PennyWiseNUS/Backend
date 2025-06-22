const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Entry = require('../models/Entry');

// GET /api/expense — return expense transactions and monthly breakdown
router.get('/', async (req, res) => {
    try {
      const userID = req.user.id;
  
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
  
      const monthsToTrack = 6;
      // Fetch 6 months expenses
      const expenseTransactions = await Entry.find({
        userID,
        type: 'expense',
        entryDate: {
          $gte: new Date(currentYear, currentMonth - monthsToTrack, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1),
        },
      }).select('amount category entryDate notes');
  
      // Track past 6 months
      const trackedMonthlyData = [];
  
      for (let i = monthsToTrack - 1; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  
        const [expense] = await Promise.all([
          Entry.aggregate([
            { $match: { userID, type: 'expense', entryDate: { $gte: monthStart, $lt: monthEnd } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
        ]);
  
        const monthName = month.toLocaleString('default', { month: 'long', year: 'numeric' });
  
        trackedMonthlyData.push({
          month: monthName,
          expense: expense[0]?.total || 0
        });
      }
  
      res.json({ expenseTransactions, trackedMonthlyData });
    } catch (err) {
      console.error('Error fetching expense data:', err);
      res.status(500).json({ msg: 'Server Error' });
    }
  });

  module.exports = router;
