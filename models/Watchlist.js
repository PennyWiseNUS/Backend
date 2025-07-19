const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
    userId: {type: String, required: true, unique: true},
    favouriteStocks: {type: [String], default: []}, // default is empty, means no stocks tracked
});

module.exports = mongoose.model('Watchlist', WatchlistSchema);