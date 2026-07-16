import * as appointmentService from '../services/appointment.service.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';

export const getAppointments = asyncHandler(async (req, res) => {
  const scope = req.query.scope || 'incoming';
  const appointments = await appointmentService.getStaffAppointments(req.user.id, scope);
  success(res, appointments);
});

export const accept = asyncHandler(async (req, res) => {
  const apt = await appointmentService.acceptAppointment(req.params.id, req.user.id);
  success(res, apt, 'Appointment accepted');
});

export const reject = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const apt = await appointmentService.rejectAppointment(req.params.id, req.user.id, reason);
  success(res, apt, 'Appointment rejected');
});

export const changeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) throw new ApiError(400, 'Status is required');
  const apt = await appointmentService.changeStatus(req.params.id, status, req.user.id, req.user.role);
  success(res, apt, `Status changed to ${status}`);
});

export const getHistory = asyncHandler(async (req, res) => {
  const result = await appointmentService.getStaffHistory(req.user.id);
  success(res, result);
});

export const setShift = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    throw new ApiError(400, 'Status must be active or inactive');
  }
  const user = await User.findByIdAndUpdate(req.user.id, { status }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  success(res, user, `Shift ${status === 'active' ? 'started' : 'ended'}`);
});
