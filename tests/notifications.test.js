const request = require('supertest');
const app = require('../testApp'); // Adjust path if needed
const Notification = require('../models/Notification');

jest.mock('../models/Notification');

describe('Notification API', () => {
  const mockUserId = 'mockUserId';
  const mockNotificationId = 'notif123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/notifications', () => {
    it('should fetch user notifications', async () => {
    Notification.find.mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue([
              { _id: '1', message: 'Test', read: false, userId: mockUserId }
            ])
          }));

      const res = await request(app).get('/api/notifications');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should handle DB error on fetch', async () => {
    Notification.find.mockImplementation(() => ({
            sort: jest.fn().mockRejectedValue(new Error('DB error'))
          }));

      const res = await request(app).get('/api/notifications');

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toMatch(/error fetching/i);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      Notification.findOneAndUpdate.mockResolvedValue({ _id: mockNotificationId, read: true });

      const res = await request(app).put(`/api/notifications/${mockNotificationId}/read`);

      expect(res.statusCode).toBe(200);
      expect(res.body.read).toBe(true);
    });

    it('should return 404 if not found', async () => {
      Notification.findOneAndUpdate.mockResolvedValue(null);

      const res = await request(app).put(`/api/notifications/${mockNotificationId}/read`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('should handle DB error', async () => {
      Notification.findOneAndUpdate.mockRejectedValue(new Error('Update error'));

      const res = await request(app).put(`/api/notifications/${mockNotificationId}/read`);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toMatch(/marking as read/i);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete a notification', async () => {
      Notification.findOneAndDelete.mockResolvedValue({ _id: mockNotificationId });

      const res = await request(app).delete(`/api/notifications/${mockNotificationId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Notification deleted');
    });

    it('should return 404 if not found', async () => {
      Notification.findOneAndDelete.mockResolvedValue(null);

      const res = await request(app).delete(`/api/notifications/${mockNotificationId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('should handle DB error', async () => {
      Notification.findOneAndDelete.mockRejectedValue(new Error('Delete error'));

      const res = await request(app).delete(`/api/notifications/${mockNotificationId}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toMatch(/deleting notification/i);
    });
  });

  describe('DELETE /api/notifications', () => {
    it('should delete all notifications', async () => {
      Notification.deleteMany.mockResolvedValue({ deletedCount: 5 });

      const res = await request(app).delete(`/api/notifications`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('All notifications deleted');
    });

    it('should handle DB error', async () => {
      Notification.deleteMany.mockRejectedValue(new Error('Delete all error'));

      const res = await request(app).delete(`/api/notifications`);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toMatch(/failed to clear/i);
    });
  });
});
