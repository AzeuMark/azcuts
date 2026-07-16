import dayjs from 'dayjs';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';

// ── Dashboard ──

export const getDashboard = asyncHandler(async (req, res) => {
  const now = dayjs();
  const todayStart = now.startOf('day').toDate();
  const todayEnd = now.endOf('day').toDate();

  const [activeStaff, inService, customersToday, salesTodayAgg, pending, recentAppointments] = await Promise.all([
    User.countDocuments({ role: 'staff', status: 'active' }),
    User.countDocuments({ role: 'staff', status: 'in_service' }),
    Appointment.countDocuments({ scheduledStart: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'cancelled' } }),
    Appointment.aggregate([
      { $match: { scheduledStart: { $gte: todayStart, $lte: todayEnd }, status: { $in: ['done', 'accepted', 'in_service'] } } },
      { $group: { _id: null, total: { $sum: '$priceSnapshot.total' } } },
    ]),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.find()
      .populate('customer', 'fullName')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  const salesToday = salesTodayAgg.length > 0 ? salesTodayAgg[0].total : 0;
  const totalToday = await Appointment.countDocuments({ scheduledStart: { $gte: todayStart, $lte: todayEnd } });

  success(res, {
    activeStaff,
    inService,
    customersToday,
    salesToday,
    pending,
    totalToday,
    recentAppointments,
  });
});

// ── User CRUD ──

export const listUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1 } = req.query;
  const limit = 20;
  const filter = {};

  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  success(res, { users, total, page: parseInt(page, 10), totalPages: Math.ceil(total / limit) });
});

export const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, role, password, nickname } = req.body;
  if (!fullName || !email || !password) throw new ApiError(400, 'fullName, email, and password are required');

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const userData = { fullName, email, phone: phone || '', password, role: role || 'user' };
  if (nickname && role === 'staff') userData.nickname = nickname;

  const user = await User.create(userData);
  success(res, user, 'User created', 201);
});

export const updateUser = asyncHandler(async (req, res) => {
  const updates = {};
  const allowed = ['fullName', 'email', 'phone', 'address', 'nickname', 'role', 'status'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  success(res, user, 'User updated');
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  success(res, null, 'User deleted');
});

// ── Discount ──

export const setDiscount = asyncHandler(async (req, res) => {
  const { discountPercent } = req.body;
  if (discountPercent === undefined || discountPercent < 0 || discountPercent > 100) {
    throw new ApiError(400, 'Discount must be 0-100');
  }

  const apt = await Appointment.findById(req.params.id);
  if (!apt) throw new ApiError(404, 'Appointment not found');
  if (apt.status === 'done' || apt.status === 'cancelled') {
    throw new ApiError(400, 'Cannot change discount on completed/cancelled appointment');
  }

  // Recompute price snapshot
  const { buildPriceSnapshot } = await import('../services/pricing.service.js');
  const extraIds = apt.extras.map((e) => e.toString());
  const newSnapshot = await buildPriceSnapshot(apt.service.toString(), extraIds, discountPercent);
  apt.priceSnapshot = newSnapshot;
  await apt.save();

  success(res, apt, 'Discount applied');
});

// ── Histories ──

export const getStaffHistory = asyncHandler(async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 20;
  const filter = { assignedStaff: { $ne: null }, status: 'done' };

  const total = await Appointment.countDocuments(filter);
  const appointments = await Appointment.find(filter)
    .populate('customer', 'fullName')
    .populate('assignedStaff', 'fullName nickname')
    .populate('service', 'name')
    .sort({ finishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  success(res, { appointments, total, page: parseInt(page, 10), totalPages: Math.ceil(total / limit) });
});

export const getUserHistory = asyncHandler(async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 20;

  const total = await Appointment.countDocuments({});
  const appointments = await Appointment.find({})
    .populate('customer', 'fullName')
    .populate('assignedStaff', 'fullName nickname')
    .populate('service', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  success(res, { appointments, total, page: parseInt(page, 10), totalPages: Math.ceil(total / limit) });
});
