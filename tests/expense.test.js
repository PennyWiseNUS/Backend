const request = require('supertest');
const Entry = require('../models/Entry');
const app = require('../testApp');

jest.mock('../models/Entry');

describe('GET /api/expense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns expense transactions and monthly breakdown', async () => {
    // Properly simulate chaining and resolved promise
    const mockSelect = jest.fn().mockResolvedValue([
      { amount: 100, category: 'food', entryDate: new Date(), notes: 'Lunch' },
      { amount: 50, category: 'transport', entryDate: new Date(), notes: 'Grab' }
    ]);
    Entry.find.mockReturnValue({ select: mockSelect });

    // Simulate 6 monthly aggregations
    Entry.aggregate = jest
      .fn()
      .mockResolvedValueOnce([{ total: 100 }])
      .mockResolvedValueOnce([{ total: 200 }])
      .mockResolvedValueOnce([{ total: 300 }])
      .mockResolvedValueOnce([{ total: 400 }])
      .mockResolvedValueOnce([{ total: 500 }])
      .mockResolvedValueOnce([{ total: 600 }]);

    const res = await request(app).get('/api/expense');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.expenseTransactions)).toBe(true);
    expect(res.body.trackedMonthlyData).toHaveLength(6);
    expect(Entry.find).toHaveBeenCalled();
    expect(Entry.aggregate).toHaveBeenCalledTimes(6);
  });

  it('returns 500 if there is a server error', async () => {
    Entry.find.mockImplementation(() => {
      return { select: jest.fn().mockRejectedValue(new Error('DB exploded')) };
    });

    const res = await request(app).get('/api/expense');

    expect(res.statusCode).toBe(500);
    expect(res.body.msg).toBe('Server Error');
  });
});
