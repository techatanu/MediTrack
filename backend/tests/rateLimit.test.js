import request from 'supertest';
import app from '../src/app.js';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';
import { bearer, createUser } from './helpers/users.js';

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(closeTestDb);

describe('rate limiting', () => {
  test('blocks an IP after 10 failed logins', async () => {
    const { user } = await createUser();
    const attempt = () =>
      request(app)
        .post('/api/users/login')
        .set('X-Forwarded-For', '203.0.113.1')
        .send({ email: user.email, password: 'wrong-password' });

    for (let i = 0; i < 10; i += 1) expect((await attempt()).status).toBe(401);
    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.message).toMatch(/too many attempts/i);
  });

  test('successful logins do not count toward the limit', async () => {
    const { user, password } = await createUser();
    for (let i = 0; i < 12; i += 1) {
      const res = await request(app)
        .post('/api/users/login')
        .set('X-Forwarded-For', '203.0.113.2')
        .send({ email: user.email, password });
      expect(res.status).toBe(200);
    }
  });

  test('limits are per client IP', async () => {
    const { user } = await createUser();
    for (let i = 0; i < 11; i += 1) {
      await request(app)
        .post('/api/users/login')
        .set('X-Forwarded-For', '203.0.113.3')
        .send({ email: user.email, password: 'wrong-password' });
    }
    const other = await request(app)
      .post('/api/users/login')
      .set('X-Forwarded-For', '203.0.113.4')
      .send({ email: user.email, password: 'wrong-password' });
    expect(other.status).toBe(401);
  });

  test('blocks an IP after 10 signups in an hour', async () => {
    const signup = (i) =>
      request(app)
        .post('/api/users/signup')
        .set('X-Forwarded-For', '203.0.113.5')
        .send({ firstName: 'S', email: `s${i}@example.com`, password: 'password-123' });

    for (let i = 0; i < 10; i += 1) expect((await signup(i)).status).toBe(201);
    expect((await signup(10)).status).toBe(429);
  });

  test('throttles current-password guessing per user', async () => {
    const { token } = await createUser();
    const guess = () =>
      request(app)
        .put('/api/users/profile/password')
        .set(bearer(token))
        .send({ currentPassword: 'guess-password', newPassword: 'brand-new-password' });

    for (let i = 0; i < 10; i += 1) expect((await guess()).status).toBe(403);
    expect((await guess()).status).toBe(429);
  });
});
