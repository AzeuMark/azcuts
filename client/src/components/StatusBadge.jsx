import Badge from './ui/Badge';
import { STATUS_LABELS } from '../utils/constants';

const STATUS_VARIANT = {
  pending: 'warning',
  accepted: 'info',
  in_service: 'accent',
  done: 'success',
  cancelled: 'danger',
};

export default function StatusBadge({ status }) {
  return (
    <Badge variant={STATUS_VARIANT[status] || 'default'}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
