import { useState } from 'react';
import api from '../../api/axios';
import OrderStatusBadge from '../orders/OrderStatusBadge';
import { ORDER_STATUSES, STATUS_LABELS, isClosed } from '../../lib/orders';

export default function StatusSelect({ order, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (isClosed(order.status)) return <OrderStatusBadge status={order.status} />;

  const handleChange = async (e) => {
    const status = e.target.value;
    const finalStep = isClosed(status);
    if (finalStep && !window.confirm(`Mark ${order.orderNumber} as ${STATUS_LABELS[status].toLowerCase()}? This can't be undone.`)) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch(`/orders/${order._id}/status`, { status });
      onUpdated(data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <select
        value={order.status}
        onChange={handleChange}
        disabled={saving}
        aria-label={`Status of order ${order.orderNumber}`}
        className="rounded-md border border-line bg-paper-soft px-2.5 py-1.5 text-sm text-ink outline-none transition-colors focus:border-ink disabled:opacity-60"
      >
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
