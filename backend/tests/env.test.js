import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseEnv } from '../src/config/env.js';

const valid = {
  MONGO_URI: 'mongodb://localhost/x',
  JWT_SECRET: 'a'.repeat(32),
  CLOUDINARY_CLOUD_NAME: 'c',
  CLOUDINARY_API_KEY: 'k',
  CLOUDINARY_API_SECRET: 's',
};

describe('parseEnv', () => {
  test('accepts a complete config and applies defaults', () => {
    const result = parseEnv(valid);
    expect(result.ok).toBe(true);
    expect(result.env.PORT).toBe(5050);
    expect(result.env.NODE_ENV).toBe('development');
  });

  test('names every missing required variable', () => {
    const result = parseEnv({});
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'MONGO_URI is missing',
        'JWT_SECRET is missing',
        'CLOUDINARY_CLOUD_NAME is missing',
        'CLOUDINARY_API_KEY is missing',
        'CLOUDINARY_API_SECRET is missing',
      ])
    );
  });

  test('treats empty strings as missing', () => {
    const result = parseEnv({ ...valid, MONGO_URI: '' });
    expect(result.errors).toEqual(['MONGO_URI is missing']);
  });

  test('rejects a short JWT secret without echoing it', () => {
    const result = parseEnv({ ...valid, JWT_SECRET: 'supersecretkey' });
    expect(result.errors).toEqual(['JWT_SECRET must be at least 32 characters']);
    expect(result.errors.join()).not.toContain('supersecretkey');
  });

  test('rejects an invalid CORS preview regex', () => {
    const result = parseEnv({ ...valid, CORS_PREVIEW_ORIGIN_REGEX: '([' });
    expect(result.ok).toBe(false);
  });
});

test('importing the config with missing vars exits with a clear error', () => {
  const envModule = pathToFileURL(fileURLToPath(new URL('../src/config/env.js', import.meta.url)));
  // Run from a temp dir so dotenv can't pick up a real backend/.env.
  const child = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', `await import(${JSON.stringify(envModule.href)})`],
    { cwd: tmpdir(), env: { PATH: process.env.PATH }, encoding: 'utf8' }
  );

  expect(child.status).toBe(1);
  expect(child.stderr).toContain('Invalid environment configuration');
  expect(child.stderr).toContain('MONGO_URI is missing');
  expect(child.stderr).toContain('JWT_SECRET is missing');
});
