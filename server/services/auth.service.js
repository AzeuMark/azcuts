import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import ApiError from '../utils/ApiError.js';

export function signAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role, jti: crypto.randomUUID() }, env.jwtAccessSecret, {
    expiresIn: env.accessTokenTTL,
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ id: user._id, jti: crypto.randomUUID() }, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenTTL,
  });
}

export async function storeRefreshToken(token, userId) {
  const decoded = jwt.decode(token);
  await RefreshToken.create({
    token,
    user: userId,
    expiresAt: new Date(decoded.exp * 1000),
  });
}

export async function register({ fullName, email, phone, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const user = await User.create({ fullName, email, phone, password, role: 'user' });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await storeRefreshToken(refreshToken, user._id);

  return { user, accessToken, refreshToken };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await storeRefreshToken(refreshToken, user._id);

  return { user, accessToken, refreshToken };
}

export async function refresh(oldRefreshToken) {
  if (!oldRefreshToken) throw new ApiError(401, 'Refresh token required');

  const stored = await RefreshToken.findOne({ token: oldRefreshToken });
  if (!stored || stored.revoked) throw new ApiError(401, 'Invalid refresh token');

  try {
    jwt.verify(oldRefreshToken, env.jwtRefreshSecret);
  } catch {
    throw new ApiError(401, 'Expired refresh token');
  }

  // Revoke old token
  stored.revoked = true;
  await stored.save();

  const user = await User.findById(stored.user);
  if (!user) throw new ApiError(401, 'User not found');

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await storeRefreshToken(refreshToken, user._id);

  return { accessToken, refreshToken };
}

export async function logout(refreshToken) {
  if (refreshToken) {
    await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revoked: true });
  }
}
