import { jest } from '@jest/globals';
import request from 'supertest';
import Doctor from '../src/models/Doctor.js';
import Report from '../src/models/Report.js';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';
import { bearer, createUser } from './helpers/users.js';

// Cloudinary is replaced with an in-test fake; everything else is real.
const storage = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  getSignedUrl: jest.fn(),
  logStorageError: jest.fn(),
};
jest.unstable_mockModule('../src/services/fileStorage.js', () => storage);
const { default: app } = await import('../src/app.js');

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(closeTestDb);

beforeEach(() => {
  jest.clearAllMocks();
  storage.uploadFile.mockImplementation(async (buffer, { format, mimeType }) => ({
    publicId: 'meditrack_reports/fake123',
    resourceType: 'image',
    deliveryType: 'authenticated',
    format,
    mimeType,
    bytes: buffer.length,
  }));
  storage.deleteFile.mockResolvedValue();
  storage.getSignedUrl.mockReturnValue({
    url: 'https://api.cloudinary.com/v1_1/test/image/download?signature=abc',
    expiresAt: new Date(Date.now() + 300_000),
  });
});

const PDF = Buffer.from('%PDF-1.7\n%synthetic test file\n');
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(16)]);

const upload = (token, { file = PDF, filename = 'report.pdf', contentType = 'application/pdf', fields = {} } = {}) => {
  const req = request(app).post('/api/reports').set(bearer(token));
  const body = { title: 'CBC', category: 'Lab', reportDate: '2024-03-01', ...fields };
  for (const [key, value] of Object.entries(body)) req.field(key, value);
  return req.attach('image', file, { filename, contentType });
};

const storedFile = {
  publicId: 'meditrack_reports/abc',
  resourceType: 'image',
  deliveryType: 'authenticated',
  format: 'pdf',
  mimeType: 'application/pdf',
  bytes: 1234,
};

describe('POST /api/reports with a file', () => {
  test('uploads a valid PDF privately and hides storage identifiers', async () => {
    const { token } = await createUser();
    const res = await upload(token);

    expect(res.status).toBe(201);
    expect(storage.uploadFile).toHaveBeenCalledWith(expect.any(Buffer), { format: 'pdf', mimeType: 'application/pdf' });
    expect(res.body.data.file).toEqual({ mimeType: 'application/pdf', format: 'pdf', bytes: PDF.length });
    expect(JSON.stringify(res.body)).not.toContain('fake123');

    const stored = await Report.findById(res.body.data._id);
    expect(stored.file.publicId).toBe('meditrack_reports/fake123');
    expect(stored.file.deliveryType).toBe('authenticated');
  });

  test('detects the type from content, not the filename', async () => {
    const { token } = await createUser();
    const res = await upload(token, { file: PNG, filename: 'scan.png', contentType: 'image/png' });
    expect(res.status).toBe(201);
    expect(res.body.data.file.mimeType).toBe('image/png');
  });

  test('rejects a file whose content is not what its name claims', async () => {
    const { token } = await createUser();
    const res = await upload(token, { file: Buffer.from('<html>not a pdf</html>') });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/only pdf, jpg, png or webp/i);
    expect(storage.uploadFile).not.toHaveBeenCalled();
  });

  test.each([
    ['doc', 'report.doc', 'application/msword'],
    ['svg', 'image.svg', 'image/svg+xml'],
    ['html', 'page.html', 'text/html'],
  ])('rejects %s files before buffering them', async (_, filename, contentType) => {
    const { token } = await createUser();
    const res = await upload(token, { filename, contentType });
    expect(res.status).toBe(400);
    expect(storage.uploadFile).not.toHaveBeenCalled();
  });

  test('rejects files over 10 MB with 413', async () => {
    const { token } = await createUser();
    const big = Buffer.concat([PDF, Buffer.alloc(10 * 1024 * 1024)]);
    const res = await upload(token, { file: big });
    expect(res.status).toBe(413);
    expect(storage.uploadFile).not.toHaveBeenCalled();
  });

  test('a file under a different field name is rejected', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/reports')
      .set(bearer(token))
      .field('title', 'x')
      .attach('document', PDF, { filename: 'r.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(400);
  });

  test('invalid fields mean nothing is uploaded', async () => {
    const { token } = await createUser();
    const res = await upload(token, { fields: { title: '' } });
    expect(res.status).toBe(400);
    expect(storage.uploadFile).not.toHaveBeenCalled();
  });

  test('another user’s doctor means nothing is uploaded', async () => {
    const { token } = await createUser();
    const other = await createUser();
    const doctor = await Doctor.create({ name: 'D', specialization: 'S', hospital: 'H', user: other.user._id });
    const res = await upload(token, { fields: { doctor: String(doctor._id) } });
    expect(res.status).toBe(400);
    expect(storage.uploadFile).not.toHaveBeenCalled();
  });

  test('a storage failure is a 502 and no report is created', async () => {
    const { user, token } = await createUser();
    storage.uploadFile.mockRejectedValueOnce(Object.assign(new Error('boom'), { http_code: 500 }));
    const res = await upload(token);
    expect(res.status).toBe(502);
    expect(await Report.countDocuments({ user: user._id })).toBe(0);
  });
});

