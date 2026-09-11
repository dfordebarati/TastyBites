//the actual logic: "what happens when this route is called"

import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { signToken } from '../utils/token.js';

const allStrings = (...values) => values.every((value) => typeof value === 'string');

export const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body ?? {};

  if (!name || !email || !password || !confirmPassword) {
    throw ApiError.badRequest('All fields are required');
  }
  if (!allStrings(name, email, password, confirmPassword)) {
    throw ApiError.badRequest('Invalid input');
  }
  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user);

  res.status(201).json({ success: true, token, user });
};

export const login = async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password || !allStrings(email, password)) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken(user);
  user.password = undefined;

  res.json({ success: true, token, user });
};

export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
