import { ORDER_STEPS, STATUS_LABELS } from '../../lib/orders';

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="m5 10.5 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StatusTracker({ status, className = '' }) {
  if (status === 'cancelled') {
    return (
      <p className={`rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger ${className}`}>
        This order was cancelled and will not be delivered.
      </p>
    );
  }

  const current = ORDER_STEPS.indexOf(status);

  return (
    <ol className={`grid grid-cols-4 ${className}`}>
      {ORDER_STEPS.map((step, index) => {
        const done = index < current || status === 'delivered';
        const active = index === current && status !== 'delivered';

        return (
          <li key={step} className="relative flex flex-col items-center text-center">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 rounded-full ${
                  index <= current ? 'bg-brand' : 'bg-line'
                }`}
              />
            )}

            <span
              className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-xs font-medium ${
                done
                  ? 'bg-brand text-paper'
                  : active
                    ? 'bg-paper-soft text-brand ring-2 ring-brand'
                    : 'bg-paper-soft text-ink-faint ring-1 ring-line'
              }`}
            >
              {done ? <CheckIcon /> : active ? <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand" /> : index + 1}
            </span>

            <span
              className={`mt-3 px-1 text-xs sm:text-sm ${
                active ? 'font-medium text-ink' : done ? 'text-ink-soft' : 'text-ink-faint'
              }`}
            >
              {STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
