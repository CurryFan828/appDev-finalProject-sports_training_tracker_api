const request = require('supertest');
const { app, db, User } = require('../server');

beforeAll(async () => {
  await db.sync({ force: true });
});

afterAll(async () => {
  await db.close();
});

describe('User API', () => {

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', password: 'password123', role: 'athlete' });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.username).toBe('testuser');
  });

  it('should login and return a token', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

});
