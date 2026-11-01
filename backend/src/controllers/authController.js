import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import HttpError from '../utils/httpError.js';
import { signToken } from '../utils/token.js';

// Compared against when the email is unknown, so both login failure paths take the same time.
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', 10);

const session = (user) => ({ user: user.toProfile(), token: signToken(user) });

export const signup = async (req, res) => {
  const { email, firstName, lastName, password } = req.valid.body;

  // A duplicate email surfaces as a duplicate-key error -> 409 in the error handler.
  const user = await User.create({ email, firstName, lastName, password });

  res.status(201).json({ data: session(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.valid.body;

  const user = await User.findOne({ email }).select('+password');
  const passwordOk = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  // Same response for unknown email and wrong password, so accounts can't be enumerated.
  if (!user || !passwordOk) throw new HttpError(401, 'Invalid email or password');

  res.json({ data: session(user) });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.valid.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!user) throw new HttpError(404, 'User not found');

  if (!(await user.matchPassword(currentPassword))) {
    throw new HttpError(403, 'Current password is incorrect');
  }

  user.password = newPassword;
  user.tokenVersion += 1; // logs out every other session
  await user.save();

  res.json({ data: { token: signToken(user) } });
};
