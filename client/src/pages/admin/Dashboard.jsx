import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import PageHeader from '../../components/admin/PageHeader';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, formatPrice } from '../../lib/format';
import { itemSummary } from '../../lib/orders';

function StatBlock({ label, value, note, link, linkLabel }) {
  return (
    <div className="p-6">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="mt-3 font-display text-5xl tabular-nums text-ink">{value}</dd>
      {note && <p className="mt-2 text-sm text-ink-soft">{note}</p>}
      {link && (
        <Link to={link} className="mt-4 inline-block text-sm text-brand hover:underline">
          {linkLabel} &rarr;
        </Link>
      )}
    </div>
  );
}

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/dashboard/stats'), api.get('/menu-items'), api.get('/orders')])
      .then(([statsRes, itemsRes, ordersRes]) => {
        setStats(statsRes.data.stats);
        setItems(itemsRes.data.items);
        setLatestOrders(ordersRes.data.orders.slice(0, 5));
      })
      .catch(() => setError('Could not load the dashboard. Check that the server is running.'));
  }, []);

  if (error) return <p className="py-20 text-center text-ink-soft">{error}</p>;
  if (!stats) return <Loader />;

  const inStock = items.filter((item) => item.availability).length;
  const outOfStock = items.length - inStock;
  const stockPercent = items.length ? Math.round((inStock / items.length) * 100) : 0;

  return (
    <>
      <PageHeader
        title={greeting()}
        description={`Signed in as ${user.name}. Here is how the restaurant looks right now.`}
      />

      <dl className="grid divide-y divide-line rounded-md border border-line bg-paper-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <StatBlock label="Total menu items" value={stats.menuItems} link="/admin/menu-items" linkLabel="Manage menu" />
        <StatBlock label="Total users" value={stats.users} link="/admin/users" linkLabel="See users" />
        <StatBlock
          label="Total orders"
          value={stats.orders}
          note={`${formatPrice(stats.revenue)} in sales`}
          link="/admin/orders"
          linkLabel="See orders"
        />
      </dl>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-ink">Latest orders</h2>
            <Link to="/admin/orders" className="text-sm text-ink-soft transition-colors hover:text-ink">
              All orders
            </Link>
          </div>

          {latestOrders.length === 0 ? (
            <p className="mt-4 border-y border-line py-8 text-center text-sm text-ink-soft">
              No orders yet. They will show up here as soon as a customer checks out.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {latestOrders.map((order) => (
                <li key={order._id}>
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="-mx-2 flex items-center gap-4 rounded px-2 py-3 transition-colors hover:bg-paper-soft"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">
                        {order.customerName}
                        <span className="ml-2 text-xs font-normal text-ink-faint">{formatDateTime(order.createdAt)}</span>
                      </p>
                      <p className="truncate text-xs text-ink-faint">{itemSummary(order.items)}</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                    <span className="w-20 text-right text-sm tabular-nums text-ink">{formatPrice(order.totalAmount)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink">Stock</h2>
          <div className="mt-4 rounded-md border border-line bg-paper-soft p-5">
            <p className="font-display text-4xl tabular-nums text-ink">{stockPercent}%</p>
            <p className="text-sm text-ink-soft">of the menu is available</p>

            <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-danger/20">
              <div className="bg-olive" style={{ width: `${stockPercent}%` }} />
            </div>

            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="flex items-center gap-2 text-ink-soft">
                  <span className="h-2 w-2 rounded-full bg-olive" />
                  In stock
                </dt>
                <dd className="tabular-nums text-ink">{inStock}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-2 text-ink-soft">
                  <span className="h-2 w-2 rounded-full bg-danger" />
                  Out of stock
                </dt>
                <dd className="tabular-nums text-ink">{outOfStock}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </>
  );
}
