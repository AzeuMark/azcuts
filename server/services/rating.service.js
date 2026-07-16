import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { notifyRatingAdded } from './notify.service.js';
import ApiError from '../utils/ApiError.js';

export async function rateAppointment(appointmentId, userId, stars, comment = '') {
  const apt = await Appointment.findById(appointmentId);
  if (!apt) throw new ApiError(404, 'Appointment not found');

  if (apt.status !== 'done') {
    throw new ApiError(400, 'Can only rate completed appointments');
  }

  if (apt.customer.toString() !== userId) {
    throw new ApiError(403, 'Only the customer can rate this appointment');
  }

  const isFirstRating = !apt.rating;
  const oldStars = apt.rating?.stars || 0;

  const updated = await Appointment.findByIdAndUpdate(
    appointmentId,
    { $set: { rating: { stars, comment, ratedAt: new Date() } } },
    { new: true, runValidators: false }
  );

  if (updated.assignedStaff) {
    await recomputeStaffRating(updated.assignedStaff, oldStars, stars, isFirstRating);
    const staff = await User.findById(updated.assignedStaff);
    if (staff) notifyRatingAdded(staff._id, staff.avgRating);
  }

  return updated;
}

async function recomputeStaffRating(staffId, oldStars, newStars, isFirstRating) {
  const staff = await User.findById(staffId);
  if (!staff) return;

  const currentAvg = staff.avgRating || 0;
  const currentCount = staff.ratingCount || 0;

  if (isFirstRating) {
    const totalStars = currentAvg * currentCount + newStars;
    staff.ratingCount = currentCount + 1;
    staff.avgRating = Math.round((totalStars / staff.ratingCount) * 100) / 100;
  } else {
    const totalStars = currentAvg * currentCount - oldStars + newStars;
    staff.avgRating = currentCount > 0 ? Math.round((totalStars / currentCount) * 100) / 100 : newStars;
  }

  await staff.save();
}
