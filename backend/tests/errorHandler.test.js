import { jest } from '@jest/globals';
import express from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler.js';
import HttpError from '../src/utils/httpError.js';

const Thing = mongoose.model(
  'ErrorHandlerThing',
  new mongoose.Schema({ email: { type: String, required: true }, kind: { type: String, enum: ['a', 'b'] } })
);

// Each route throws one kind of error, the way a controller would.
const app = express();
app.use(express.json({ limit: '1kb' }));
app.get('/http-error', () => {
  throw new HttpError(418, 'Short and stout', [{ field: 'x', message: 'y' }]);
});
app.get('/validation', async () => {
  await new Thing({ kind: 'secret-value' }).validate();
});
app.get('/cast', async () => {
  // Built directly so no database connection is needed.
  throw new mongoose.Error.CastError('ObjectId', 'not-an-id', '_id');
});
app.get('/duplicate', async () => {
  throw Object.assign(new Error('E11000 duplicate key error dup key: { email: "private@example.com" }'), {
    code: 11000,
    keyPattern: { email: 1 },
    keyValue: { email: 'private@example.com' },
  });
});
app.get('/crash', async () => {
  throw new Error('db password is hunter2 and user private@example.com');
});
app.post('/echo', (req, res) => res.json({ data: req.body }));
app.use(notFoundHandler);
app.use(errorHandler);

let consoleError;
beforeEach(() => {
  consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => consoleError.mockRestore());

const loggedText = () => consoleError.mock.calls.flat().join(' ');

describe('errorHandler', () => {
  test('passes HttpError status, message and details through', async () => {
    const res = await request(app).get('/http-error');
    expect(res.status).toBe(418);
    expect(res.body).toEqual({ error: { message: 'Short and stout', details: [{ field: 'x', message: 'y' }] } });
  });

  test('maps Mongoose validation errors to 400 without echoing values', async () => {
    const res = await request(app).get('/validation');
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        { field: 'email', message: 'email is required' },
        { field: 'kind', message: 'kind is invalid' },
      ])
    );
    expect(JSON.stringify(res.body)).not.toContain('secret-value');
  });

  test('maps CastError to 404', async () => {
    const res = await request(app).get('/cast');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Resource not found');
  });

  test('maps duplicate keys to 409 naming the field but not the value', async () => {
    const res = await request(app).get('/duplicate');
    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe('That email is already in use');
    expect(JSON.stringify(res.body)).not.toContain('private@example.com');
  });

  test('hides unexpected errors behind a generic 500 and logs no message text', async () => {
    const res = await request(app).get('/crash');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { message: 'Internal Server Error' } });
    expect(loggedText()).toContain('GET /crash');
    expect(loggedText()).not.toContain('hunter2');
    expect(loggedText()).not.toContain('private@example.com');
  });

  test('does not log client errors', async () => {
    await request(app).get('/cast');
    await request(app).get('/http-error');
    expect(consoleError).not.toHaveBeenCalled();
  });

  test('malformed JSON is a 400', async () => {
    const res = await request(app).post('/echo').set('Content-Type', 'application/json').send('{"a":');
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Malformed JSON body');
  });

  test('oversized bodies are a 413', async () => {
    const res = await request(app).post('/echo').send({ big: 'x'.repeat(2048) });
    expect(res.status).toBe(413);
    expect(res.body.error.message).toBe('Request body is too large');
  });

  test('unknown routes are a JSON 404', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { message: 'Route not found' } });
  });
});
