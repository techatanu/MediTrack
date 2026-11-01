import { z } from 'zod';
import { objectId, optionalField } from './common.js';

export const REPORT_SORTS = ['reportDate', 'createdAt', 'title'];
export const MAX_PAGE_SIZE = 50;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const title = z.string().trim().min(1, 'Title is required').max(200);
const description = z.string().trim().max(5000);
const category = z.enum(['Lab', 'Prescription'], 'Category must be Lab or Prescription');
const reportDate = z.coerce
  .date('Enter a valid report date')
  .min(new Date('1900-01-01'), 'Enter a valid report date')
  // One day of slack for timezone differences between browser and server.
  .refine((d) => d.getTime() <= Date.now() + ONE_DAY_MS, 'Report date cannot be in the future');
const doctor = objectId('Invalid doctor id');

// Multipart bodies arrive as strings, so everything here must accept string input.
export const createReportSchema = z.object({
  title,
  description: optionalField(description),
  category,
  reportDate,
  doctor: optionalField(doctor),
});

export const updateReportSchema = z.object({
  title: title.optional(),
  description: description.optional(),
  category: category.optional(),
  reportDate: reportDate.optional(),
  // '' or null unlinks the doctor.
  doctor: z.preprocess((v) => (v === '' ? null : v), doctor.nullable().optional()),
});

export const listReportsQuery = z.object({
  category: category.optional(),
  doctor: doctor.optional(),
  search: z.string().trim().max(100).optional(),
  sort: z
    .enum(REPORT_SORTS.flatMap((field) => [field, `-${field}`]), `Sort must be one of: ${REPORT_SORTS.join(', ')} (prefix - for descending)`)
    .default('-createdAt'),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce
    .number()
    .int()
    .default(10)
    .transform((n) => Math.min(MAX_PAGE_SIZE, Math.max(1, n))),
});
