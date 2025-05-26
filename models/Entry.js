const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
    amount: {type: Number, required: true},
    category: {type: String, required: true},
    // enum is to restrict the allowed values
    type: {type: String, enum: ['expense', 'income'], required: true},
    date: {type: Date, required: true},
    notes: {type: String},
    // user association
    userId: {type: String, required: true},
    }, 
    {timestamps: true}
);

module.exports = mongoose.model('Entry', EntrySchema);