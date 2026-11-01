import { z } from 'zod';

// Forms send '' for untouched optional fields; treat '' and null as "not provided".
export const optionalField = (schema) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

export const objectId = (message = 'Invalid id') => z.string().regex(/^[a-f\d]{24}$/i, message);

export const idParams = z.object({ id: objectId() });
