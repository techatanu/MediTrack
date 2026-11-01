import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';
import { bearer, createUser, freshIp } from './helpers/users.js';

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(closeTestDb);

const signup = (body) =>
  request(app).post('/api/users/signup').set('X-Forwarded-For', freshIp()).send(body);
const login = (body) =>
  request(app).post('/api/users/login').set('X-Forwarded-For', freshIp()).send(body);

const newUser = { firstName: 'Ada', lastName: 'Lovelace', email: 'Ada@Example.com ', password: 'analytical-engine' };

describe('POST /api/users/signup', () => {
  test('creates a user with a normalised email and returns a token', async () => {
    const res = await signup(newUser);
    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.data.email).toBe('ada@example.com');
    expect(JSON.stringify(res.body)).not.toContain('analytical-engine');

    const stored = await User.findOne({ email: 'ada@example.com' }).select('+password');
    expect(stored.password).not.toBe('analytical-engine');
  });

  test('token carries no email', async () => {
    const res = await signup(newUser);
    const payload = jwt.decode(res.body.token);
    expect(payload).not.toHaveProperty('email');
    expect(payload.sub).toBe(String(res.body.data.id));
  });

  test('rejects a duplicate email regardless of case with 409', async () => {
    await signup(newUser);
    const res = await signup({ ...newUser, email: 'ADA@example.com' });
    expect(res.status).toBe(409);
  });

  test.each([
    ['short password', { ...newUser, password: 'short' }],
    ['over-72-byte password', { ...newUser, password: 'é'.repeat(40) }],
    ['invalid email', { ...newUser, email: 'not-an-email' }],
    ['missing first name', { ...newUser, firstName: ' ' }],
    ['operator object as email', { ...newUser, email: { $gt: '' } }],
  ])('rejects %s with 400', async (_, body) => {
    const res = await signup(body);
    expect(res.status).toBe(400);
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });
});

