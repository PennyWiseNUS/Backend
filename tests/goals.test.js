const request = require('supertest');
const app = require('../testApp');
const Goal = require('../models/Goal');

jest.mock('../models/Goal');

describe('Goal Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/goals', () => {
    it('creates a new goal if all parameters are valid', async () => {
      Goal.mockImplementation(() => ({ save: jest.fn() }));

      const res = await request(app).post('/api/goals').send({
        goalName: 'Buy Laptop',
        goalAmount: 1500,
        goalDeadline: '2025-12-31'
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.msg).toBe('New Goal saved successfully!');
    });

    it('returns 400 if parameters are missing', async () => {
      const res = await request(app).post('/api/goals').send({
        goalName: '',
        goalAmount: 1000,
        goalDeadline: ''
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Missing Parameters');
    });

    it('returns 400 if goal creation fails', async () => {
      Goal.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('DB Error'))
      }));

      const res = await request(app).post('/api/goals').send({
        goalName: 'Trip',
        goalAmount: 2000,
        goalDeadline: '2025-12-01'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Error saving Goal');
    });
  });

  describe('PATCH /api/goals/:id', () => {
    it('updates the goal amount correctly', async () => {
      const mockGoal = {
        currentAmount: 500,
        save: jest.fn().mockResolvedValue({ currentAmount: 700 }),
      };
      Goal.findById.mockResolvedValue(mockGoal);

      const res = await request(app)
        .patch('/api/goals/123abc')
        .send({ amountUpdate: 200, dateAdded: '2025-08-01' });

      expect(res.statusCode).toBe(200);
      expect(res.body.updatedGoal.currentAmount).toBe(700);
    });

    it('returns 400 if goal not found', async () => {
      Goal.findById.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/goals/123abc')
        .send({ amountUpdate: 200 });

      expect(res.statusCode).toBe(400); // Patch doesn't return anything in this case
    });

    it('returns 400 if goal update fails', async () => {
      Goal.findById.mockRejectedValue(new Error('DB exploded'));

      const res = await request(app)
        .patch('/api/goals/123abc')
        .send({ amountUpdate: 100 });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Error updating Goal');
    });
  });

  describe('GET /api/goals', () => {
    it('returns list of goals for the user', async () => {
      const mockGoals = [
        { goalName: 'Car', goalAmount: 5000, currentAmount: 2000 },
        { goalName: 'Vacation', goalAmount: 3000, currentAmount: 1000 }
      ];
      Goal.find.mockResolvedValue(mockGoals);

      const res = await request(app).get('/api/goals');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockGoals);
    });

    it('returns 500 if fetching goals fails', async () => {
      Goal.find.mockRejectedValue(new Error('DB down'));

      const res = await request(app).get('/api/goals');

      expect(res.statusCode).toBe(500);
      expect(res.body.msg).toBe('Error fetching goals');
    });
  });
});
