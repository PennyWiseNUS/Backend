const request = require('supertest');
const app = require('../testApp');
const User = require('../models/User');

// Mock User model
jest.mock('../models/User');
const bcrypt = require('bcryptjs');
jest.mock('bcryptjs');

const mockJwtSign = jest.fn();
jest.mock('jsonwebtoken', () => ({
  sign: (...args) => mockJwtSign(...args)
}));

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user and return token', async () => {
    // no existing user
    User.findOne.mockResolvedValue(null);
    User.prototype.save = jest.fn().mockResolvedValue();
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    mockJwtSign.mockImplementation((payload, secret, options, cb) => cb(null, 'mockedToken'));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe('mockedToken');
    expect(User.prototype.save).toHaveBeenCalled();
  });

  it('should return 400 if user already exists', async () => {
    User.findOne.mockResolvedValue({ email: 'existing@example.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'existing@example.com', password: '123456' });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe('User already exists');
  });

  it('should return 500 on internal error', async () => {
    User.findOne.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'error@example.com', password: '123456' });

    expect(res.statusCode).toBe(500);
    expect(res.text).toBe('Server error');
  });
});

const express = require('express');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');

const authRoutes = require('../routes/auth');

app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes - POST /login', () => {
    let mockUser;
  
    beforeEach(async () => {
      jest.clearAllMocks();
      mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
      };
    });

  it('should return token on successful login', async () => {
    User.findOne.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    jest.spyOn(jwt, 'sign').mockImplementation((payload, secret, options, cb) => {
      cb(null, 'mocked-jwt-token');
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe('mocked-jwt-token');
  });

  it('should return 400 if email is not found', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'notfound@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe('Invalid Email or Password');
  });

  it('should return 400 if password is incorrect', async () => {
    User.findOne.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false); // simulate wrong password

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe('Invalid Email or Password');
  });

  it('should return 500 if server error occurs', async () => {
    User.findOne.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(500);
    expect(res.text).toBe('Server error');
  });
});
