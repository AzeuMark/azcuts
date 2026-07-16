import * as appointmentService from '../services/appointment.service.js';
import { getAvailableSlots } from '../services/scheduling.service.js';
import { getReceipt } from '../services/receipt.service.js';
import { rateAppointment } from '../services/rating.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';

export const getSlots = asyncHandler(async (req, res) => {
  const { serviceId, date, staffId } = req.query;
  if (!serviceId || !date) throw new ApiError(400, 'serviceId and date are required');
  const slots = await getAvailableSlots(serviceId, date, staffId);
  success(res, slots);
});

export const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, extras, scheduledStart, staffId, paymentMethod } = req.body;
  if (!serviceId || !scheduledStart) throw new ApiError(400, 'serviceId and scheduledStart are required');
  const appointment = await appointmentService.createBooking({
    customerId: req.user.id,
    serviceId,
    extras: extras || [],
    scheduledStart,
    staffId,
    paymentMethod,
  });
  success(res, appointment, 'Booking created', 201);
});

export const listMine = asyncHandler(async (req, res) => {
  const { status, page } = req.query;
  const result = await appointmentService.listMyAppointments(req.user.id, { status, page: parseInt(page, 10) || 1 });
  success(res, result);
});

export const getOne = asyncHandler(async (req, res) => {
  const apt = await appointmentService.getAppointment(req.params.id);
  if (!apt) throw new ApiError(404, 'Appointment not found');
  success(res, apt);
});

export const cancel = asyncHandler(async (req, res) => {
  const { cancelReason } = req.body;
  if (!cancelReason) throw new ApiError(400, 'Cancel reason is required');
  const apt = await appointmentService.cancelAppointment(req.params.id, req.user.id, req.user.role, cancelReason);
  success(res, apt, 'Appointment cancelled');
});

export const receipt = asyncHandler(async (req, res) => {
  const data = await getReceipt(req.params.id);
  if (!data) throw new ApiError(404, 'Appointment not found');
  success(res, data);
});

export const rate = asyncHandler(async (req, res) => {
  const { stars, comment } = req.body;
  if (!stars || stars < 1 || stars > 5) throw new ApiError(400, 'Stars must be 1-5');
  const apt = await rateAppointment(req.params.id, req.user.id, stars, comment);
  success(res, apt, 'Rating submitted');
});
