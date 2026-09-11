import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import QuantityStepper from './QuantityStepper';
import { formatPrice } from '../lib/format';
import { optimize } from '../lib/image';

export default function MenuCard({ item }) {
  const { quantityOf, addItem, setQuantity } = useCart();
  const soldOut = !item.availability;
  const inCart = quantityOf(item._id);
  const detailsUrl = `/menu/${item._id}`;

  return (
    <article className="group flex flex-col">
      <Link to={detailsUrl} tabIndex={-1} className="relative block aspect-4/3 overflow-hidden rounded-md bg-line">
        {item.image ? (
          <img
            src={optimize(item.image, 'c_fill,w_720,h_540')}
            alt={item.name}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
              soldOut ? 'opacity-80 grayscale-60' : ''
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-lg italic text-ink-faint">
            No photo yet
          </div>
        )}

        {soldOut && (
          <span className="absolute left-3 top-3 rounded-sm bg-paper px-2 py-1 text-[0.7rem] font-medium uppercase tracking-wider text-danger">
            Sold out
          </span>
        )}
      </Link>

      <div className="mt-4 flex items-baseline gap-3">
        <h4 className="font-display text-xl leading-snug text-ink">{item.name}</h4>
        <span aria-hidden="true" className="mb-1 min-w-4 flex-1 border-b border-dotted border-ink/30" />
        <span className="font-medium tabular-nums text-ink">{formatPrice(item.price)}</span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Link
          to={detailsUrl}
          className="inline-flex items-center rounded-md border border-ink/20 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          View
        </Link>

        {soldOut ? (
          <span className="text-sm text-ink-faint">Sold out today</span>
        ) : inCart > 0 ? (
          <QuantityStepper
            value={inCart}
            onChange={(quantity) => setQuantity(item._id, quantity)}
            label={`Quantity of ${item.name}`}
          />
        ) : (
          <button
            type="button"
            onClick={() => addItem(item)}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-brand"
          >
            Add to cart
          </button>
        )}
      </div>
    </article>
  );
}
