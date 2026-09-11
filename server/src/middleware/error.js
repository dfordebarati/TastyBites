import mongoose from 'mongoose';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.values(err.errors).map((e) => [e.path, e.message])
    );
    return ApiError.badRequest('Validation failed', details);
  }

  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`An account with this ${field} already exists`);
  }

  if (err instanceof jwt.TokenExpiredError) {
    return ApiError.unauthorized('Session expired, please log in again');
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return ApiError.unauthorized('Invalid token, please log in again');
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Image must be smaller than 3 MB' : err.message;
    return ApiError.badRequest(message);
  }

  if (err?.type === 'entity.parse.failed') {
    return ApiError.badRequest('Malformed JSON in request body');
  }

  return new ApiError(500, 'Something went wrong on our side');
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  const apiError = normalizeError(err);

  if (apiError.statusCode >= 500) console.error(err);

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    ...(apiError.details && { errors: apiError.details }),
    ...(env.nodeEnv === 'development' && apiError.statusCode >= 500 && { stack: err.stack }),
  });
};
