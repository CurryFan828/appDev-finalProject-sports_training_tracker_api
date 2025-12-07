const request = require('supertest');
const { app, db } = require('../server');

let token;

beforeAll(async () => {
  await db.sync({ force: true });

  // Create user and get token
  await request(app)
    .post('/api/users/register')
    .send({ username: 'athlete2', password: 'password123', role: 'athlete' });

  const res = await request(app)
    .post('/api/users/login')
    .send({ username: 'athlete2', password: 'password123' });

  token = res.body.token;
});

afterAll(async () => {
  await db.close();
});

describe('Goal API', () => {
  it('should create a new goal', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Make 100 shots', targetNumber: 100, deadline: '2025-12-31' });

    expect(res.statusCode).toBe(201);
    expect(res.body.goal.title).toBe('Make 100 shots');
  });

  it('should get all goals for the user', async () => {
    const res = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
