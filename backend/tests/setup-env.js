// Runs before every test file, before src/config/env.js is imported.
// Assigned (not defaulted) so a developer's real .env or shell vars are never used by tests.
Object.assign(process.env, {
  NODE_ENV: 'test',
  MONGO_URI: 'mongodb://127.0.0.1:27017/meditrack-test-unused',
  JWT_SECRET: 'test-only-jwt-secret-that-is-long-enough-123',
  CLOUDINARY_CLOUD_NAME: 'test-cloud',
  CLOUDINARY_API_KEY: 'test-key',
  CLOUDINARY_API_SECRET: 'test-secret',
  FRONTEND_URL: 'https://medi-track-lemon.vercel.app',
});
