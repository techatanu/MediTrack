import mongoose from 'mongoose';
import User from '../models/User.js';
import HttpError from '../utils/httpError.js';
import definedOnly from '../utils/definedOnly.js';

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new HttpError(404, 'User not found');

  res.json({ data: user.toProfile() });
};

export const updateProfile = async (req, res) => {
  const { email, currentPassword, ...fields } = req.valid.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!user) throw new HttpError(404, 'User not found');

  if (email && email !== user.email) {
    if (!currentPassword) {
      throw new HttpError(400, 'Current password is required to change your email');
    }
    if (!(await user.matchPassword(currentPassword))) {
      throw new HttpError(403, 'Current password is incorrect');
    }
    if (await User.exists({ email, _id: mongoose.trusted({ $ne: user._id }) })) {
      throw new HttpError(409, 'That email is already in use');
    }
    user.email = email;
  }

  Object.assign(user, definedOnly(fields));
  await user.save();

  res.json({ data: user.toProfile() });
};
