import * as authService from '../services/auth.service.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.register({ fullName, email, phone, password });
  success(res, { user, accessToken, refreshToken }, 'Registered successfully', 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login({ email, password });
  success(res, { user, accessToken, refreshToken }, 'Login successful');
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);
  success(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  success(res, null, 'Logged out');
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  success(res, user);
});
