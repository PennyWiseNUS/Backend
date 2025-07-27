const request = require('supertest');
const Entry = require('../models/Entry');
const Notification = require('../models/Notification');
const { createNotificationForEntry } = require('../utils/helpers');
const app = require('../testApp');

jest.mock('../models/Entry');
jest.mock('../models/Notification');
jest.mock('../utils/helpers', () => ({
  createNotificationForEntry: jest.fn(),
  getNextDate: jest.fn(() => new Date('2025-08-01')),
}));

describe('Entry Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/entries', () => {
    it('should return entries for user', async () => {
      Entry.find.mockResolvedValue([{ amount: 50, category: 'food' }]);

      const res = await request(app).get('/api/entries');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(Entry.find).toHaveBeenCalledWith({ userId: 'mockUserId' });
    });

    it('should handle errors on GET', async () => {
      Entry.find.mockRejectedValue(new Error('DB failure'));

      const res = await request(app).get('/api/entries');

      expect(res.statusCode).toBe(500);
      expect(res.body.msg).toBe('Error fetching entries');
    });
  });

  describe('POST /api/entries', () => {
    const baseEntry = {
      amount: '100',
      category: 'Food',
      type: 'expense',
      entryDate: '2025-07-01',
    };

    it('should save new entry and create notification', async () => {
      Entry.mockImplementation((data) => ({
        ...data,
        save: jest.fn(),
      }));

      const res = await request(app)
        .post('/api/entries')
        .send(baseEntry);

      expect(res.statusCode).toBe(201);
      expect(res.body.msg).toBe('New Entry saved successfully!');
      expect(createNotificationForEntry).toHaveBeenCalled();
    });

    it('should return 400 if missing required fields', async () => {
      const res = await request(app).post('/api/entries').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Missing Parameters!');
    });

    it('should reject invalid amount', async () => {
      const res = await request(app)
        .post('/api/entries')
        .send({ ...baseEntry, amount: 'abc' });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toMatch(/Invalid Amount/);
    });

    it('should reject negative amount', async () => {
      const res = await request(app)
        .post('/api/entries')
        .send({ ...baseEntry, amount: '-5' });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toMatch(/Invalid Amount/);
    });

    it('should handle recurring entries and compute nextReminderDate', async () => {
      const mockSave = jest.fn();
      Entry.mockImplementation((data) => ({
        ...data,
        save: mockSave,
      }));

      const res = await request(app)
        .post('/api/entries')
        .send({
          ...baseEntry,
          isRecurring: true,
          recurrenceFrequency: 'Monthly',
          recurrenceEndDate: '2025-12-01',
        });

      expect(res.statusCode).toBe(201);
      expect(mockSave).toHaveBeenCalled();
      expect(createNotificationForEntry).toHaveBeenCalled();
    });

    it('should handle internal server errors gracefully', async () => {
      Entry.mockImplementation(() => {
        throw new Error('Simulated save error');
      });

      const res = await request(app).post('/api/entries').send(baseEntry);

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Error saving Entry');
    });
  });
});
