import { z } from 'zod';
import { optionalField } from './common.js';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email('Enter a valid email address'));

// bcrypt ignores everything past 72 bytes, so reject longer passwords instead of silently truncating.
const newPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine((p) => Buffer.byteLength(p, 'utf8') <= 72, 'Password must be at most 72 bytes');

// Existing accounts may predate the length rules, so login only checks presence.
const existingPassword = z.string().min(1, 'Password is required').max(1024);

const firstName = z.string().trim().min(1, 'First name is required').max(50);
const lastName = z.string().trim().max(50);

export const signupSchema = z.object({
  email,
  password: newPassword,
  firstName,
  lastName: optionalField(lastName),
});

export const loginSchema = z.object({
  email,
  password: existingPassword,
});

export const updateProfileSchema = z.object({
  firstName: firstName.optional(),
  lastName: lastName.optional(),
  email: email.optional(),
  currentPassword: optionalField(existingPassword),
  dateOfBirth: optionalField(
    z.coerce
      .date()
      .min(new Date('1900-01-01'), 'Enter a valid date of birth')
      .refine((d) => d <= new Date(), 'Date of birth cannot be in the future')
  ),
  gender: optionalField(z.enum(['Male', 'Female', 'Other'])),
  bloodGroup: optionalField(z.enum(BLOOD_GROUPS)),
  height: optionalField(z.coerce.number().positive().max(300, 'Height must be in cm')),
  weight: optionalField(z.coerce.number().positive().max(700, 'Weight must be in kg')),
});

export const changePasswordSchema = z
  .object({
    currentPassword: existingPassword,
    newPassword,
  })
  .refine((b) => b.newPassword !== b.currentPassword, {
    message: 'New password must be different from the current one',
    path: ['newPassword'],
  });
