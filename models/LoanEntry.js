const mongoose = require('mongoose');

const LoanEntrySchema = new mongoose.Schema({
    amount: {type: Number, required: true},
    interestRate: {type: Number, required: true},
    repaymentDate: {type: Date, required: true},
    repaidAmount: {type: Number, default: 0},
    date: {type: Date, required: true},
    notes: {type: String},
    // user association
    userId: {type: String, required: true},
    }, 
    {timestamps: true}
);

module.exports = mongoose.model('LoanEntry', LoanEntrySchema);