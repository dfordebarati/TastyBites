import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import QuantityStepper from '../components/QuantityStepper';
import OrderTotals from '../components/orders/OrderTotals';
import { calculateTotals, FREE_DELIVERY_FROM } from '../lib/pricing';
import { formatPrice } from '../lib/format';
import { optimize } from '../lib/image';
import { buttonPrimary } from '../lib/styles';

const SUGGESTION_COUNT = 3;

function Suggestions({ excludeIds }) {
  const { addItem } = useCart();
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    api
      .get('/menu-items')
      .then(({ data }) => setDishes(data.items.filter((item) => item.availability)))
      .catch(() => {});
  }, []);

  const suggestions = dishes.filter((dish) => !excludeIds.has(dish._id)).slice(0, SUGGESTION_COUNT);
  if (suggestions.length === 0) return null;

  return (
    <section className="mt-16 border-t border-line pt-10">
      <h2 className="font-display text-2xl text-ink">You might also like</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {suggestions.map((dish) => (
          <div key={dish._id} className="flex gap-4">
            <Link to={`/menu/${dish._id}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-line">
              {dish.image && (
                <img src={optimize(dish.image, 'c_fill,w_160,h_160')} alt={dish.name} className="h-full w-full object-cover" />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/menu/${dish._id}`} className="block truncate font-medium text-ink transition-colors hover:text-brand">
                {dish.name}
              </Link>
              <p className="text-sm tabular-nums text-ink-faint">{formatPrice(dish.price)}</p>
              <button onClick={() => addItem(dish)} className="mt-1.5 text-sm font-medium text-brand hover:underline">
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Cart() {
  const { items, count, hasUnavailable, setQuantity, removeItem, refreshFromMenu } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    refreshFromMenu().catch(() => {});
  }, [refreshFromMenu]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <p className="font-display text-4xl text-ink">Your cart is empty</p>
        <p className="mt-3 text-ink-soft">Pick a few dishes from today's menu and they will show up here.</p>
        <Link to="/#menu" className={`${buttonPrimary} mt-8 px-6`}>
          Browse the menu
        </Link>
      </div>
    );
  }

  const totals = calculateTotals(items);
  const toFreeDelivery = FREE_DELIVERY_FROM - totals.subtotal;
  const checkoutLink = user ? '/checkout' : `/login?redirect=${encodeURIComponent('/checkout')}`;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
      <h1 className="font-display text-5xl tracking-tight text-ink">Your cart</h1>
      <p className="mt-2 text-ink-soft">
        {count} {count === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <ul className="divide-y divide-line border-y border-line lg:col-span-7">
          {items.map((item) => (
            <li key={item._id} className="flex gap-4 py-5">
              <Link
                to={`/menu/${item._id}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-line sm:h-28 sm:w-28"
              >
                {item.image && (
                  <img
                    src={optimize(item.image, 'c_fill,w_240,h_240')}
                    alt={item.name}
                    className={`h-full w-full object-cover ${item.available === false ? 'grayscale' : ''}`}
                  />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link to={`/menu/${item._id}`} className="font-display text-xl text-ink transition-colors hover:text-brand">
                      {item.name}
                    </Link>
                    <p className="text-sm tabular-nums text-ink-faint">{formatPrice(item.price)} each</p>
                  </div>
                  <p className="font-medium tabular-nums text-ink">{formatPrice(item.price * item.quantity)}</p>
                </div>

                {item.available === false && (
                  <p className="mt-2 text-sm text-danger">Not available right now. Remove it to continue.</p>
                )}

                <div className="mt-auto flex items-center justify-between pt-3">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(quantity) => setQuantity(item._id, quantity)}
                    label={`Quantity of ${item.name}`}
                  />
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-sm text-ink-faint transition-colors hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:col-span-5 lg:pl-6">
          <div className="rounded-md border border-line bg-paper-soft p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-2xl text-ink">Order summary</h2>
            <OrderTotals totals={totals} className="mt-5" />

            {toFreeDelivery > 0 && (
              <p className="mt-4 rounded-md bg-olive/10 px-3 py-2 text-sm text-olive">
                Add {formatPrice(toFreeDelivery)} more for free delivery.
              </p>
            )}

            {hasUnavailable ? (
              <p className="mt-6 text-sm text-danger">Remove the unavailable dishes to continue.</p>
            ) : (
              <Link to={checkoutLink} className={`${buttonPrimary} mt-6 w-full`}>
                {user ? 'Proceed to checkout' : 'Log in to check out'}
              </Link>
            )}

            <Link to="/#menu" className="mt-4 block text-center text-sm text-ink-soft transition-colors hover:text-ink">
              Add more dishes
            </Link>
          </div>
        </aside>
      </div>

      <Suggestions excludeIds={new Set(items.map((item) => item._id))} />
    </div>
  );
}
