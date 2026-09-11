import { formatPrice } from '../../lib/format';

export default function OrderItemsList({ items, className = '' }) {
  return (
    <ul className={`divide-y divide-line border-y border-line text-sm ${className}`}>
      {items.map((item) => (
        <li key={item.menuItem} className="flex justify-between gap-4 py-3">
          <span className="text-ink">
            <span className="tabular-nums text-ink-faint">{item.quantity} &times;</span> {item.name}
          </span>
          <span className="tabular-nums text-ink">{formatPrice(item.price * item.quantity)}</span>
        </li>
      ))}
    </ul>
  );
}
