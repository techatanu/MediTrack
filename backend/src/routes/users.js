import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { loginLimiter, signupLimiter, passwordCheckLimiter } from '../middleware/rateLimit.js';
import { signToken } from '../utils/token.js';
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../schemas/userSchemas.js';

const router = express.Router();

const INVALID_CREDENTIALS = 'Invalid email or password';
// Compared against when the email is unknown, so both failure paths take the same time.
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', 10);

const isDuplicateKey = (err) => err?.code === 11000;
const emailTaken = (res) =>
  res.status(409).json({ error: { message: 'An account with this email already exists' } });

router.post('/signup', signupLimiter, validate({ body: signupSchema }), async (req, res) => {
  const { email, firstName, lastName, password } = req.valid.body;

  let user;
  try {
    user = await User.create({ email, firstName, lastName, password });
  } catch (err) {
    if (isDuplicateKey(err)) return emailTaken(res);
    throw err;
  }

  res.status(201).json({
    message: 'User created successfully',
    data: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    token: signToken(user),
  });
});

router.post('/login', loginLimiter, validate({ body: loginSchema }), async (req, res) => {
  const { email, password } = req.valid.body;

  const user = await User.findOne({ email }).select('+password');
  const passwordOk = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  if (!user || !passwordOk) {
    return res.status(401).json({ error: { message: INVALID_CREDENTIALS } });
  }

  res.json({
    message: 'Login successful',
    data: { id: user._id, email: user.email, firstName: user.firstName },
    token: signToken(user),
  });
});

router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: { message: 'User not found' } });
  res.json({ data: user.toProfile() });
});

router.put(
  '/profile',
  auth,
  passwordCheckLimiter,
  validate({ body: updateProfileSchema }),
  async (req, res) => {
    const { email, currentPassword, ...fields } = req.valid.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    if (email && email !== user.email) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ error: { message: 'Current password is required to change your email' } });
      }
      if (!(await user.matchPassword(currentPassword))) {
        return res.status(403).json({ error: { message: 'Current password is incorrect' } });
      }
      if (await User.exists({ email, _id: mongoose.trusted({ $ne: user._id }) })) return emailTaken(res);
      user.email = email;
    }

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) user[key] = value;
    }

    try {
      await user.save();
    } catch (err) {
      if (isDuplicateKey(err)) return emailTaken(res);
      throw err;
    }

    res.json({ message: 'Profile updated successfully', data: user.toProfile() });
  }
);

router.put(
  '/profile/password',
  auth,
  passwordCheckLimiter,
  validate({ body: changePasswordSchema }),
  async (req, res) => {
    const { currentPassword, newPassword } = req.valid.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(403).json({ error: { message: 'Current password is incorrect' } });
    }

    user.password = newPassword;
    user.tokenVersion += 1; // logs out every other session
    await user.save();

    res.json({ message: 'Password changed successfully', token: signToken(user) });
  }
);

export default router;
