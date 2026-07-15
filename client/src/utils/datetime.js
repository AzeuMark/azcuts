import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ = 'Asia/Manila';

export function formatDate(date, fmt = 'MMM D, YYYY', tz = DEFAULT_TZ) {
  return dayjs(date).tz(tz).format(fmt);
}

export function formatTime(date, fmt = 'h:mm A', tz = DEFAULT_TZ) {
  return dayjs(date).tz(tz).format(fmt);
}

export function formatDateTime(date, fmt = 'MMM D, YYYY h:mm A', tz = DEFAULT_TZ) {
  return dayjs(date).tz(tz).format(fmt);
}

export function now(tz = DEFAULT_TZ) {
  return dayjs().tz(tz);
}
