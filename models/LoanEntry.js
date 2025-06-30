const mongoose = require('mongoose');

const LoanEntrySchema = new mongoose.Schema({
    amount: {type: Number, required: true},
    interestRate: {type: Number, required: true},
    type: {type: String, enum: ['expense', 'income'], required: true},
    entryDate: {type: Date, required: true},
    repaymentDate: {type: Date, required: true},
    repaidAmount: {type: Number, default: 0},
    notes: {type: String},
    isRecurring: {type: Boolean, default: false},
    recurrenceFrequency: {type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Annually'], default: 'Monthly'},
    recurrenceEndDate: {type: Date},
    nextReminderDate: {type: Date},
    // user association
    userId: {type: String, required: true},
    }, 
    {timestamps: true}
);

module.exports = mongoose.model('LoanEntry', LoanEntrySchema);