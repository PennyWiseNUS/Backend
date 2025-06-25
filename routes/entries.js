const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

// for adding an entry
router.post('/', async (req, res) => {
    // destructure the variables in the req first
    const {amount, category, type, entryDate, notes, isRecurring, recurrenceFrequency, recurrenceEndDate} = req.body;
    // in the event any portion hits an error, wrap the whole thing in a try class
    try {
        console.log("Backend Posting Start")
        // check for any missing fields, if present return an error
        if (!amount || !category || !type || !entryDate) {
            console.log("Missing something");
            return res.status(400).json({msg: "Missing Parameters!"})
        };
        if (isRecurring && (!recurrenceFrequency || !recurrenceEndDate)) {
            console.log("Missing recurring fields");
            return res.status(400).json({msg: "Missing Parameters!"})
        }
        // making sure user does not type in inaccurate values to amount
        const amountNumber = parseFloat(amount);
        if (isNaN(amountNumber)) {
            return res.status(400).json({msg: "Invalid Amount: Must be a Number!"});
        };
        if (amountNumber < 0) {
            return res.status(400).json({msg: "Invalid Amount: Must be more than 0!"});
        };
        console.log("Backend New Entry Creation")
        // else save the entry 
        const newEntry = new Entry({
            amount: amountNumber,
            category: category,
            type: type,
            entryDate: new Date(entryDate), // conversion to date
            notes: notes,
            isRecurring: isRecurring,
            recurrenceFrequency: isRecurring ? recurrenceFrequency : null,
            recurrenceEndDate: isRecurring ? new Date(recurrenceEndDate) : null, 
            userId: req.user.user.id // based on the payload 
        });
        console.log("Backend New Entry Successfully Created")
        // wait for the newEntry to be saved then output the success message
        await newEntry.save();
        res.status(201).json({msg: "New Entry saved successfully!"});
    } catch (err) {
        res.status(400).json({msg: 'Error saving Entry', error: err.message})
    }
});

// for the expenses and income tracker
router.get('/', async (req, res) => {
    try {
        // query the db based on the individual
        const queriedEntries = await Entry.find({userId: req.user.user.id});
        res.status(200).json(queriedEntries);
    } catch (err) {
        res.status(500).json({msg: "Error fetching entries", error: err.message});
    }
});

module.exports = router;