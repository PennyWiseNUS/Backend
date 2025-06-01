// fetching income and savings
// fetching and aggregating data (for each month) for the last 6 months

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Entry = require('../models/Entry');

// getting the data from an endpoint provided by the authToken middleware
router.get('/income', async (req, res) => {
    try {
        // getting the user id from current user making the request (based on the access token created in auth.js) 
        const userID = req.user.id;

        // to ensure dynamic running, set date to current day, changes daily
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // since getMonth() returns indexes of the month (jan: 0)
        const currentYear = today.getFullYear()

        // fetching all income transactions from mongoDB for current month
        // for transaction listing
        const incomeTransactions = await Entry.find({
            userID, type: 'income',
            date: {
                $gte: new Date(currentYear, currentMonth - 1, 1), // first day of current month
                $lt: new Date(currentYear, currentMonth, 1) // first day of next month
            },
        }).select('amount category date notes'); // 4 categories selected

        // aggregating income and expenses for the last 6 months (with monthly breakdowns) - for graph plotting
        const monthsToTrack = 6;
        const trackedMonthlyData = [];
        // loop from earliest month to current month
        for (let i = monthsToTrack - 1; i >= 0; i --) {
            const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
            const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 1);

            // querying both income and expenses in parallel
            const [income, expense] = await Promise.all([
                Entry.aggregate([
                    { $match: {userID, type: "income", date: {$gte: monthStart, $lt: monthEnd}} },
                    // _id is the grouping key (simple terms : group all documents together into a single group)
                    { $group: {_id: null, total: {$sum: '$amount'}} },
                ]),
                Entry.aggregate([
                    { $match: {userID, type: "expense", date: {$gte: monthStart, $lt: monthEnd}} },
                    { $group: {_id: null, total: {$sum: '$amount'}} },
                ]),
            ]);

            // for readability
            const monthName = month.toLocaleString('default', {month:'long', year:'numeric'});

            // send to tracker 
            trackedMonthlyData.push({
                month: monthName,
                income: income[0]?.total || 0,
                expense: expense[0]?.total || 0,
                savings: (income[0]?.total || 0) - (expense[0]?.total || 0)
            });
        }
        console.log(incomeTransactions)
        // sending a response back to the frontend
        res.json({incomeTransactions, trackedMonthlyData});

    } catch (err) {
        console.error('Error fetching income and savings data:', err);
        res.status(500).json({msg: 'Server Error'});
    };
});

module.exports = router;