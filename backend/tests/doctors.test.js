import request from 'supertest';
import app from '../src/app.js';
import Doctor from '../src/models/Doctor.js';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';
import { bearer, createUser } from './helpers/users.js';

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(closeTestDb);

const doctorBody = { name: 'Dr. House', specialization: 'Diagnostics', hospital: 'Princeton', phone: '+1 (555) 010-0101' };

describe('doctors', () => {
  test('creates and lists only your own doctors', async () => {
    const a = await createUser();
    const b = await createUser();
    await request(app).post('/api/doctors').set(bearer(a.token)).send(doctorBody);
    await request(app).post('/api/doctors').set(bearer(b.token)).send({ ...doctorBody, name: 'Dr. B' });

    const res = await request(app).get('/api/doctors').set(bearer(a.token));
    expect(res.body.data.map((d) => d.name)).toEqual(['Dr. House']);
  });

  test('cannot update or delete another user’s doctor', async () => {
    const a = await createUser();
    const b = await createUser();
    const bDoctor = await Doctor.create({ ...doctorBody, user: b.user._id });

    const upd = await request(app).put(`/api/doctors/${bDoctor._id}`).set(bearer(a.token)).send({ name: 'x' });
    const del = await request(app).delete(`/api/doctors/${bDoctor._id}`).set(bearer(a.token));
    expect(upd.status).toBe(404);
    expect(del.status).toBe(404);
    expect((await Doctor.findById(bDoctor._id)).name).toBe('Dr. House');
  });

  test('deletes your own doctor with 204', async () => {
    const { user, token } = await createUser();
    const doctor = await Doctor.create({ ...doctorBody, user: user._id });
    const res = await request(app).delete(`/api/doctors/${doctor._id}`).set(bearer(token));
    expect(res.status).toBe(204);
    expect(await Doctor.exists({ _id: doctor._id })).toBeNull();
  });

  test('partial update leaves other fields intact', async () => {
    const { user, token } = await createUser();
    const doctor = await Doctor.create({ ...doctorBody, user: user._id });
    const res = await request(app).put(`/api/doctors/${doctor._id}`).set(bearer(token)).send({ hospital: 'Mercy' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: 'Dr. House', hospital: 'Mercy' });
  });

  test.each([
    ['missing name', { ...doctorBody, name: '' }],
    ['bad phone', { ...doctorBody, phone: '<script>' }],
    ['operator object', { ...doctorBody, name: { $gt: '' } }],
  ])('rejects %s with 400', async (_, body) => {
    const { token } = await createUser();
    const res = await request(app).post('/api/doctors').set(bearer(token)).send(body);
    expect(res.status).toBe(400);
  });

  test('malformed id is a 400', async () => {
    const { token } = await createUser();
    const res = await request(app).delete('/api/doctors/123').set(bearer(token));
    expect(res.status).toBe(400);
  });
});