describe('POST /api/users/login', () => {
  test('logs in with a differently-cased email', async () => {
    const { password } = await createUser({ email: 'grace@example.com' });
    const res = await login({ email: 'Grace@Example.COM', password });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  test('unknown email and wrong password get the identical response', async () => {
    await createUser({ email: 'grace@example.com' });
    const unknown = await login({ email: 'nobody@example.com', password: 'whatever-123' });
    const wrong = await login({ email: 'grace@example.com', password: 'whatever-123' });

    expect(unknown.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(unknown.body).toEqual({ error: { message: 'Invalid email or password' } });
    expect(wrong.body).toEqual(unknown.body);
  });

  test('rejects NoSQL operator injection', async () => {
    await createUser();
    const res = await login({ email: { $ne: null }, password: { $ne: null } });
    expect(res.status).toBe(400);
  });
});

describe('removed endpoints', () => {
  test('GET /api/users no longer lists users', async () => {
    await createUser();
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(404);
  });
});

describe('auth middleware', () => {
  test.each([
    ['no header', {}],
    ['wrong scheme', { Authorization: 'Token abc' }],
    ['garbage token', { Authorization: 'Bearer not.a.jwt' }],
  ])('rejects %s', async (_, headers) => {
    const res = await request(app).get('/api/users/profile').set(headers);
    expect(res.status).toBe(401);
  });

  test('rejects a token signed with another secret', async () => {
    const { user } = await createUser();
    const forged = jwt.sign({ tv: 0 }, 'some-other-secret-that-is-long-enough', { subject: String(user._id) });
    const res = await request(app).get('/api/users/profile').set(bearer(forged));
    expect(res.status).toBe(401);
  });

  test('rejects an unsigned (alg: none) token', async () => {
    const { user } = await createUser();
    const unsigned = jwt.sign({ tv: 0 }, null, { algorithm: 'none', subject: String(user._id) });
    const res = await request(app).get('/api/users/profile').set(bearer(unsigned));
    expect(res.status).toBe(401);
  });

  test('rejects the token of a deleted user', async () => {
    const { user, token } = await createUser();
    await User.deleteOne({ _id: user._id });
    const res = await request(app).get('/api/users/profile').set(bearer(token));
    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/profile', () => {
  test('returns the profile without the password hash', async () => {
    const { token } = await createUser({ email: 'grace@example.com' });
    const res = await request(app).get('/api/users/profile').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('grace@example.com');
    expect(res.body.data).not.toHaveProperty('password');
    expect(res.body.data).not.toHaveProperty('tokenVersion');
  });
});

describe('PUT /api/users/profile', () => {
  const update = (token, body) => request(app).put('/api/users/profile').set(bearer(token)).send(body);

  test('updates profile fields and ignores empty optional ones', async () => {
    const { token } = await createUser();
    const res = await update(token, { firstName: 'Grace', bloodGroup: 'O+', height: '170', gender: '' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ firstName: 'Grace', bloodGroup: 'O+', height: 170 });
  });

  test('cannot change password, tokenVersion or other hidden fields', async () => {
    const { user, token, password } = await createUser();
    await update(token, { password: 'hijacked-password', tokenVersion: 99 });
    const stored = await User.findById(user._id).select('+password');
    expect(await stored.matchPassword(password)).toBe(true);
    expect(stored.tokenVersion).toBe(0);
  });

  test('rejects invalid values', async () => {
    const { token } = await createUser();
    const res = await update(token, { bloodGroup: 'Z+', dateOfBirth: '2999-01-01' });
    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toEqual(['body.dateOfBirth', 'body.bloodGroup']);
  });

  test('resubmitting the unchanged email needs no password', async () => {
    const { token } = await createUser({ email: 'grace@example.com' });
    const res = await update(token, { email: 'grace@example.com', firstName: 'G' });
    expect(res.status).toBe(200);
  });

  test('changing email requires the current password', async () => {
    const { token } = await createUser();
    const res = await update(token, { email: 'new@example.com' });
    expect(res.status).toBe(400);
  });

  test('changing email with a wrong password is 403', async () => {
    const { token } = await createUser();
    const res = await update(token, { email: 'new@example.com', currentPassword: 'wrong-password' });
    expect(res.status).toBe(403);
  });

  test('cannot take an email that is already in use', async () => {
    await createUser({ email: 'taken@example.com' });
    const { token, password } = await createUser();
    const res = await update(token, { email: 'TAKEN@example.com', currentPassword: password });
    expect(res.status).toBe(409);
  });

  test('changes email with the correct password', async () => {
    const { token, password } = await createUser();
    const res = await update(token, { email: 'new@example.com', currentPassword: password });
    expect(res.status).toBe(200);
    expect((await login({ email: 'new@example.com', password })).status).toBe(200);
  });
});

describe('PUT /api/users/profile/password', () => {
  const changePassword = (token, body) =>
    request(app).put('/api/users/profile/password').set(bearer(token)).send(body);

  test('rejects a wrong current password', async () => {
    const { token } = await createUser();
    const res = await changePassword(token, { currentPassword: 'wrong-password', newPassword: 'brand-new-password' });
    expect(res.status).toBe(403);
  });

  test('rejects a weak or unchanged new password', async () => {
    const { token, password } = await createUser();
    expect((await changePassword(token, { currentPassword: password, newPassword: 'short' })).status).toBe(400);
    expect((await changePassword(token, { currentPassword: password, newPassword: password })).status).toBe(400);
  });

  test('changes the password, revokes old tokens and returns a new one', async () => {
    const { user, token, password } = await createUser();
    const res = await changePassword(token, { currentPassword: password, newPassword: 'brand-new-password' });
    expect(res.status).toBe(200);

    expect((await request(app).get('/api/users/profile').set(bearer(token))).status).toBe(401);
    expect((await request(app).get('/api/users/profile').set(bearer(res.body.token))).status).toBe(200);

    expect((await login({ email: user.email, password })).status).toBe(401);
    expect((await login({ email: user.email, password: 'brand-new-password' })).status).toBe(200);
  });
});
