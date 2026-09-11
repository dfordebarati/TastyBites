import { STATUS_LABELS } from '../../lib/orders';

const STYLES = {
  placed: 'bg-brand/10 text-brand',
  preparing: 'bg-ink/10 text-ink',
  'out-for-delivery': 'bg-ink text-paper',
  delivered: 'bg-olive/15 text-olive',
  cancelled: 'bg-danger/10 text-danger',
};

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
