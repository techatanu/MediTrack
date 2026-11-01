import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import validate from '../src/middleware/validate.js';

const app = express();
app.use(express.json());
app.post(
  '/items/:id',
  validate({
    params: z.object({ id: z.string().regex(/^\d+$/) }),
    query: z.object({ limit: z.coerce.number().int().default(10) }),
    body: z.object({ name: z.string().min(1) }),
  }),
  (req, res) => res.json(req.valid)
);

describe('validate middleware', () => {
  test('puts parsed, coerced and stripped values on req.valid', async () => {
    const res = await request(app).post('/items/7?limit=3').send({ name: 'x', extra: 'dropped' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ params: { id: '7' }, query: { limit: 3 }, body: { name: 'x' } });
  });

  test('applies defaults', async () => {
    const res = await request(app).post('/items/7').send({ name: 'x' });
    expect(res.body.query.limit).toBe(10);
  });

  test('returns 400 with field-level details', async () => {
    const res = await request(app).post('/items/abc').send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
    expect(res.body.error.details.map((d) => d.field)).toEqual(['params.id', 'body.name']);
  });

  test('rejects operator objects in place of strings', async () => {
    const res = await request(app).post('/items/1').send({ name: { $ne: null } });
    expect(res.status).toBe(400);
  });

  test('handles a missing body', async () => {
    const res = await request(app).post('/items/1');
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe('body.name');
  });
});
