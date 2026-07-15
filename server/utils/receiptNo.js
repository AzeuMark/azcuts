import dayjs from 'dayjs';
import Appointment from '../models/Appointment.js';

export default async function generateReceiptNo() {
  const today = dayjs().format('YYYYMMDD');
  const prefix = `AZ-${today}-`;

  const lastAppointment = await Appointment.findOne(
    { receiptNo: { $regex: `^${prefix}` } },
    {},
    { sort: { receiptNo: -1 } }
  );

  let counter = 1;
  if (lastAppointment) {
    const lastNum = parseInt(lastAppointment.receiptNo.split('-').pop(), 10);
    if (!isNaN(lastNum)) counter = lastNum + 1;
  }

  return `${prefix}${String(counter).padStart(4, '0')}`;
}
