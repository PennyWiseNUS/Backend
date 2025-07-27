const request = require('supertest');
const app = require('../testApp');
const EmergencyFund = require('../models/EmergencyFund');

jest.mock('../models/EmergencyFund');

describe('Emergency Fund Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/emergency-funds', () => {
    it('returns emergency fund if exists', async () => {
      EmergencyFund.findOne.mockResolvedValue({
        goalAmount: 5000,
        savedAmount: 1200,
        toJSON: () => ({ goalAmount: 5000, savedAmount: 1200 })
      });

      const res = await request(app).get('/api/emergency-funds');

      expect(res.statusCode).toBe(200);
      expect(res.body.goalAmount).toBe(5000);
    });

    it('returns 404 if fund not found', async () => {
      EmergencyFund.findOne.mockResolvedValue(null);

      const res = await request(app).get('/api/emergency-funds');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('No emergency fund found.');
    });
  });

  describe('POST /api/emergency-funds', () => {
    it('updates fund if already exists', async () => {
      const mockSave = jest.fn().mockResolvedValue();
      const fund = {
        goalAmount: 4000,
        savedAmount: 1000,
        save: mockSave
      };

      EmergencyFund.findOne.mockResolvedValue(fund);

      const res = await request(app)
        .post('/api/emergency-funds')
        .send({ goalAmount: 6000, savedAmount: 2000 });

      expect(mockSave).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Goal created/updated');
    });

    it('creates new fund if not exists', async () => {
      const mockSave = jest.fn().mockResolvedValue();
      EmergencyFund.findOne.mockResolvedValue(null);
      EmergencyFund.mockImplementation(() => ({
        goalAmount: 7000,
        savedAmount: 3000,
        save: mockSave
      }));

      const res = await request(app)
        .post('/api/emergency-funds')
        .send({ goalAmount: 7000, savedAmount: 3000 });

      expect(mockSave).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Goal created/updated');
    });
  });

  describe('PATCH /api/emergency-funds', () => {
    it('updates savedAmount if fund exists', async () => {
      const mockSave = jest.fn().mockResolvedValue();
      EmergencyFund.findOne.mockResolvedValue({
        savedAmount: 1500,
        save: mockSave
      });

      const res = await request(app)
        .patch('/api/emergency-funds')
        .send({ savedAmount: 2000 });

      expect(mockSave).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Saved amount updated');
    });

    it('returns 404 if no fund exists to update', async () => {
      EmergencyFund.findOne.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/emergency-funds')
        .send({ savedAmount: 999 });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('No emergency fund to update');
    });
  });
});
