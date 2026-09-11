import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function AuthLayout({ eyebrow, title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-screen flex-col px-5 py-8 sm:px-8">
      <Link to="/" aria-label="TastyBites home" className="self-center">
        <Logo size="lg" />
      </Link>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
        <div className="rounded-xl bg-paper-soft p-8 shadow-sm ring-1 ring-line sm:p-10">
          {eyebrow && <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand">{eyebrow}</p>}
          <h1 className={`font-display text-4xl tracking-tight text-ink ${eyebrow ? 'mt-2' : ''}`}>{title}</h1>
          {subtitle && <p className="mt-3 leading-relaxed text-ink-soft">{subtitle}</p>}

          <div className="mt-8">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
      </div>
    </div>
  );
}
