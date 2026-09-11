import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import { formatDateTime, formatPrice } from '../lib/format';
import { optimize } from '../lib/image';
import { ORDER_STEPS, isClosed } from '../lib/orders';
import { buttonPrimary, buttonSecondary } from '../lib/styles';

const cardClass = 'rounded-2xl bg-paper-soft shadow-sm shadow-ink/5';

function DishStack({ items, images }) {
  const shown = items.slice(0, 3);
  const extra = items.length - shown.length;

  return (
    <div className="flex shrink-0 -space-x-4">
      {shown.map((item) => {
        const image = images.get(item.menuItem);
        return (
          <span
            key={item.menuItem}
            className="h-12 w-12 overflow-hidden rounded-full bg-line ring-4 ring-paper-soft sm:h-14 sm:w-14"
          >
            {image && <img src={optimize(image, 'c_fill,w_120,h_120')} alt="" className="h-full w-full object-cover" />}
          </span>
        );
      })}
      {extra > 0 && (
        <span className="grid h-12 w-12 place-items-center rounded-full bg-paper text-xs font-medium text-ink-soft ring-4 ring-paper-soft sm:h-14 sm:w-14">
          +{extra}
        </span>
      )}
    </div>
  );
}

function OrderCard({ order, images }) {
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const active = !isClosed(order.status);
  const step = ORDER_STEPS.indexOf(order.status);
  const action = active ? 'Track order' : 'View details';

  return (
    <Link
      to={`/orders/${order._id}`}
      className={`group block p-5 transition-shadow hover:shadow-md hover:shadow-ink/10 sm:p-6 ${cardClass}`}
    >
      <div className="flex items-center gap-4 sm:gap-5">
        <DishStack items={order.items} images={images} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <OrderStatusBadge status={order.status} />
            <span className="text-xs text-ink-faint">{order.orderNumber}</span>
          </div>
          <p className="mt-2 truncate font-display text-xl text-ink">{order.items.map((item) => item.name).join(', ')}</p>
          <p className="mt-0.5 text-sm text-ink-soft">
            {count} {count === 1 ? 'item' : 'items'} · {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="hidden shrink-0 text-right sm:block">
          <p className="font-display text-2xl tabular-nums text-ink">{formatPrice(order.totalAmount)}</p>
          <p className="mt-1 text-sm text-brand transition-transform group-hover:translate-x-0.5">{action} &rarr;</p>
        </div>
      </div>

      {active && (
        <div className="mt-5 grid grid-cols-4 gap-1.5" aria-hidden="true">
          {ORDER_STEPS.map((value, index) => (
            <span key={value} className={`h-1.5 rounded-full ${index <= step ? 'bg-brand' : 'bg-line'}`} />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between sm:hidden">
        <p className="font-display text-xl tabular-nums text-ink">{formatPrice(order.totalAmount)}</p>
        <p className="text-sm text-brand">{action} &rarr;</p>
      </div>
    </Link>
  );
}

function OrderGroup({ title, orders, images }) {
  if (orders.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <div className="mt-5 space-y-4">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} images={images} />
        ))}
      </div>
    </section>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [images, setImages] = useState(new Map());
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders/mine')
      .then(({ data }) => setOrders(data.orders))
      .catch(() => setError('Could not load your orders. Please try again.'));

    api
      .get('/menu-items')
      .then(({ data }) => setImages(new Map(data.items.map((dish) => [dish._id, dish.image]))))
      .catch(() => {});
  }, []);

  if (error) return <p className="py-32 text-center text-ink-soft">{error}</p>;
  if (!orders) return <Loader />;

  const inProgress = orders.filter((order) => !isClosed(order.status));
  const past = orders.filter((order) => isClosed(order.status));

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tight text-ink">Your orders</h1>
          <p className="mt-2 text-ink-soft">
            {orders.length
              ? `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} so far. Open one to see where it is.`
              : 'Everything you order will show up here.'}
          </p>
        </div>
        {orders.length > 0 && (
          <Link to="/#menu" className={buttonSecondary}>
            Order something else
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <div className={`mt-12 px-6 py-16 text-center ${cardClass}`}>
          <p className="font-display text-3xl text-ink">No orders yet</p>
          <p className="mx-auto mt-2 max-w-sm text-ink-soft">
            Once you place an order you can follow it here, from our kitchen to your door.
          </p>
          <Link to="/#menu" className={`${buttonPrimary} mt-8 px-6`}>
            Browse the menu
          </Link>
        </div>
      ) : (
        <div className="mt-12 space-y-12">
          <OrderGroup title="In progress" orders={inProgress} images={images} />
          <OrderGroup title="Past orders" orders={past} images={images} />
        </div>
      )}
    </div>
  );
}
