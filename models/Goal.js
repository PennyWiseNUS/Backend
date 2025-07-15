const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
    goalName: {type: String, required: true},
    goalAmount: {type: Number, required: true},
    currentAmount: {type: Number, default: 0},
    goalDeadline: {type: Date, required: true},
    userId: {type: String, required: true},
}, {timestamps: true});

module.exports = mongoose.model('Goal', GoalSchema);