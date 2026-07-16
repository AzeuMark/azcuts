import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  success(res, user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, address, phone, email, nickname } = req.body;
  const updates = {};
  if (fullName !== undefined) updates.fullName = fullName;
  if (address !== undefined) updates.address = address;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email;
  if (nickname !== undefined && req.user.role === 'staff') updates.nickname = nickname;

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  success(res, user, 'Profile updated');
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, 'Current and new password required');

  const user = await User.findById(req.user.id).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(401, 'Current password is incorrect');

  user.password = newPassword;
  await user.save();

  success(res, null, 'Password changed');
});
