import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';   
import prisma from '../prismaClient.js';

const router = express.Router();


router.post('/signup', async (req, res, next) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (!email || !firstName || !password) {
      return res.status(400).json({ error: { message: 'Email, firstName, and password are required' } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, firstName, lastName, password: hashedPassword }
    });


    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'supersecretkey', 
      { expiresIn: '1h' }
    );


    res.status(201).json({ message: 'User created successfully', data: user, token });
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

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: { message: 'Invalid password' } });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      data: { id: user.id, email: user.email, firstName: user.firstName },
      token
    });
  } catch (error) {
    next(error);
  }
});


router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
});

export default router;