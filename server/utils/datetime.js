import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ = 'Asia/Manila';

export function now(tz = DEFAULT_TZ) {
  return dayjs().tz(tz);
}

export function toTz(date, tz = DEFAULT_TZ) {
  return dayjs(date).tz(tz);
}

export function startOfDay(date, tz = DEFAULT_TZ) {
  return dayjs(date).tz(tz).startOf('day').toDate();
}

export function endOfDay(date, tz = DEFAULT_TZ) {
  return dayjs(date).tz(tz).endOf('day').toDate();
}

export function startOfWeek(date, tz = DEFAULT_TZ) {
  return dayjs(date).tz(tz).startOf('week').toDate();
}

export function startOfMonth(date, tz = DEFAULT_TZ) {
  return dayjs(date).tz(tz).startOf('month').toDate();
}

export function startOfYear(date, tz = DEFAULT_TZ) {
  return dayjs(date).tz(tz).startOf('year').toDate();
}

export { dayjs };
