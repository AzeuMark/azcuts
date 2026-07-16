import Appointment from '../models/Appointment.js';
import Settings from '../models/Settings.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function getReceipt(appointmentId) {
  const apt = await Appointment.findById(appointmentId)
    .populate('customer', 'fullName email phone')
    .populate('assignedStaff', 'fullName nickname')
    .populate('service', 'name category');

  if (!apt) return null;

  const settings = await Settings.findById('system');
  const tz = settings?.timezone || 'Asia/Manila';

  return {
    receiptNo: apt.receiptNo,
    shopInfo: settings?.shopInfo || {},
    datetime: dayjs(apt.createdAt).tz(tz).format('MMM D, YYYY h:mm A'),
    customer: apt.customer ? { name: apt.customer.fullName, email: apt.customer.email, phone: apt.customer.phone } : null,
    service: apt.service ? { name: apt.service.name, category: apt.service.category } : null,
    extras: apt.priceSnapshot?.extras || [],
    staff: apt.assignedStaff ? { name: apt.assignedStaff.fullName, nickname: apt.assignedStaff.nickname } : null,
    subtotal: apt.priceSnapshot?.subtotal || 0,
    discountPercent: apt.priceSnapshot?.discountPercent || 0,
    discountAmount: apt.priceSnapshot?.discountAmount || 0,
    taxRate: apt.priceSnapshot?.taxRate || 0,
    taxAmount: apt.priceSnapshot?.taxAmount || 0,
    total: apt.priceSnapshot?.total || 0,
    currency: apt.priceSnapshot?.currency || 'PHP',
    paymentMethod: apt.paymentMethod,
    status: apt.status,
    scheduledStart: dayjs(apt.scheduledStart).tz(tz).format('MMM D, YYYY h:mm A'),
  };
}
