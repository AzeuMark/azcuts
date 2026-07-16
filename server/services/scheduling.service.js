import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export async function getAvailableSlots(serviceId, date, staffId) {
  const settings = await Settings.findById('system');
  if (!settings) throw new Error('Settings not found');

  const tz = settings.timezone || 'Asia/Manila';
  const slotStep = settings.slotStepMinutes || 30;

  // Get service duration
  const Service = (await import('../models/Service.js')).default;
  const service = await Service.findById(serviceId);
  if (!service) throw new Error('Service not found');
  const duration = service.durationMinutes;

  // Get store hours for this weekday
  const targetDate = dayjs(date).tz(tz);
  const dayKey = WEEKDAYS[targetDate.day()];
  const hours = settings.storeHours?.[dayKey];
  if (!hours || hours.closed) return [];

  const [openH, openM] = hours.open.split(':').map(Number);
  const [closeH, closeM] = hours.close.split(':').map(Number);

  const dayStart = targetDate.startOf('day');
  const openTime = dayStart.hour(openH).minute(openM);
  const closeTime = dayStart.hour(closeH).minute(closeM);

  // Generate candidate slots
  const candidates = [];
  let current = openTime;
  while (current.add(duration, 'minute').isBefore(closeTime) || current.add(duration, 'minute').isSame(closeTime)) {
    candidates.push({
      start: current.toDate(),
      end: current.add(duration, 'minute').toDate(),
    });
    current = current.add(slotStep, 'minute');
  }

  // Get all active staff
  const staffQuery = { role: 'staff', status: 'active' };
  if (staffId) staffQuery._id = staffId;
  const staffList = await User.find(staffQuery);

  // Get existing appointments for this day
  const dayStart2 = targetDate.startOf('day').toDate();
  const dayEnd = targetDate.endOf('day').toDate();
  const existingApts = await Appointment.find({
    scheduledStart: { $gte: dayStart2, $lte: dayEnd },
    status: { $in: ['pending', 'accepted', 'in_service'] },
  });

  // Check availability for each slot
  const now = dayjs().tz(tz);
  const slots = candidates.map((slot) => {
    // Skip past slots
    if (dayjs(slot.start).tz(tz).isBefore(now)) {
      return { ...slot, availableStaffCount: 0 };
    }

    const availableStaff = staffList.filter((staff) => {
      return !existingApts.some((apt) => {
        if (staffId && apt.assignedStaff?.toString() !== staffId) return false;
        if (!staffId && apt.assignedStaff?.toString() !== staff._id.toString()) return false;
        return apt.scheduledStart < slot.end && apt.scheduledEnd > slot.start;
      });
    });

    return {
      start: slot.start.toISOString ? slot.start.toISOString() : slot.start,
      end: slot.end.toISOString ? slot.end.toISOString() : slot.end,
      availableStaffCount: staffId ? (availableStaff.length > 0 ? 1 : 0) : availableStaff.length,
    };
  });

  return slots;
}
