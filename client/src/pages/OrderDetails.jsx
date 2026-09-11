import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import DeleteButton from '../components/DeleteButton';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import StatusTracker from '../components/orders/StatusTracker';
import { formatDateTime, formatPrice } from '../lib/format';
import { optimize } from '../lib/image';
import { googleMapsUrl, mapEmbedUrl } from '../lib/maps';
import { PAYMENT_HINTS, PAYMENT_LABELS, STATUS_DESCRIPTIONS, STATUS_HEADLINES, isClosed } from '../lib/orders';

const DELIVERY_MINUTES = 40;
const cardClass = 'rounded-2xl bg-paper-soft p-6 shadow-sm shadow-ink/5 sm:p-8';

const formatTime = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

const timingFor = (order) => {
  if (order.status === 'delivered') return ['Delivered at', formatTime(order.updatedAt)];
  if (order.status === 'cancelled') return ['Cancelled at', formatTime(order.updatedAt)];
  const expected = new Date(order.createdAt).getTime() + DELIVERY_MINUTES * 60 * 1000;
  return ['Expected by', formatTime(expected)];
};

const paymentNote = (order) => {
  if (order.status === 'delivered') return `Paid ${formatPrice(order.totalAmount)} on delivery.`;
  if (order.status === 'cancelled') return 'Nothing to pay for a cancelled order.';
  return `${PAYMENT_HINTS[order.paymentMethod]} Keep ${formatPrice(order.totalAmount)} ready.`;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="m5 10.5 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [images, setImages] = useState(new Map());
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const closed = order ? isClosed(order.status) : false;

  // Keeps checking for status updates from the kitchen until the order is delivered or cancelled
  useEffect(() => {
    if (closed) return;
    let ignore = false;

    const load = () =>
      api
        .get(`/orders/${id}`)
        .then(({ data }) => {
          if (!ignore) setOrder(data.order);
        })
        .catch(() => {
          if (!ignore) setError("We couldn't find that order.");
        });

    load();
    const timer = setInterval(load, 15000);

    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, [id, closed]);

  useEffect(() => {
    api
      .get('/menu-items')
      .then(({ data }) => setImages(new Map(data.items.map((dish) => [dish._id, dish.image]))))
      .catch(() => {});
  }, []);

  const cancelOrder = async () => {
    setActionError('');
    try {
      const { data } = await api.patch(`/orders/${id}/cancel`);
      setOrder(data.order);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not cancel this order.');
    }
  };

  if (error) {
    return (
      <div className="py-32 text-center">
        <p className="font-display text-3xl text-ink">{error}</p>
        <Link to="/orders" className="mt-4 inline-block text-sm text-brand underline underline-offset-4">
          See all your orders
        </Link>
      </div>
    );
  }

  if (!order) return <Loader />;

  const [timingLabel, timingValue] = timingFor(order);
  const { address } = order;
  const pin = address.location?.lat != null && address.location?.lng != null ? address.location : null;
  const bill = [
    ['Subtotal', formatPrice(order.subtotal)],
    ['Delivery', order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)],
    ['GST (5%)', formatPrice(order.tax)],
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
      <Link to="/orders" className="text-sm text-ink-faint transition-colors hover:text-ink">
        &larr; Your orders
      </Link>

      <section className={`mt-6 ${cardClass}`}>
        {location.state?.justPlaced && order.status === 'placed' && (
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-olive/10 px-3 py-1.5 text-sm font-medium text-olive">
            <CheckIcon />
            Order confirmed. Thank you!
          </p>
        )}

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <span className="text-sm text-ink-faint">Order {order.orderNumber}</span>
            </div>
            <h1 className="mt-4 font-display text-4xl tracking-tight text-ink sm:text-5xl">
              {STATUS_HEADLINES[order.status]}
            </h1>
            <p className="mt-3 max-w-lg text-ink-soft">{STATUS_DESCRIPTIONS[order.status]}</p>
          </div>

          <div className="shrink-0 rounded-xl bg-paper px-5 py-4 sm:min-w-40 sm:text-right">
            <p className="text-xs text-ink-faint">{timingLabel}</p>
            <p className="mt-1 font-display text-3xl tabular-nums text-ink">{timingValue}</p>
            <p className="mt-1 text-xs text-ink-faint">Placed {formatDateTime(order.createdAt)}</p>
          </div>
        </div>

        {order.status !== 'cancelled' && <StatusTracker status={order.status} className="mt-10" />}

        {order.status === 'placed' && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3 text-sm">
            <span className={actionError ? 'text-danger' : 'text-ink-soft'}>
              {actionError || 'Changed your mind? You can cancel until the kitchen starts cooking.'}
            </span>
            <DeleteButton
              onConfirm={cancelOrder}
              label="Cancel order"
              confirmLabel="Yes, cancel it"
              busyLabel="Cancelling..."
              triggerClassName="rounded-lg bg-paper-soft px-4 py-2 text-sm font-medium text-ink shadow-sm shadow-ink/5 transition-colors hover:text-danger"
            />
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-5 lg:items-start">
        <div className="space-y-6 lg:col-span-3">
          <section className={cardClass}>
            <h2 className="font-display text-2xl text-ink">Your items</h2>

            <ul className="mt-6 space-y-4">
              {order.items.map((item) => {
                const image = images.get(item.menuItem);
                return (
                  <li key={item.menuItem} className="flex items-center gap-4">
                    <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-line">
                      {image && (
                        <img src={optimize(image, 'c_fill,w_160,h_160')} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{item.name}</p>
                      <p className="text-sm tabular-nums text-ink-faint">
                        {item.quantity} &times; {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="tabular-nums text-ink">{formatPrice(item.price * item.quantity)}</p>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-8 space-y-2.5 rounded-xl bg-paper p-5 text-sm">
              {bill.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-ink-soft">{label}</dt>
                  <dd className="tabular-nums text-ink">{value}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 pt-3">
                <dt className="font-medium text-ink">Total</dt>
                <dd className="font-display text-2xl tabular-nums text-ink">{formatPrice(order.totalAmount)}</dd>
              </div>
            </dl>
          </section>

          <section className={cardClass}>
            <h2 className="font-display text-2xl text-ink">Payment</h2>
            <p className="mt-4 font-medium text-ink">{PAYMENT_LABELS[order.paymentMethod]}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{paymentNote(order)}</p>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-2">
          <section className={cardClass}>
            <h2 className="font-display text-2xl text-ink">Delivery</h2>

            {pin && (
              <div className="mt-5 overflow-hidden rounded-xl bg-line">
                <iframe
                  title="Delivery location"
                  src={mapEmbedUrl(pin)}
                  loading="lazy"
                  className="pointer-events-none h-40 w-full"
                />
              </div>
            )}

            <div className="mt-5 space-y-0.5 text-sm leading-relaxed text-ink-soft">
              <p className="font-medium text-ink">{order.customerName}</p>
              <p>
                {address.line1}, {address.line2}
              </p>
              {address.landmark && <p>{address.landmark}</p>}
              <p>
                {address.city}, {address.state} {address.pincode}
              </p>
              <a href={`tel:+91${order.phone}`} className="inline-block pt-1 text-ink transition-colors hover:text-brand">
                +91 {order.phone}
              </a>
            </div>

            {order.instructions && (
              <p className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-soft">&ldquo;{order.instructions}&rdquo;</p>
            )}

            {pin && (
              <a
                href={googleMapsUrl(pin)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
              >
                Open in Google Maps &#8599;
              </a>
            )}
          </section>

          <p className="px-2 text-sm text-ink-soft">
            Need help with this order? Call us on{' '}
            <a href="tel:+919830012345" className="font-medium text-ink transition-colors hover:text-brand">
              +91 98300 12345
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
