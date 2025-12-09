import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (!email || !firstName || !password) {
      return res.status(400).json({ error: { message: 'Email, firstName, and password are required' } });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: { message: 'User already exists' } });
    }

    const user = await User.create({
      email,
      firstName,
      lastName,
      password
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: { message: 'Email and password are required' } });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: { message: 'Invalid password' } });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      data: { id: user._id, email: user.email, firstName: user.firstName },
      token
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    } catch (err) {
      return res.status(401).json({ error: { message: 'Invalid or expired token' } });
    }

    const { firstName, lastName, email, dateOfBirth, gender, bloodGroup, height, weight } = req.body;

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        height: user.height,
        weight: user.weight
      }
    });
  } catch (error) {
    return res.status(500).json({ error: { message: 'Failed to update profile. Please try again.' } });
  }
});

router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    res.json({ data: user });
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid token' } });
  }
});

export default router;