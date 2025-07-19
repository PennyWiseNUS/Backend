const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');
const getStockQuote = require('../utils/getStockQuote');

// getting watchlist
router.get('/:userId', async (req, res) => {
    const {userId} = req.params;

    try {
        const userWatchList = await Watchlist.findOne({userId});
        if (!userWatchList || userWatchList.favouriteStocks.length === 0) {
            return res.json([]);
        }

        const tickers = userWatchList.favouriteStocks;
        const stockDataList = await getStockQuote(tickers);
        
        res.json(stockDataList);
    } catch (err) {
        console.error('Watchlist route error:', err.message);
        res.status(500).json({error: 'Failed to load watchlist data'});
    }
});

// adding to watch list
router.post('/:userId', async (req, res) => {
    const {userId} = req.params;
    const {ticker} = req.body;
    if (!ticker) {
        return res.status(400).json({error: 'No ticker found!'});
    }

    try {
        let userWatchList = await Watchlist.findOne({userId});
        console.log(userWatchList)
        if (!userWatchList) {
            userWatchList = new Watchlist({userId, favouriteStocks: [ticker]});
        } else {
            // don't duplicate if the ticker is present
            if (!(userWatchList.favouriteStocks.includes(ticker))) {
                userWatchList.favouriteStocks.push(ticker);
            }
        }
        await userWatchList.save();
        return res.status(200).json({message: 'Added to watchlist'});
    } catch (err) {
        console.error('Error adding/updating watchlist');
        res.status(500).json({error: "Failed to update watchlist"})
    }
})

module.exports = router;