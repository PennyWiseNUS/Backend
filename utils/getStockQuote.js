const axios = require('axios');

const HEADERS = {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
};

async function getStockQuote(tickers) {
    const response = await axios.get(
        'https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes',
        {
            params: {symbols: tickers.join(','), region: 'US'},
            headers: HEADERS,
        }
    );
    
    const quotes = response.data.quoteResponse?.result;
    if (!quotes || !Array.isArray(quotes)) {
        return [];
    }
    
    return quotes.map((eachCompany) => ({
        ticker: eachCompany.symbol,
        name: eachCompany.shortName,
        price: eachCompany.regularMarketPrice,
        change: eachCompany.regularMarketChange,
        percentageChange: eachCompany.regularMarketChangePercent,
    }));
}

module.exports = getStockQuote;