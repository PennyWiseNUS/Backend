const express = require('express');
const router = express.Router();
const loanEntry = require('../models/LoanEntry');

// for adding an entry
router.post('/', async (req, res) => {
    // destructure the variables in the req first
    const {notes, amount, interestRate, repaymentDate, repaidAmount, isRecurring, recurrenceFrequency, recurrenceEndDate} = req.body;
    // in the event any portion hits an error, wrap the whole thing in a try class
    try {
        // check for any missing fields, if present return an error
        if (!amount || !interestRate || !repaymentDate) {
            console.log("Missing something");
            return res.status(400).json({msg: "Missing Parameters!"})
        };
        // making sure user does not type in inaccurate values to amount
        const amountNumber = parseFloat(amount);
        if (isNaN(amountNumber)) {
            return res.status(400).json({msg: "Invalid Amount: Must be a Number!"});
        };
        if (amountNumber < 0) {
            return res.status(400).json({msg: "Invalid Amount: Must be more than 0!"});
        };
        // else save the entry 
        const newEntry = new loanEntry({
            notes: notes,
            amount: amountNumber,
            interestRate: interestRate,
            repaymentDate: new Date(repaymentDate),
            isRecurring: isRecurring,
            recurrenceFrequency: isRecurring ? recurrenceFrequency : null,
            recurrenceEndDate: isRecurring ? new Date(recurrenceEndDate) : null,
            userId: req.user.user.id // based on the payload 
        });
        // wait for the newEntry to be saved then output the success message
        await newEntry.save();
        res.status(201).json({msg: "New Entry saved successfully!"});
    } catch (err) {
        console.log('error is here');
        res.status(400).json({msg: 'Error saving Entry', error: err.message})
    }
});

// for updating the loan list
router.patch('/:id', async (req, res) => {
    const loanId = req.params.id;
    const {amountToAdd} = req.body;
    console.log(amountToAdd);

    try {
        const updatedLoan = await loanEntry.findByIdAndUpdate(
            loanId,
            // increment operator
            {$inc: {repaidAmount: amountToAdd}},
            {new: true}
        );

        if (!updatedLoan) {
            return res.status(404).json({msg: 'Loan not found!'});
        }

        res.status(200).json({updatedLoan})
    } catch (err) {
        res.status(400).json({msg: 'Error updating loan entry', error: err.message})
    }
})

// for the loan and debt tracker
router.get('/', async (req, res) => {
    try {
        // query the db based on the individual
        const queriedEntries = await loanEntry.find({userId: req.user.user.id});
        res.status(200).json(queriedEntries);
    } catch (err) {
        res.status(500).json({msg: "Error fetching entries", error: err.message});
    }
});

module.exports = router;