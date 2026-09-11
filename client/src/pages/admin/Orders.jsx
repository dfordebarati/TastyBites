import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import PageHeader from '../../components/admin/PageHeader';
import StatusSelect from '../../components/admin/StatusSelect';
import { formatDateTime, formatPrice } from '../../lib/format';
import { ORDER_STATUSES, STATUS_LABELS, itemSummary } from '../../lib/orders';

const FILTERS = ['all', ...ORDER_STATUSES];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New orders show up without refreshing the page
  useEffect(() => {
    let ignore = false;

    const load = () =>
      api
        .get('/orders')
        .then(({ data }) => {
          if (ignore) return;
          setOrders(data.orders);
          setError('');
        })
        .catch(() => {
          if (!ignore) setError('Could not load orders.');
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });

    load();
    const timer = setInterval(load, 20000);

    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, []);

  const replaceOrder = (updated) =>
    setOrders((prev) => prev.map((order) => (order._id === updated._id ? updated : order)));

  const countFor = (value) => (value === 'all' ? orders.length : orders.filter((order) => order.status === value).length);
  const visible = filter === 'all' ? orders : orders.filter((order) => order.status === filter);

  return (
    <>
      <PageHeader
        title="Orders"
        description="New orders appear here on their own. Move each one along as the kitchen works through it."
      />

      <div className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="flex gap-2 whitespace-nowrap pb-1">
          {FILTERS.map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                filter === value ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5'
              }`}
            >
              {value === 'all' ? 'All' : STATUS_LABELS[value]}
              <span className="ml-1.5 tabular-nums opacity-60">{countFor(value)}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="relative mt-6 overflow-x-auto rounded-md border border-line bg-paper-soft">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((order) => (
                <tr key={order._id} className="transition-colors hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{order.orderNumber}</p>
                    <p className="text-xs text-ink-faint">{formatDateTime(order.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{order.customerName}</p>
                    <p className="text-xs text-ink-faint">+91 {order.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-56 truncate text-ink-soft">{itemSummary(order.items)}</p>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <StatusSelect order={order} onUpdated={replaceOrder} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="text-sm font-medium text-ink transition-colors hover:text-brand"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visible.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-ink-soft">
              {orders.length ? 'No orders with this status.' : 'No orders yet. They show up here as soon as customers check out.'}
            </p>
          )}
        </div>
      )}
    </>
  );
}
