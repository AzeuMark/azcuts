import { getIO } from '../socket/index.js';
import { EVENTS } from '../socket/events.js';

function emit(room, event, data) {
  try {
    getIO().to(room).emit(event, data);
  } catch {
    // Socket not initialized — skip silently
  }
}

export function notifyAppointmentNew(appointment) {
  emit('staff', EVENTS.APPOINTMENT_NEW, appointment);
  emit('admin', EVENTS.APPOINTMENT_NEW, appointment);
}

export function notifyAppointmentUpdated(appointment) {
  const data = {
    id: appointment._id,
    status: appointment.status,
    customerId: appointment.customer?._id || appointment.customer,
    assignedStaff: appointment.assignedStaff?._id || appointment.assignedStaff,
    acceptedAt: appointment.acceptedAt,
    startedAt: appointment.startedAt,
    finishedAt: appointment.finishedAt,
    cancelledAt: appointment.cancelledAt,
  };

  // Notify customer
  const customerId = appointment.customer?._id || appointment.customer;
  if (customerId) emit(`user:${customerId}`, EVENTS.APPOINTMENT_UPDATED, data);

  // Notify assigned staff
  const staffId = appointment.assignedStaff?._id || appointment.assignedStaff;
  if (staffId) emit(`user:${staffId}`, EVENTS.APPOINTMENT_UPDATED, data);

  // Notify admin
  emit('admin', EVENTS.APPOINTMENT_UPDATED, data);
}

export function notifyAppointmentAssigned(appointment, staffId) {
  emit(`user:${staffId}`, EVENTS.APPOINTMENT_ASSIGNED, appointment);
}

export function notifyDashboardRefresh(data) {
  emit('admin', EVENTS.DASHBOARD_REFRESH, data);
}

export function notifyRatingAdded(staffId, newAvg) {
  emit(`user:${staffId}`, EVENTS.RATING_ADDED, { staffId, newAvg });
  emit('admin', EVENTS.RATING_ADDED, { staffId, newAvg });
}
