import HttpError from '../utils/httpError.js';

// Validates req.params / req.query / req.body against zod schemas.
// Parsed (coerced, stripped) values go on req.valid — Express 5 makes req.query read-only.
const validate = (schemas) => (req, res, next) => {
  const valid = {};
  const details = [];

  for (const part of ['params', 'query', 'body']) {
    if (!schemas[part]) continue;

    const result = schemas[part].safeParse(req[part] ?? {});
    if (result.success) {
      valid[part] = result.data;
    } else {
      details.push(
        ...result.error.issues.map((issue) => ({
          field: [part, ...issue.path].join('.'),
          message: issue.message,
        }))
      );
    }
  }

  if (details.length) throw new HttpError(400, 'Validation failed', details);

  req.valid = { ...req.valid, ...valid };
  next();
};

export default validate;
