import request from 'supertest';
import app from '../src/app.js';

describe('app hardening', () => {
  test('health check responds', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });

  test('sets helmet security headers and hides Express', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('rejects JSON bodies over 1mb with 413', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ email: 'a@b.co', password: 'x'.repeat(1024 * 1024 + 10) }));
    expect(res.status).toBe(413);
    expect(res.body.error.message).toBeDefined();
  });

  test('malformed JSON is a 400, not a 500', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');
    expect(res.status).toBe(400);
  });

  test('unknown routes return a JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { message: 'Route not found' } });
  });
});

describe('CORS', () => {
  const allowOrigin = async (origin) =>
    (await request(app).get('/api/health').set('Origin', origin)).headers['access-control-allow-origin'];

  test.each([
    'http://localhost:5173',
    'https://medi-track-lemon.vercel.app',
    'https://medi-track-git-feature-x-team.vercel.app',
  ])('allows %s', async (origin) => {
    expect(await allowOrigin(origin)).toBe(origin);
  });

  test.each([
    'https://evil.example',
    'https://medi-track-x.vercel.app.evil.example',
    'https://evil.example/https://medi-track-x.vercel.app',
  ])('blocks %s', async (origin) => {
    expect(await allowOrigin(origin)).toBeUndefined();
  });
});
