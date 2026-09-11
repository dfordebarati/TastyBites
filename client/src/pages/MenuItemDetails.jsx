import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import MenuCard from '../components/MenuCard';
import QuantityStepper from '../components/QuantityStepper';
import { useCart } from '../context/CartContext';
import { CATEGORY_LABELS, formatPrice } from '../lib/format';
import { optimize } from '../lib/image';
import { buttonPrimary } from '../lib/styles';

function DetailRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

export default function MenuItemDetails() {
  const { id } = useParams();
  const { addItem, quantityOf, setQuantity: setCartQuantity } = useCart();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    setRelated([]);
    setQuantity(1);

    api
      .get(`/menu-items/${id}`)
      .then(({ data }) => {
        if (ignore) return;
        setItem(data.item);
        setLoading(false);

        api
          .get('/menu-items', { params: { category: data.item.category } })
          .then((res) => {
            if (!ignore) setRelated(res.data.items.filter((other) => other._id !== id).slice(0, 3));
          })
          .catch(() => {});
      })
      .catch(() => {
        if (ignore) return;
        setError("We couldn't find that dish. It may have been taken off the menu.");
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <p className="font-display text-3xl text-ink">{error}</p>
        <Link to="/#menu" className={`${buttonPrimary} mt-8`}>
          Back to the menu
        </Link>
      </div>
    );
  }

  const soldOut = !item.availability;
  const courseLabel = CATEGORY_LABELS[item.category] ?? item.category;
  const inCart = quantityOf(item._id);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
      <nav className="text-sm text-ink-faint">
        <Link to="/#menu" className="transition-colors hover:text-ink">
          Menu
        </Link>
        <span className="mx-2">/</span>
        <span>{courseLabel}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="aspect-4/3 overflow-hidden rounded-md bg-line">
            {item.image ? (
              <img
                src={optimize(item.image, 'c_fill,w_1200,h_900')}
                alt={item.name}
                className={`h-full w-full object-cover ${soldOut ? 'grayscale-40' : ''}`}
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-xl italic text-ink-faint">
                No photo yet
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 lg:pt-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand">{item.category}</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.02] tracking-tight text-ink">{item.name}</h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">{item.description}</p>

          <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
            <DetailRow label="Price">
              <span className="font-display text-2xl tabular-nums">{formatPrice(item.price)}</span>
            </DetailRow>
            <DetailRow label="Category">{item.category}</DetailRow>
            <DetailRow label="Availability">
              <span className={`inline-flex items-center gap-2 font-medium ${soldOut ? 'text-danger' : 'text-olive'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${soldOut ? 'bg-danger' : 'bg-olive'}`} />
                {soldOut ? 'Out of stock' : 'In stock'}
              </span>
            </DetailRow>
          </dl>

          {soldOut ? (
            <p className="mt-8 rounded-md bg-danger/10 px-4 py-3 text-sm text-danger">
              This dish is sold out for today. Please check back tomorrow.
            </p>
          ) : inCart > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <QuantityStepper
                value={inCart}
                onChange={(next) => setCartQuantity(item._id, next)}
                label={`Quantity of ${item.name}`}
              />
              <Link to="/cart" className="text-sm font-medium text-brand underline underline-offset-4">
                In your cart · {formatPrice(item.price * inCart)}
              </Link>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <QuantityStepper value={quantity} onChange={(next) => setQuantity(Math.max(1, next))} />
              <button onClick={() => addItem(item, quantity)} className={`${buttonPrimary} px-6`}>
                Add to cart · {formatPrice(item.price * quantity)}
              </button>
            </div>
          )}

          <Link to="/#menu" className="mt-6 inline-block text-sm text-ink-soft transition-colors hover:text-ink">
            &larr; Back to the menu
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-10">
          <h2 className="font-display text-3xl text-ink">More {courseLabel.toLowerCase()}</h2>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((other) => (
              <MenuCard key={other._id} item={other} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
