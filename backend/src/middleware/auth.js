import mongoose from 'mongoose';
import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';

const unauthorized = (res, message) => res.status(401).json({ error: { message } });

const auth = async (req, res, next) => {
  const [scheme, token] = (req.get('Authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return unauthorized(res, 'Authentication required');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return unauthorized(res, 'Invalid or expired token');
  }

  // One indexed lookup per request: rejects tokens of deleted users and tokens
  // issued before the last password change.
  const user = mongoose.isValidObjectId(payload.sub)
    ? await User.findById(payload.sub).select('tokenVersion').lean()
    : null;
  if (!user || user.tokenVersion !== payload.tv) {
    return unauthorized(res, 'Session expired. Please log in again.');
  }

  req.user = { id: String(user._id) };
  next();
};

export default auth;
