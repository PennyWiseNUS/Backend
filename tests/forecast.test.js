const { forecastNextMonth } = require('../utils/forecast');

describe('forecastNextMonth', () => {
  const mockTransactions = [
    { amount: 100, date: '2024-06-10', category: 'food' },
    { amount: 200, date: '2024-06-15', category: 'food' },
    { amount: 300, date: '2024-06-01', category: 'food' },
    { amount: 150, date: '2024-06-10', category: 'travel' }
  ];

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-07-01')); 
  });

  afterAll(() => {
    jest.useRealTimers(); 
  });

  it('calculates the average of last 3 months for a given category', () => {
    const result = forecastNextMonth(mockTransactions, 'food');
    // (100 + 200 + 300) / 3 = 200
    expect(result).toBe(200);
  });

  it('returns 0 if no transactions match the category', () => {
    const result = forecastNextMonth(mockTransactions, 'shopping');
    expect(result).toBe(0);
  });
});
