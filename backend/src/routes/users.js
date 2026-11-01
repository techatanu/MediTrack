import express from 'express';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { loginLimiter, signupLimiter, passwordCheckLimiter } from '../middleware/rateLimit.js';
import { signup, login, changePassword } from '../controllers/authController.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../schemas/userSchemas.js';

const router = express.Router();

router.post('/signup', signupLimiter, validate({ body: signupSchema }), signup);
router.post('/login', loginLimiter, validate({ body: loginSchema }), login);

router.get('/profile', auth, getProfile);
router.put('/profile', auth, passwordCheckLimiter, validate({ body: updateProfileSchema }), updateProfile);
router.put(
  '/profile/password',
  auth,
  passwordCheckLimiter,
  validate({ body: changePasswordSchema }),
  changePassword
);

export default router;
