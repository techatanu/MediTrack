import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const required = z.string().trim().min(1, 'is missing');

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().positive().default(5050),
  MONGO_URI: required,
  JWT_SECRET: required.min(32, 'must be at least 32 characters'),
  CLOUDINARY_CLOUD_NAME: required,
  CLOUDINARY_API_KEY: required,
  CLOUDINARY_API_SECRET: required,
  FRONTEND_URL: z.url().optional(),
  // Vercel preview deployments; anchored so look-alike hosts don't match.
  CORS_PREVIEW_ORIGIN_REGEX: z
    .string()
    .default('^https://medi-track-[a-z0-9-]+\\.vercel\\.app$')
    .refine((pattern) => {
      try {
        new RegExp(pattern);
        return true;
      } catch {
        return false;
      }
    }, 'must be a valid regular expression'),
});

// Returns error messages naming the variable only — never its value, since these are secrets.
export const parseEnv = (source) => {
  const result = envSchema.safeParse(source);
  if (result.success) return { ok: true, env: Object.freeze(result.data) };

  const errors = result.error.issues.map((issue) => {
    const key = issue.path[0];
    const message = source[key] === undefined || source[key] === '' ? 'is missing' : issue.message;
    return `${key} ${message}`;
  });
  return { ok: false, errors };
};

const result = parseEnv(process.env);

if (!result.ok) {
  console.error(
    'Invalid environment configuration:\n' +
      result.errors.map((e) => `  - ${e}`).join('\n') +
      '\nSee backend/.env.example for the required variables.'
  );
  process.exit(1);
}

export const env = result.env;
