import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import Doctor from '../src/models/Doctor.js';
import Report from '../src/models/Report.js';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';
import { bearer, createUser } from './helpers/users.js';

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(closeTestDb);

const makeDoctor = (user, name = 'Dr. Who') =>
  Doctor.create({ name, specialization: 'GP', hospital: 'General', user: user._id });

const makeReport = (user, overrides = {}) =>
  Report.create({
    title: 'Blood test',
    category: 'Lab',
    reportDate: new Date('2024-01-15'),
    user: user._id,
    ...overrides,
  });

// Two users, each with a doctor and a report.
const setup = async () => {
  const a = await createUser();
  const b = await createUser();
  a.doctor = await makeDoctor(a.user, 'Dr. A');
  b.doctor = await makeDoctor(b.user, 'Dr. B');
  a.report = await makeReport(a.user, { title: 'A report', doctor: a.doctor._id });
  b.report = await makeReport(b.user, { title: 'B report', doctor: b.doctor._id });
  return { a, b };
};

const validBody = { title: 'CBC', category: 'Lab', reportDate: '2024-03-01' };

describe('ownership: user A cannot touch user B’s data', () => {
  test('listing only returns your own reports', async () => {
    const { a } = await setup();
    const res = await request(app).get('/api/reports').set(bearer(a.token));
    expect(res.status).toBe(200);
    expect(res.body.data.map((r) => r.title)).toEqual(['A report']);
  });

  test('filtering by another user’s doctor returns nothing', async () => {
    const { a, b } = await setup();
    const res = await request(app).get(`/api/reports?doctor=${b.doctor._id}`).set(bearer(a.token));
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('cannot read B’s report', async () => {
    const { a, b } = await setup();
    const res = await request(app).get(`/api/reports/${b.report._id}`).set(bearer(a.token));
    expect(res.status).toBe(404);
  });

  test('cannot edit B’s report', async () => {
    const { a, b } = await setup();
    const res = await request(app)
      .put(`/api/reports/${b.report._id}`)
      .set(bearer(a.token))
      .send({ title: 'hijacked' });
    expect(res.status).toBe(404);
    expect((await Report.findById(b.report._id)).title).toBe('B report');
  });

  test('cannot delete B’s report', async () => {
    const { a, b } = await setup();
    const res = await request(app).delete(`/api/reports/${b.report._id}`).set(bearer(a.token));
    expect(res.status).toBe(404);
    expect(await Report.exists({ _id: b.report._id })).toBeTruthy();
  });

  test('cannot create a report linked to B’s doctor', async () => {
    const { a, b } = await setup();
    const res = await request(app)
      .post('/api/reports')
      .set(bearer(a.token))
      .send({ ...validBody, doctor: String(b.doctor._id) });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Doctor not found');
    expect(await Report.countDocuments({ user: a.user._id })).toBe(1);
  });

  test('cannot relink own report to B’s doctor', async () => {
    const { a, b } = await setup();
    const res = await request(app)
      .put(`/api/reports/${a.report._id}`)
      .set(bearer(a.token))
      .send({ doctor: String(b.doctor._id) });
    expect(res.status).toBe(400);
    expect(String((await Report.findById(a.report._id)).doctor)).toBe(String(a.doctor._id));
  });

  test('cannot move a report to another user via the body', async () => {
    const { a, b } = await setup();
    await request(app)
      .put(`/api/reports/${a.report._id}`)
      .set(bearer(a.token))
      .send({ user: String(b.user._id), title: 'still mine' });
    const stored = await Report.findById(a.report._id);
    expect(String(stored.user)).toBe(String(a.user._id));
    expect(stored.title).toBe('still mine');
  });
});

describe('report CRUD', () => {
  test('creates a report linked to your own doctor', async () => {
    const { a } = await setup();
    const res = await request(app)
      .post('/api/reports')
      .set(bearer(a.token))
      .send({ ...validBody, doctor: String(a.doctor._id) });
    expect(res.status).toBe(201);
    expect(res.body.data.doctor.name).toBe('Dr. A');
  });

  test('ignores a client-supplied fileUrl', async () => {
    const { a } = await setup();
    const res = await request(app)
      .post('/api/reports')
      .set(bearer(a.token))
      .send({ ...validBody, fileUrl: 'https://evil.example/x.pdf' });
    expect(res.status).toBe(201);
    expect(res.body.data.fileUrl).toBeUndefined();

    const upd = await request(app)
      .put(`/api/reports/${res.body.data._id}`)
      .set(bearer(a.token))
      .send({ fileUrl: 'https://evil.example/y.pdf' });
    expect(upd.body.data.fileUrl).toBeUndefined();
  });

  test('responses do not include the owner’s personal details', async () => {
    const { a } = await setup();
    const list = await request(app).get('/api/reports').set(bearer(a.token));
    const one = await request(app).get(`/api/reports/${a.report._id}`).set(bearer(a.token));
    for (const body of [list.body.data[0], one.body.data]) {
      expect(typeof body.user).toBe('string');
      expect(JSON.stringify(body)).not.toContain(a.user.email);
    }
  });

  test('unlinks the doctor with null', async () => {
    const { a } = await setup();
    const res = await request(app)
      .put(`/api/reports/${a.report._id}`)
      .set(bearer(a.token))
      .send({ doctor: null });
    expect(res.status).toBe(200);
    expect(res.body.data.doctor).toBeNull();
  });

  test('deletes your own report', async () => {
    const { a } = await setup();
    const res = await request(app).delete(`/api/reports/${a.report._id}`).set(bearer(a.token));
    expect(res.status).toBe(204);
    expect(await Report.exists({ _id: a.report._id })).toBeNull();
  });

  test.each([
    ['missing title', { category: 'Lab', reportDate: '2024-01-01' }],
    ['bad category', { ...validBody, category: 'Xray' }],
    ['bad date', { ...validBody, reportDate: 'yesterday' }],
    ['future date', { ...validBody, reportDate: '2999-01-01' }],
    ['malformed doctor id', { ...validBody, doctor: 'abc' }],
  ])('rejects %s with 400', async (_, body) => {
    const { token } = await createUser();
    const res = await request(app).post('/api/reports').set(bearer(token)).send(body);
    expect(res.status).toBe(400);
  });

  test('malformed report id is a 400, not a 500', async () => {
    const { token } = await createUser();
    for (const method of ['get', 'put', 'delete']) {
      const res = await request(app)[method]('/api/reports/not-an-id').set(bearer(token)).send({});
      expect(res.status).toBe(400);
    }
  });

  test('requires authentication', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/reports query hardening', () => {
  const list = (token, qs) => request(app).get(`/api/reports${qs}`).set(bearer(token));

  test('search matches literally, so regex metacharacters are harmless', async () => {
    const { user, token } = await createUser();
    await makeReport(user, { title: 'Lipid panel (fasting)' });
    await makeReport(user, { title: 'Thyroid' });

    const paren = await list(token, '?search=(fasting)');
    expect(paren.status).toBe(200);
    expect(paren.body.data.map((r) => r.title)).toEqual(['Lipid panel (fasting)']);

    const wildcard = await list(token, '?search=.*');
    expect(wildcard.body.data).toEqual([]);

    const redos = await list(token, `?search=${encodeURIComponent('(a+)+$')}`);
    expect(redos.status).toBe(200);
  });

  test('search is case-insensitive', async () => {
    const { user, token } = await createUser();
    await makeReport(user, { title: 'Thyroid Panel' });
    const res = await list(token, '?search=thyroid');
    expect(res.body.data).toHaveLength(1);
  });

  test('sorts by whitelisted fields', async () => {
    const { user, token } = await createUser();
    await makeReport(user, { title: 'B', reportDate: new Date('2024-02-01') });
    await makeReport(user, { title: 'A', reportDate: new Date('2024-03-01') });
    await makeReport(user, { title: 'C', reportDate: new Date('2024-01-01') });

    expect((await list(token, '?sort=title')).body.data.map((r) => r.title)).toEqual(['A', 'B', 'C']);
    expect((await list(token, '?sort=-reportDate')).body.data.map((r) => r.title)).toEqual(['A', 'B', 'C']);
    expect((await list(token, '?sort=reportDate')).body.data.map((r) => r.title)).toEqual(['C', 'B', 'A']);
  });

  test.each(['user', '-password', 'title,user', '$where'])('rejects sort=%s', async (sort) => {
    const { token } = await createUser();
    const res = await list(token, `?sort=${encodeURIComponent(sort)}`);
    expect(res.status).toBe(400);
  });

  test('clamps limit to 1–50', async () => {
    const { user, token } = await createUser();
    await Report.insertMany(
      Array.from({ length: 55 }, (_, i) => ({ title: `R${i}`, category: 'Lab', reportDate: new Date(), user: user._id }))
    );

    const big = await list(token, '?limit=1000');
    expect(big.body.data).toHaveLength(50);
    expect(big.body.pagination).toMatchObject({ limit: 50, total: 55, pages: 2 });

    const zero = await list(token, '?limit=0');
    expect(zero.body.data).toHaveLength(1);

    const negative = await list(token, '?limit=-5');
    expect(negative.body.pagination.limit).toBe(1);
  });

  test.each(['?limit=abc', '?page=0', '?category=Xray', '?doctor=nope', '?search=a&search=b'])(
    'rejects %s with 400',
    async (qs) => {
      const { token } = await createUser();
      expect((await list(token, qs)).status).toBe(400);
    }
  );
});

describe('sanitizeFilter', () => {
  test('operator objects in filters are treated as literal values', async () => {
    const { user } = await createUser();
    await makeReport(user);
    // Without sanitizeFilter, { $ne: null } would match every report. With it, the object is
    // wrapped in $eq as a literal, which can't cast to a string, so the query is rejected.
    await expect(Report.find({ title: { $ne: null } })).rejects.toThrow(/Cast to string failed/);
    expect(await Report.find({ title: mongoose.trusted({ $ne: null }) })).toHaveLength(1);
  });
});
