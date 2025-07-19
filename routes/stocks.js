const express = require('express');
const axios = require('axios');
const getStockQuote = require('../utils/getStockQuote');
//const getStockChart = require('../utils/getStockChart');
const router = express.Router();

const HEADERS = {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
};

router.get('/search', async (req, res) => {
    const {query} = req.query;
    if (!query) {
        res.status(400).json({error: 'Missing query'});
    }

    try {
        const result = await axios.get(
            'https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete',
            {
                params: {q: query, region: 'US'},
                headers: HEADERS,
            }
        );

        const dataMatch = result.data.quotes?.[0];
        
        if (!dataMatch) {
            return res.status(404).json({error:'Company not found'});
        }

        console.log('Search match:', dataMatch.symbol, dataMatch.shortname);

        res.json({
            name: dataMatch.shortname,
            ticker: dataMatch.symbol,
        });

    } catch (err) {
        res.status(500).json({error: 'Search failed'});
    };
});

// Fetch quote by ticker
router.get('/:ticker', async (req, res) => {
    const {ticker} = req.params;

    try {
        const stockData = await getStockQuote(ticker);
        if (!stockData) {
            return res.status(404).json({error: 'Stock not found'});
        }
        res.json(stockData);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({error: 'Failed to fetch stock data'});
    };
});

/*
// for displaying route
router.get('/:ticker/chart', async (req, res) => {
  const { ticker } = req.params;

  try {
    const chartData = await getStockChart(ticker);
    if (!chartData) {
        return res.status(404).json({ error: 'Chart data not found' });
    }    
    res.json(chartData);

  } catch (err) {
    console.error('Chart fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});
*/

module.exports = router;