import { z } from 'zod';
import { optionalField } from './common.js';

export const createDoctorSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  specialization: z.string().trim().min(1, 'Specialization is required').max(100),
  hospital: z.string().trim().min(1, 'Hospital is required').max(200),
  phone: optionalField(
    z.string().trim().max(30).regex(/^[0-9+()\-.\s]*$/, 'Phone may only contain digits, spaces and + ( ) - .')
  ),
});

export const updateDoctorSchema = createDoctorSchema.partial();
