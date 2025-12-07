const request = require('supertest');
const { app, db } = require('../server');

let token;

beforeAll(async () => {
  await db.sync({ force: true });

  // Create a user and get a token
  await request(app)
    .post('/api/users/register')
    .send({ username: 'athlete1', password: 'password123', role: 'athlete' });

  const res = await request(app)
    .post('/api/users/login')
    .send({ username: 'athlete1', password: 'password123' });

  token = res.body.token;
});

afterAll(async () => {
  await db.close();
});

describe('Workout API', () => {
  it('should create a new workout', async () => {
    const res = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'Basketball', date: '2025-12-06', duration: 60 });

    expect(res.statusCode).toBe(201);
    expect(res.body.workout.type).toBe('Basketball');
  });

  it('should get all workouts for the user', async () => {
    const res = await request(app)
      .get('/api/workouts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
