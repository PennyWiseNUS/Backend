const express = require('express');
const router = express.Router();
const loanEntry = require('../models/LoanEntry');
const Notification = require('../models/Notification');
const { startOfDay } = require('date-fns');
const { createNotificationForEntry, getNextDate } = require('../utils/helpers');

// for adding an entry
router.post('/', async (req, res) => {
    // destructure the variables in the req first
    const {notes, amount, type, entryDate, interestRate, repaymentDate, repaidAmount, isRecurring, recurrenceFrequency, recurrenceEndDate} = req.body;
    console.log(
        "Parameters:", {notes, amount, entryDate, interestRate, repaymentDate, repaidAmount, isRecurring, recurrenceFrequency, recurrenceEndDate}
    );
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

        // total repayment amount with interest calculation
        const startDate = new Date(entryDate);
        const endDate = new Date(repaymentDate);

        // calc num of months in years
        const yearDiff = endDate.getFullYear() - startDate.getFullYear();
        const monthDiff = endDate.getMonth() - startDate.getMonth();
        const dateDiff = (endDate.getDate() < startDate.getDate()) ? 0 : 1;
        const numMonths = yearDiff * 12 + monthDiff + dateDiff;
        const numMonthsInYears = numMonths/12;
        console.log("Data:", {yearDiff,monthDiff,dateDiff,numMonths,numMonthsInYears});

        // calc interest
        const interest = amount * interestRate * numMonthsInYears;
        const totalRepaymentAmount = parseFloat(amount) + interest;

        // else save the entry 
        const newEntry = new loanEntry({
            notes: notes,
            amount: amountNumber,
            totalRepaymentAmount: totalRepaymentAmount,
            type: type,
            entryDate: new Date(entryDate),
            interestRate: interestRate,
            repaidAmount: repaidAmount,
            repaymentDate: new Date(repaymentDate),
            isRecurring: isRecurring,
            recurrenceFrequency: isRecurring ? recurrenceFrequency : null,
            recurrenceEndDate: isRecurring ? new Date(recurrenceEndDate) : null,
            nextReminderDate: null,
            userId: req.user.user.id // based on the payload 
        });
        if (req.body.isRecurring) {
            const entryDateStart = startOfDay(new Date(req.body.entryDate));
            const nextDate = getNextDate(entryDateStart, req.body.recurrenceFrequency);
            const nextReminderDate = startOfDay(nextDate);
            newEntry.nextReminderDate = nextReminderDate <= new Date(req.body.recurrenceEndDate) ? nextReminderDate : null;
        }
        // wait for the newEntry to be saved then output the success message
        await newEntry.save();
        console.log("New Loan Entry Saved");
        res.status(201).json({msg: "New Entry saved successfully!"});
    } catch (err) {
        console.log('error is here: Loan Entry not able to be saved');
        res.status(400).json({msg: 'Error saving Entry', error: err.message})
    }
});

// for updating the loan list
router.patch('/:id', async (req, res) => {
    const loanId = req.params.id;
    const {amountToAdd, entryDate, isRecurring, recurrenceFrequency, recurrenceEndDate} = req.body;
    console.log(amountToAdd);

    try {
        // get the loan entry first
        const loan = await loanEntry.findById(loanId);
        
        loan.repaidAmount += amountToAdd;

        if (isRecurring) {
            const entryDateStart = startOfDay(new Date(entryDate));
            const nextDate = getNextDate(entryDateStart, recurrenceFrequency);
            const nextReminderDate = startOfDay(nextDate);
            loan.nextReminderDate = nextReminderDate <= new Date(recurrenceEndDate) ? nextReminderDate : null;
        }
        console.log("Cleared isRecurring step");
        console.log(loan);
        const updatedLoan = await loan.save();
        {/* Debugger
        try {
            const updatedLoan = await loan.save();
            console.log("Loan Successfully Updated");
            res.status(200).json({ updatedLoan });
        } catch (saveError) {
            console.error("Error during loan.save():", saveError);
            return res.status(400).json({ msg: 'Error saving updated loan', error: saveError.message });
        }
        */}
        console.log("Loan Successfully Updated");

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