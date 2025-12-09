import jwt from 'jsonwebtoken';
import User from '../models/User.js';



export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (!email || !firstName || !password) {
      return res.status(400).json({
        error: { message: 'Email, firstName, and password are required' }
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({
        error: { message: 'Email already exists' }
      });
    }

    const user = await User.create({
      email,
      firstName,
      lastName,
      password
    });

    console.log("User created in DB:", user);

    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({ data: userResponse });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email })
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
   

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }

   

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};