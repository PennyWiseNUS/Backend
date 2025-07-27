const express = require('express');
const router = express.Router();
const EmergencyFund = require('../models/EmergencyFund');

// getting the current emergency fund
router.get('/', async (req, res) => {
    const currentFund = await EmergencyFund.findOne({userId: req.user.user.id});
    if (!currentFund) {
        return res.status(404).json({message: "No emergency fund found."});
    }
    res.json(currentFund);
});

// posting (creating new entry if new user and updating goal if user orginally present)
router.post('/', async (req, res) => {
    const {goalAmount, savedAmount} = req.body;
    let fund = await EmergencyFund.findOne({userId: req.user.user.id});
    console.log(fund);

    if (fund) {
        fund.goalAmount = goalAmount;
        fund.savedAmount = savedAmount;
        await fund.save();
    } else {
        fund = new EmergencyFund({userId: req.user.user.id, goalAmount, savedAmount});
        await fund.save();
    }
    res.status(200).json({message: "Goal created/updated", fund});
    console.log("Emergency Fund saved/updated.")
})

router.patch('/', async (req, res) => {
    const {savedAmount} = req.body;
    const fund = await EmergencyFund.findOne({userId: req.user.user.id});
    if (!fund) {
        return res.status(404).json({message: "No emergency fund to update"});
    }
    fund.savedAmount = savedAmount;
    await fund.save();
    res.json({ message: "Saved amount updated", fund });
});

module.exports = router;