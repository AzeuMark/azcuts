import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

export async function autoAssignStaff(scheduledStart, scheduledEnd) {
  // Get all active staff
  const staffList = await User.find({ role: 'staff', status: 'active' });
  if (staffList.length === 0) return null;

  // Find staff free at this slot
  const freeStaff = [];
  for (const staff of staffList) {
    const conflict = await Appointment.findOne({
      assignedStaff: staff._id,
      status: { $in: ['pending', 'accepted', 'in_service'] },
      scheduledStart: { $lt: scheduledEnd },
      scheduledEnd: { $gt: scheduledStart },
    });
    if (!conflict) freeStaff.push(staff);
  }

  if (freeStaff.length === 0) return null;

  // Compute load for each free staff
  const staffWithLoad = await Promise.all(
    freeStaff.map(async (staff) => {
      const load = await Appointment.countDocuments({
        assignedStaff: staff._id,
        status: { $in: ['pending', 'in_service'] },
      });
      return { staff, load, ratingCount: staff.ratingCount || 0, createdAt: staff.createdAt };
    })
  );

  // Sort by load (asc), then ratingCount (asc), then createdAt (asc)
  staffWithLoad.sort((a, b) => {
    if (a.load !== b.load) return a.load - b.load;
    if (a.ratingCount !== b.ratingCount) return a.ratingCount - b.ratingCount;
    return a.createdAt - b.createdAt;
  });

  return staffWithLoad[0].staff;
}
