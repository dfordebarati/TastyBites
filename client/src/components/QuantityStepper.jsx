import { MAX_QUANTITY } from '../lib/pricing';

const buttonClass =
  'grid h-9 w-9 place-items-center text-lg leading-none text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40';

export default function QuantityStepper({ value, onChange, label = 'Quantity' }) {
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-md border border-ink/20 bg-paper-soft">
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Remove one" className={buttonClass}>
        &minus;
      </button>
      <span aria-live="polite" className="min-w-7 text-center text-sm font-medium tabular-nums text-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        aria-label="Add one"
        className={buttonClass}
      >
        +
      </button>
    </div>
  );
}
