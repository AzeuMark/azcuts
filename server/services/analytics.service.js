import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import Appointment from '../models/Appointment.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Manila';

function getRangeDates(range) {
  const now = dayjs().tz(TZ);
  let startDate;

  switch (range) {
    case 'daily':
      startDate = now.subtract(7, 'day').startOf('day');
      break;
    case 'weekly':
      startDate = now.subtract(4, 'week').startOf('week');
      break;
    case 'monthly':
      startDate = now.subtract(6, 'month').startOf('month');
      break;
    case 'yearly':
      startDate = now.subtract(5, 'year').startOf('year');
      break;
    case 'all':
    default:
      startDate = dayjs('2020-01-01');
      break;
  }

  return { startDate: startDate.toDate(), endDate: now.toDate() };
}

export async function getSummary(range) {
  const { startDate, endDate } = getRangeDates(range);
  const match = { createdAt: { $gte: startDate, $lte: endDate }, status: { $ne: 'cancelled' } };

  const [revenueAgg, appointmentCount, uniqueCustAgg] = await Promise.all([
    Appointment.aggregate([
      { $match: { ...match, status: 'done' } },
      { $group: { _id: null, total: { $sum: '$priceSnapshot.total' } } },
    ]),
    Appointment.countDocuments(match),
    Appointment.aggregate([
      { $match: match },
      { $group: { _id: '$customer' } },
      { $count: 'count' },
    ]),
  ]);

  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
  const uniqueCustomers = uniqueCustAgg.length > 0 ? uniqueCustAgg[0].count : 0;
  const avgPerAppointment = appointmentCount > 0 ? Math.round((totalRevenue / appointmentCount) * 100) / 100 : 0;

  return { totalRevenue, totalAppointments: appointmentCount, uniqueCustomers, avgPerAppointment };
}

export async function getSales(range) {
  const { startDate, endDate } = getRangeDates(range);
  const match = { createdAt: { $gte: startDate, $lte: endDate } };

  // Sales over time
  let groupBy;
  let labelFormat;
  switch (range) {
    case 'daily':
      groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      labelFormat = 'daily';
      break;
    case 'weekly':
      groupBy = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
      labelFormat = 'weekly';
      break;
    case 'monthly':
      groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      labelFormat = 'monthly';
      break;
    case 'yearly':
    case 'all':
    default:
      groupBy = { $dateToString: { format: '%Y', date: '$createdAt' } };
      labelFormat = 'yearly';
      break;
  }

  const [salesOverTime, topServices, statusSplit, revenueByStaff] = await Promise.all([
    // Sales over time
    Appointment.aggregate([
      { $match: { ...match, status: { $in: ['done', 'accepted', 'in_service'] } } },
      { $group: { _id: groupBy, total: { $sum: '$priceSnapshot.total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { label: '$_id', total: 1, count: 1, _id: 0 } },
    ]),

    // Top services
    Appointment.aggregate([
      { $match: match },
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'serviceInfo' } },
      { $unwind: { path: '$serviceInfo', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$serviceInfo.name', 'Unknown'] }, count: 1, _id: 0 } },
    ]),

    // Status split
    Appointment.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]),

    // Revenue by staff
    Appointment.aggregate([
      { $match: { ...match, status: 'done', assignedStaff: { $ne: null } } },
      { $group: { _id: '$assignedStaff', revenue: { $sum: '$priceSnapshot.total' } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'staffInfo' } },
      { $unwind: { path: '$staffInfo', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$staffInfo.fullName', 'Unknown'] }, revenue: 1, _id: 0 } },
    ]),
  ]);

  return { salesOverTime, topServices, statusSplit, revenueByStaff };
}

export async function getReport(range, format) {
  const summary = await getSummary(range);
  const sales = await getSales(range);

  if (format === 'csv') {
    const lines = ['Metric,Value'];
    lines.push(`Total Revenue,${summary.totalRevenue}`);
    lines.push(`Total Appointments,${summary.totalAppointments}`);
    lines.push(`Unique Customers,${summary.uniqueCustomers}`);
    lines.push(`Avg Per Appointment,${summary.avgPerAppointment}`);
    lines.push('');
    lines.push('Date,Revenue,Count');
    for (const row of sales.salesOverTime) {
      lines.push(`${row.label},${row.total},${row.count}`);
    }
    lines.push('');
    lines.push('Service,Count');
    for (const row of sales.topServices) {
      lines.push(`"${row.name}",${row.count}`);
    }
    return lines.join('\n');
  }

  return { summary, sales };
}
