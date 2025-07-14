const mongoose = require("mongoose");

const EmergencyFundSchema = new mongoose.Schema({
    goalAmount: {type: Number, required:true},
    savedAmount: {type: Number, default:0},
    userId: {type: String, required: true},
});

module.exports = mongoose.model("Emergency Fund", EmergencyFundSchema)