describe('GET /api/reports/:id/file', () => {
  test('returns a signed, expiring URL for the owner', async () => {
    const { user, token } = await createUser();
    const report = await Report.create({ title: 'T', category: 'Lab', reportDate: new Date(), user: user._id, file: storedFile });

    const res = await request(app).get(`/api/reports/${report._id}/file`).set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.data.url).toContain('signature=');
    expect(res.body.data.mimeType).toBe('application/pdf');
    expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    expect(storage.getSignedUrl).toHaveBeenCalledWith(expect.objectContaining({ publicId: 'meditrack_reports/abc' }));
  });

  test('another user gets a 404 and no URL is signed', async () => {
    const owner = await createUser();
    const intruder = await createUser();
    const report = await Report.create({ title: 'T', category: 'Lab', reportDate: new Date(), user: owner.user._id, file: storedFile });

    const res = await request(app).get(`/api/reports/${report._id}/file`).set(bearer(intruder.token));
    expect(res.status).toBe(404);
    expect(storage.getSignedUrl).not.toHaveBeenCalled();
  });

  test('legacy public uploads still resolve', async () => {
    const { user, token } = await createUser();
    const fileUrl = 'https://res.cloudinary.com/demo/image/upload/v1700000000/meditrack_reports/old.pdf';
    const report = await Report.create({ title: 'T', category: 'Lab', reportDate: new Date(), user: user._id, fileUrl });

    const res = await request(app).get(`/api/reports/${report._id}/file`).set(bearer(token));
    expect(res.body.data).toEqual({ url: fileUrl, expiresAt: null, mimeType: 'application/pdf' });
  });

  test('a report without a file is a 404', async () => {
    const { user, token } = await createUser();
    const report = await Report.create({ title: 'T', category: 'Lab', reportDate: new Date(), user: user._id });
    const res = await request(app).get(`/api/reports/${report._id}/file`).set(bearer(token));
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/reports/:id', () => {
  test('deletes the stored file, then the report', async () => {
    const { user, token } = await createUser();
    const report = await Report.create({ title: 'T', category: 'Lab', reportDate: new Date(), user: user._id, file: storedFile });

    const res = await request(app).delete(`/api/reports/${report._id}`).set(bearer(token));
    expect(res.status).toBe(200);
    expect(storage.deleteFile).toHaveBeenCalledWith(expect.objectContaining({ publicId: 'meditrack_reports/abc', deliveryType: 'authenticated' }));
    expect(await Report.exists({ _id: report._id })).toBeNull();
  });

  test('deletes legacy public files too', async () => {
    const { user, token } = await createUser();
    const report = await Report.create({
      title: 'T', category: 'Lab', reportDate: new Date(), user: user._id,
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1700000000/meditrack_reports/old.pdf',
    });
    await request(app).delete(`/api/reports/${report._id}`).set(bearer(token));
    expect(storage.deleteFile).toHaveBeenCalledWith(
      expect.objectContaining({ publicId: 'meditrack_reports/old', deliveryType: 'upload', resourceType: 'image' })
    );
  });

  test('keeps the report if the file could not be deleted', async () => {
    const { user, token } = await createUser();
    const report = await Report.create({ title: 'T', category: 'Lab', reportDate: new Date(), user: user._id, file: storedFile });
    storage.deleteFile.mockRejectedValueOnce(new Error('cloudinary down'));

    const res = await request(app).delete(`/api/reports/${report._id}`).set(bearer(token));
    expect(res.status).toBe(502);
    expect(await Report.exists({ _id: report._id })).toBeTruthy();
  });

  test('another user cannot trigger file deletion', async () => {
    const owner = await createUser();
    const intruder = await createUser();
    const report = await Report.create({ title: 'T', category: 'Lab', reportDate: new Date(), user: owner.user._id, file: storedFile });

    const res = await request(app).delete(`/api/reports/${report._id}`).set(bearer(intruder.token));
    expect(res.status).toBe(404);
    expect(storage.deleteFile).not.toHaveBeenCalled();
  });
});
