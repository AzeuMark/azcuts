import ApiError from '../utils/ApiError.js';

const ALLOWED = {
  pending:    ['accepted', 'cancelled'],
  accepted:   ['in_service', 'cancelled'],
  in_service: ['done'],
  done:       [],
  cancelled:  [],
};

const STATUS_TIMESTAMPS = {
  accepted: 'acceptedAt',
  in_service: 'startedAt',
  done: 'finishedAt',
  cancelled: 'cancelledAt',
};

export function validateTransition(currentStatus, nextStatus) {
  const allowed = ALLOWED[currentStatus];
  if (!allowed || !allowed.includes(nextStatus)) {
    throw new ApiError(409, `Cannot transition from ${currentStatus} to ${nextStatus}`);
  }
}

export function getTimestampField(status) {
  return STATUS_TIMESTAMPS[status] || null;
}
