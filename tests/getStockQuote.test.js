const axios = require('axios');
const getStockQuote = require('../utils/getStockQuote');

// Mock axios
jest.mock('axios');

describe('getStockQuote', () => {
  it('returns formatted stock data from API response', async () => {
    const mockApiResponse = {
      data: {
        quoteResponse: {
          result: [
            {
              symbol: 'AAPL',
              shortName: 'Apple Inc.',
              regularMarketPrice: 175.35,
              regularMarketChange: -1.2,
              regularMarketChangePercent: -0.68
            }
          ]
        }
      }
    };

    axios.get.mockResolvedValue(mockApiResponse);

    const result = await getStockQuote(['AAPL']);
    expect(result).toEqual([
      {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        price: 175.35,
        change: -1.2,
        percentageChange: -0.68
      }
    ]);
  });

  it('returns empty array if quoteResponse is missing or invalid', async () => {
    axios.get.mockResolvedValue({ data: {} });

    const result = await getStockQuote(['AAPL']);
    expect(result).toEqual([]);
  });
});
