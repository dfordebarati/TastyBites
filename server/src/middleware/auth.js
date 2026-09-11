import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';

export const protect = async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized();
  }

  const payload = verifyToken(token);
  const user = await User.findById(payload.sub);

  if (!user) {
    throw ApiError.unauthorized('This account no longer exists');
  }

  req.user = user;
  next();
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw ApiError.forbidden();
  }
  next();
};
// code that runs before a controller (check login, rate-limit, handle errors)