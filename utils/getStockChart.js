const axios = require('axios');

const HEADERS = {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
};

async function getStockChart(ticker) {
    const response = await axios.get(
        'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-chart',
        {
            params: {
                symbol: ticker,
                interval: '1mo',
                range: '1y',
                region : 'US'
            },
            headers: HEADERS,
        }
    )

    const chart = response.data.chart?.result?.[0];
    if (!chart)
        {return null};

    const timestamps = chart.timestamp;
    const prices = chart.indicators.quote[0].close;

    return timestamps.map((timestamp, index) => ({
        date: new Date(timestamp * 1000), // Convert from Unix timestamp
        price: prices[index],
    }));
};

module.exports = getStockChart;