import mongoose from 'mongoose';
import HttpError from '../utils/httpError.js';

// Translates known error types into client-safe HttpErrors. Anything unrecognised
// becomes a generic 500 so internals never leak to the client.
const toHttpError = (err) => {
  if (err instanceof HttpError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      // Mongoose's own messages can echo the rejected value, so build our own.
      message: e.kind === 'required' ? `${e.path} is required` : `${e.path} is invalid`,
    }));
    return new HttpError(400, 'Validation failed', details);
  }

  if (err instanceof mongoose.Error.CastError) {
    return new HttpError(404, 'Resource not found');
  }

  if (err?.code === 11000) {
    // keyPattern names the field; keyValue would contain the value (e.g. an email).
    const field = Object.keys(err.keyPattern || {})[0];
    return new HttpError(409, field ? `That ${field} is already in use` : 'Duplicate value');
  }

  // body-parser errors
  if (err?.type === 'entity.too.large') return new HttpError(413, 'Request body is too large');
  if (err?.type === 'entity.parse.failed') return new HttpError(400, 'Malformed JSON body');
  if (err?.expose && err.status >= 400 && err.status < 500) return new HttpError(err.status, err.message);

  return new HttpError(500, 'Internal Server Error');
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
};

export const errorHandler = (err, req, res, next) => {
  const httpError = toHttpError(err);

  if (httpError.status >= 500) {
    // Error type and stack frames only: messages can echo request data, and this is health data.
    const frames = err?.stack ? `\n${err.stack.split('\n').slice(1, 6).join('\n')}` : '';
    console.error(`[${req.method} ${req.path}] ${err?.name || 'Error'}${err?.code ? ` (${err.code})` : ''} -> ${httpError.status}${frames}`);
  }

  if (res.headersSent) return next(err);

  res.status(httpError.status).json({
    error: {
      message: httpError.message,
      ...(httpError.details && { details: httpError.details }),
    },
  });
};
