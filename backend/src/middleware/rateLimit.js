import { rateLimit } from 'express-rate-limit';

const message = { error: { message: 'Too many attempts. Please try again in a few minutes.' } };
const common = { standardHeaders: 'draft-8', legacyHeaders: false, message };

// Only failed logins count, so a user who logs in normally is never throttled.
export const loginLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
});

export const signupLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 10,
});

// For authenticated endpoints that check the current password; keyed per user, not per IP.
export const passwordCheckLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.user.id,
});
