const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

// adding a goal entry
router.post('/', async (req, res) => {
    const {goalName, goalAmount, goalDeadline} = req.body;
    console.log("Parameters:", {goalName, goalAmount, goalDeadline});
    try {
        if (!goalName || !goalAmount || !goalDeadline) {
            console.log("Missing new Goal parameters");
            return res.status(400).json({msg: "Missing Parameters"});
        }
        const newGoal = new Goal({
            goalName: goalName,
            goalAmount: goalAmount,
            currentAmount: 0,
            goalDeadline: goalDeadline,
            userId: req.user.user.id
        })
        console.log("New Goal model created.")
        await newGoal.save();
        console.log("New Goal saved successfully.");
        res.status(201).json({msg: "New Goal saved successfully!"});
    } catch (err) {
        res.status(400).json({msg: 'Error saving Goal', error: err.message});
    }
});

router.patch('/:id', async (req, res) => {
    const goalId = req.params.id;
    const {amountUpdate, dateAdded} = req.body;

    try {
        const goal = await Goal.findById(goalId);
        if (!goal) { console.log("goal not found") };

        goal.currentAmount += amountUpdate;
        const updatedGoal = await goal.save();

        res.status(200).json({updatedGoal});
    } catch (err) {
        res.status(400).json({msg: 'Error updating Goal', error: err.message})
    }
})

router.get('/', async (req, res) => {
    try {
        // query the db based on the individual
        const queriedGoals = await Goal.find({userId: req.user.user.id});
        res.status(200).json(queriedGoals);
    } catch (err) {
        res.status(500).json({msg: "Error fetching goals", error: err.message});
    }
});

module.exports = router;