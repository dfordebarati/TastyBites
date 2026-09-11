import { formatPrice } from '../../lib/format';

export default function OrderTotals({ totals, className = '' }) {
  const rows = [
    ['Subtotal', formatPrice(totals.subtotal)],
    ['Delivery', totals.deliveryFee === 0 ? 'Free' : formatPrice(totals.deliveryFee)],
    ['GST (5%)', formatPrice(totals.tax)],
  ];

  return (
    <dl className={`space-y-2 text-sm ${className}`}>
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4">
          <dt className="text-ink-soft">{label}</dt>
          <dd className="tabular-nums text-ink">{value}</dd>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-line pt-3 text-base font-medium">
        <dt className="text-ink">Total</dt>
        <dd className="tabular-nums text-ink">{formatPrice(totals.totalAmount)}</dd>
      </div>
    </dl>
  );
}
