import dayjs from 'dayjs';
import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { buildPriceSnapshot } from './pricing.service.js';
import { autoAssignStaff } from './assignment.service.js';
import { validateTransition, getTimestampField } from './stateMachine.js';
import { notifyAppointmentNew, notifyAppointmentUpdated, notifyAppointmentAssigned } from './notify.service.js';
import generateReceiptNo from '../utils/receiptNo.js';
import ApiError from '../utils/ApiError.js';

export async function createBooking({ customerId, serviceId, extras = [], scheduledStart, staffId, paymentMethod = 'cash' }) {
  // Validate service
  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) throw new ApiError(400, 'Invalid or inactive service');

  // Calculate duration
  let totalDuration = service.durationMinutes;
  if (extras.length > 0) {
    const Extra = (await import('../models/Extra.js')).default;
    const extraDocs = await Extra.find({ _id: { $in: extras }, isActive: true });
    totalDuration += extraDocs.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
  }

  const startDate = new Date(scheduledStart);
  const endDate = new Date(startDate.getTime() + totalDuration * 60 * 1000);

  // Determine staff assignment
  let assignedStaff = null;
  let autoAssigned = false;

  if (staffId && staffId !== 'auto') {
    assignedStaff = staffId;
  } else {
    // Auto-assign
    const staff = await autoAssignStaff(startDate, endDate);
    if (staff) {
      assignedStaff = staff._id;
      autoAssigned = true;
    }
  }

  // Build price snapshot
  const priceSnapshot = await buildPriceSnapshot(serviceId, extras);

  // Generate receipt number
  const receiptNo = await generateReceiptNo();

  // Create appointment
  const appointment = await Appointment.create({
    receiptNo,
    customer: customerId,
    assignedStaff,
    service: serviceId,
    extras,
    priceSnapshot,
    scheduledStart: startDate,
    scheduledEnd: endDate,
    status: 'pending',
    paymentMethod,
    autoAssigned,
    statusHistory: [{ status: 'pending', at: new Date(), byUser: customerId, byRole: 'user' }],
  });

  // Notify staff + admin of new booking
  notifyAppointmentNew(appointment);

  if (assignedStaff && autoAssigned) {
    notifyAppointmentAssigned(appointment, assignedStaff);
  }

  return appointment;
}

export async function listMyAppointments(customerId, { status, page = 1, limit = 20 } = {}) {
  const filter = { customer: customerId };
  if (status) filter.status = status;

  const total = await Appointment.countDocuments(filter);
  const appointments = await Appointment.find(filter)
    .populate('service', 'name')
    .populate('assignedStaff', 'fullName nickname')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { appointments, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getAppointment(appointmentId) {
  return Appointment.findById(appointmentId)
    .populate('customer', 'fullName email phone')
    .populate('assignedStaff', 'fullName nickname')
    .populate('service', 'name category price');
}

export async function cancelAppointment(appointmentId, userId, userRole, cancelReason) {
  const apt = await Appointment.findById(appointmentId);
  if (!apt) throw new ApiError(404, 'Appointment not found');

  if (apt.status === 'done' || apt.status === 'cancelled') {
    throw new ApiError(409, 'Cannot cancel a completed or already cancelled appointment');
  }

  // Ownership check for customers
  if (userRole === 'user' && apt.customer.toString() !== userId) {
    throw new ApiError(403, 'Not your appointment');
  }

  apt.status = 'cancelled';
  apt.cancelReason = cancelReason;
  apt.cancelledBy = { userId, role: userRole };
  apt.cancelledAt = new Date();
  apt.statusHistory.push({ status: 'cancelled', at: new Date(), byUser: userId, byRole: userRole, note: cancelReason });

  await apt.save();
  notifyAppointmentUpdated(apt);
  return apt;
}

export async function changeStatus(appointmentId, newStatus, userId, userRole) {
  const apt = await Appointment.findById(appointmentId);
  if (!apt) throw new ApiError(404, 'Appointment not found');

  validateTransition(apt.status, newStatus);

  // Staff can only change their own assigned appointments (except admin)
  if (userRole === 'staff' && apt.assignedStaff?.toString() !== userId) {
    throw new ApiError(403, 'Not your assigned appointment');
  }

  apt.status = newStatus;

  // Set timestamp
  const tsField = getTimestampField(newStatus);
  if (tsField) apt[tsField] = new Date();

  // When accepting, set assignedStaff if not already set
  if (newStatus === 'accepted' && !apt.assignedStaff) {
    apt.assignedStaff = userId;
  }

  apt.statusHistory.push({ status: newStatus, at: new Date(), byUser: userId, byRole: userRole });

  await apt.save();
  notifyAppointmentUpdated(apt);
  return apt;
}

export async function acceptAppointment(appointmentId, staffId) {
  const apt = await Appointment.findById(appointmentId);
  if (!apt) throw new ApiError(404, 'Appointment not found');

  validateTransition(apt.status, 'accepted');

  apt.status = 'accepted';
  apt.assignedStaff = staffId;
  apt.acceptedAt = new Date();
  apt.statusHistory.push({ status: 'accepted', at: new Date(), byUser: staffId, byRole: 'staff' });

  await apt.save();
  notifyAppointmentUpdated(apt);
  notifyAppointmentAssigned(apt, staffId);
  return apt;
}

export async function rejectAppointment(appointmentId, staffId, reason) {
  const apt = await Appointment.findById(appointmentId);
  if (!apt) throw new ApiError(404, 'Appointment not found');

  // Reject = cancel from staff side
  validateTransition(apt.status, 'cancelled');

  apt.status = 'cancelled';
  apt.cancelReason = reason || 'Rejected by staff';
  apt.cancelledBy = { userId: staffId, role: 'staff' };
  apt.cancelledAt = new Date();
  apt.statusHistory.push({ status: 'cancelled', at: new Date(), byUser: staffId, byRole: 'staff', note: reason });

  await apt.save();
  notifyAppointmentUpdated(apt);
  return apt;
}

export async function getStaffAppointments(staffId, scope = 'incoming') {
  if (scope === 'incoming') {
    // Pending appointments: assigned to me OR unassigned (pool)
    return Appointment.find({
      status: 'pending',
      $or: [{ assignedStaff: staffId }, { assignedStaff: null }],
    })
      .populate('customer', 'fullName phone')
      .populate('service', 'name')
      .populate('extras', 'name')
      .sort({ createdAt: -1 });
  }

  // scope === 'mine': accepted + in_service
  return Appointment.find({
    assignedStaff: staffId,
    status: { $in: ['accepted', 'in_service'] },
  })
    .populate('customer', 'fullName phone')
    .populate('service', 'name')
    .populate('extras', 'name')
    .sort({ scheduledStart: 1 });
}

export async function getStaffHistory(staffId) {
  const appointments = await Appointment.find({
    assignedStaff: staffId,
    status: 'done',
  })
    .populate('customer', 'fullName')
    .populate('service', 'name')
    .sort({ finishedAt: -1 });

  const ratings = appointments
    .filter((a) => a.rating)
    .map((a) => ({
      stars: a.rating.stars,
      comment: a.rating.comment,
      ratedAt: a.rating.ratedAt,
      customerName: a.customer?.fullName,
      serviceName: a.service?.name,
    }));

  const staff = await User.findById(staffId);

  return {
    appointments,
    totalServed: staff?.totalServed || 0,
    avgRating: staff?.avgRating || 0,
    ratingCount: staff?.ratingCount || 0,
    ratings,
  };
}
