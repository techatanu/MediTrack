import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Only the user id and token version go in the token — no email or other PII.
export const signToken = (user) =>
  jwt.sign({ tv: user.tokenVersion }, env.JWT_SECRET, {
    subject: String(user._id),
    expiresIn: '24h',
    algorithm: 'HS256',
  });

export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
