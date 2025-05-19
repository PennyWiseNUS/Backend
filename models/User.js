const mongoose = require('mongoose');

// def the structure of the data -- define how the User data will look in DB
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true // automatically converted to lowercase to prevent issues caused by case insensitivity
    },
    password: {
        type: String,
        required: true
    }
});

// creating a model based on userSchema defined
// enables interaction with the User collection in DB
// makes the User model available to other parts of the application (User object created)
module.exports = mongoose.model('User', UserSchema);